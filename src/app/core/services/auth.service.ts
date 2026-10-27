import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration
} from '@simplewebauthn/browser';
import { SecurityService } from './security.service';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MfaMethods {
  totp: boolean;
  passkey: boolean;
  recovery: boolean;
}

export interface MfaSummary {
  enrolled: boolean;
  totpEnabled: boolean;
  passkeyCount: number;
}

export interface MfaPasskey {
  id: string;
  name: string;
  createdAt: string;
}

export interface MfaStatus {
  enrolled: boolean;
  totpEnabled: boolean;
  passkeyCount: number;
  recoveryRemaining: number;
  passkeys: MfaPasskey[];
  methods: MfaMethods;
}

export interface AuthResult {
  success: boolean;
  mfaRequired?: boolean;
  methods?: MfaMethods;
  error?: string;
  recoveryCodes?: string[] | null;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  mustChangePassword?: boolean;
  setupRequired?: boolean;
  mfa?: MfaSummary;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private pendingMfaToken: string | null = null;
  private http = inject(HttpClient);
  
  private _user = signal<AuthUser | null>(null);
  private _loading = signal(false);
  private _sessionValidated = signal(false);

  user = this._user.asReadonly();
  loading = this._loading.asReadonly();
  sessionValidated = this._sessionValidated.asReadonly();

  isAuthenticated = computed<boolean>(() => this._user() !== null);
  isAdmin = computed<boolean>(() => this._user()?.role === 'admin');

  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  user$ = this.userSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(
    private router: Router,
    private securityService: SecurityService
  ) {
    void this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      await this.validateSession();
    } finally {
      this._sessionValidated.set(true);
    }
  }

  async validateSession(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ success: boolean; user?: AuthUser }>(`${environment.apiUrl}/auth/me`)
      );

      if (!response.success || !response.user || response.user.role !== 'admin') {
        this.clearSession();
        return false;
      }

      this._user.set(response.user);
      this.userSubject.next(response.user);
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  supportsPasskeys(): boolean {
    try {
      return browserSupportsWebAuthn();
    } catch {
      return false;
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      this._loading.set(true);
      this.loadingSubject.next(true);

      const sanitizedEmail = this.securityService.sanitizeInput(email);

      if (this.securityService.detectXSSAttempt(sanitizedEmail)) {
        this.securityService.logSecurityEvent({
          type: 'xss_attempt',
          timestamp: new Date(),
          details: 'XSS attempt detected in login'
        });
        return { success: false, error: 'Invalid input detected' };
      }

      if (!this.securityService.validateEmail(sanitizedEmail)) {
        return { success: false, error: 'Invalid email or password' };
      }

      const clientIdentifier = this.securityService.generateClientId();

      if (this.securityService.isRateLimited(clientIdentifier)) {
        const status = this.securityService.getRateLimitStatus(clientIdentifier);
        if (status.isBlocked) {
          return {
            success: false,
            error: `Too many failed attempts. Try again after ${this.formatTime(status.blockedUntil!)}`
          };
        }
      }

      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          error?: string;
          user?: AuthUser;
          mfaRequired?: boolean;
          mfaToken?: string;
          methods?: MfaMethods;
        }>(
          `${environment.apiUrl}/auth/login`,
          { email: sanitizedEmail, password }
        )
      );

      if (response.mfaRequired && response.mfaToken) {
        this.pendingMfaToken = response.mfaToken;
        this.securityService.recordLoginAttempt(clientIdentifier, true, sanitizedEmail);
        return { success: true, mfaRequired: true, methods: response.methods };
      }

      if (!response.success || !response.user) {
        this.securityService.recordLoginAttempt(clientIdentifier, false, sanitizedEmail);
        return { success: false, error: 'Invalid email or password' };
      }

      if (response.user.role !== 'admin') {
        this.securityService.recordLoginAttempt(clientIdentifier, false, sanitizedEmail);
        return { success: false, error: 'Invalid email or password' };
      }

      this.applySession(response.user);
      this.securityService.recordLoginAttempt(clientIdentifier, true, sanitizedEmail);
      this.securityService.logSecurityEvent({
        type: 'login_attempt',
        timestamp: new Date(),
        details: 'Successful admin login'
      });

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: this.readError(error, 'Invalid email or password') };
    } finally {
      this._loading.set(false);
      this.loadingSubject.next(false);
    }
  }

  async signOut(): Promise<void> {
    try {
      this._loading.set(true);
      this.loadingSubject.next(true);

      try {
        await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/logout`, {}));
      } catch {
        // Ignore logout API errors — still clear local session
      }

      this.clearSession();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      this._loading.set(false);
      this.loadingSubject.next(false);
    }
  }

  async signUp(_email: string, _password: string, _role: string = 'user'): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Registration is disabled. Contact the administrator.' };
  }

  async resetPassword(_email: string): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Password reset is not available. Contact the administrator.' };
  }

  needsSetup(): boolean {
    const user = this._user();
    return Boolean(user?.mustChangePassword || user?.setupRequired);
  }

  canAccessAdmin(): boolean {
    return this.isAuthenticated() && this.isAdmin() && !this.needsSetup();
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; user?: AuthUser; error?: string }>(
          `${environment.apiUrl}/auth/password`,
          { currentPassword, newPassword }
        )
      );
      if (!response.success || !response.user) {
        return { success: false, error: response.error || 'Could not update password' };
      }
      this.applySession(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.readError(error, 'Could not update password') };
    }
  }

  async skipPasskeySetup(): Promise<AuthResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; user?: AuthUser; error?: string }>(
          `${environment.apiUrl}/auth/passkey/skip`,
          {}
        )
      );
      if (!response.success || !response.user) {
        return { success: false, error: response.error || 'Unable to skip passkey setup' };
      }
      this.applySession(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.readError(error, 'Unable to skip passkey setup') };
    }
  }

  requireAdmin(): void {
    if (!this.canAccessAdmin()) {
      this.router.navigate(['/login']);
    }
  }

  async setAdminRole(): Promise<{ success: boolean; error?: string }> {
    const user = this._user();
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    if (user.role === 'admin') {
      return { success: true };
    }

    return { success: false, error: 'Admin role can only be assigned by the server.' };
  }

  getUserEmail(): string | null {
    return this._user()?.email || null;
  }

  getUserId(): string | null {
    return this._user()?.id || null;
  }

  cancelMfa(): void {
    this.pendingMfaToken = null;
  }

  async verifyMfaCode(code: string, method: 'totp' | 'recovery' = 'totp'): Promise<AuthResult> {
    if (!this.pendingMfaToken) {
      return { success: false, error: 'Verification expired. Sign in again.' };
    }

    try {
      this._loading.set(true);
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; user?: AuthUser; error?: string }>(
          `${environment.apiUrl}/auth/mfa/verify`,
          { mfaToken: this.pendingMfaToken, method, code }
        )
      );

      if (!response.success || !response.user || response.user.role !== 'admin') {
        return { success: false, error: 'Invalid email or password' };
      }

      this.applySession(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.readError(error, 'Invalid email or password') };
    } finally {
      this._loading.set(false);
    }
  }

  async loginWithPasskey(usePendingMfa = false): Promise<AuthResult> {
    if (!this.supportsPasskeys()) {
      return { success: false, error: 'This browser does not support passkeys' };
    }

    try {
      this._loading.set(true);
      const optionsResponse = await firstValueFrom(
        this.http.post<{ success: boolean; options?: unknown; challengeToken?: string; error?: string }>(
          `${environment.apiUrl}/auth/passkey/login/options`,
          usePendingMfa ? { mfaToken: this.pendingMfaToken } : {}
        )
      );

      if (!optionsResponse.success || !optionsResponse.options || !optionsResponse.challengeToken) {
        return { success: false, error: optionsResponse.error || 'Unable to start passkey sign in' };
      }

      const credential = await startAuthentication({
        optionsJSON: optionsResponse.options as Parameters<typeof startAuthentication>[0]['optionsJSON']
      });

      const response = await firstValueFrom(
        this.http.post<{ success: boolean; user?: AuthUser; error?: string }>(
          `${environment.apiUrl}/auth/passkey/login/verify`,
          {
            mfaToken: usePendingMfa ? this.pendingMfaToken : undefined,
            challengeToken: optionsResponse.challengeToken,
            credential
          }
        )
      );

      if (!response.success || !response.user || response.user.role !== 'admin') {
        return { success: false, error: 'Invalid email or password' };
      }

      this.applySession(response.user);
      return { success: true };
    } catch (error) {
      if (this.isUserCancelled(error)) {
        return { success: false, error: 'Passkey sign in was cancelled' };
      }
      return { success: false, error: this.readError(error, 'Passkey verification failed') };
    } finally {
      this._loading.set(false);
    }
  }

  async getMfaStatus(): Promise<MfaStatus | null> {
    try {
      return await firstValueFrom(
        this.http.get<MfaStatus & { success: boolean }>(`${environment.apiUrl}/auth/mfa`)
      );
    } catch {
      return null;
    }
  }

  async startTotpSetup(): Promise<{ qrDataUrl: string; secret: string; setupToken: string } | null> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          qrDataUrl: string;
          secret: string;
          setupToken: string;
        }>(`${environment.apiUrl}/auth/mfa/totp/setup`, {})
      );
      return response.success ? response : null;
    } catch {
      return null;
    }
  }

  async enableTotp(setupToken: string, code: string): Promise<AuthResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; recoveryCodes?: string[] | null; error?: string }>(
          `${environment.apiUrl}/auth/mfa/totp/enable`,
          { setupToken, code }
        )
      );
      if (!response.success) {
        return { success: false, error: response.error || 'Invalid authenticator code' };
      }
      await this.validateSession();
      return { success: true, recoveryCodes: response.recoveryCodes };
    } catch (error) {
      return { success: false, error: this.readError(error, 'Invalid authenticator code') };
    }
  }

  async disableTotp(code: string): Promise<AuthResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; error?: string }>(
          `${environment.apiUrl}/auth/mfa/totp/disable`,
          { code }
        )
      );
      if (!response.success) {
        return { success: false, error: response.error || 'Unable to disable authenticator' };
      }
      await this.validateSession();
      return { success: true };
    } catch (error) {
      return { success: false, error: this.readError(error, 'Unable to disable authenticator') };
    }
  }

  async regenerateRecoveryCodes(code: string): Promise<AuthResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; recoveryCodes?: string[]; error?: string }>(
          `${environment.apiUrl}/auth/mfa/recovery/regenerate`,
          { code }
        )
      );
      if (!response.success) {
        return { success: false, error: response.error || 'Unable to regenerate recovery codes' };
      }
      return { success: true, recoveryCodes: response.recoveryCodes };
    } catch (error) {
      return { success: false, error: this.readError(error, 'Unable to regenerate recovery codes') };
    }
  }

  async registerPasskey(name?: string): Promise<AuthResult> {
    if (!this.supportsPasskeys()) {
      return { success: false, error: 'This browser does not support passkeys' };
    }

    try {
      const optionsResponse = await firstValueFrom(
        this.http.post<{ success: boolean; options?: unknown; challengeToken?: string; error?: string }>(
          `${environment.apiUrl}/auth/passkey/register/options`,
          {}
        )
      );

      if (!optionsResponse.success || !optionsResponse.options || !optionsResponse.challengeToken) {
        return { success: false, error: optionsResponse.error || 'Unable to start passkey registration' };
      }

      const credential = await startRegistration({
        optionsJSON: optionsResponse.options as Parameters<typeof startRegistration>[0]['optionsJSON']
      });

      const response = await firstValueFrom(
        this.http.post<{ success: boolean; recoveryCodes?: string[] | null; error?: string }>(
          `${environment.apiUrl}/auth/passkey/register/verify`,
          { challengeToken: optionsResponse.challengeToken, credential, name }
        )
      );

      if (!response.success) {
        return { success: false, error: response.error || 'Could not register this passkey' };
      }

      await this.validateSession();
      return { success: true, recoveryCodes: response.recoveryCodes };
    } catch (error) {
      if (this.isUserCancelled(error)) {
        return { success: false, error: 'Passkey registration was cancelled' };
      }
      return { success: false, error: this.readError(error, 'Could not register this passkey') };
    }
  }

  async deletePasskey(id: string): Promise<AuthResult> {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/auth/passkey/${id}`));
      await this.validateSession();
      return { success: true };
    } catch (error) {
      return { success: false, error: this.readError(error, 'Unable to remove passkey') };
    }
  }

  private applySession(user: AuthUser): void {
    this.pendingMfaToken = null;
    this._user.set(user);
    this.userSubject.next(user);
  }

  private readError(error: unknown, fallback: string): string {
    return this.stringifyUserError(error, fallback);
  }

  private stringifyUserError(value: unknown, fallback: string, depth = 0): string {
    if (depth > 5) return fallback;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed || trimmed === '[object Object]') return fallback;
      return trimmed;
    }
    if (value instanceof HttpErrorResponse) {
      const fromBody = this.stringifyUserError(value.error, '', depth + 1);
      if (fromBody) return fromBody;
      return fallback;
    }
    if (value instanceof Error && value.message) {
      return this.stringifyUserError(value.message, fallback, depth + 1);
    }
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      for (const key of ['error', 'message', 'msg', 'detail']) {
        if (record[key] !== undefined) {
          const inner = this.stringifyUserError(record[key], '', depth + 1);
          if (inner) return inner;
        }
      }
    }
    return fallback;
  }

  private isUserCancelled(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const name = 'name' in error ? String(error.name) : '';
    return name === 'NotAllowedError' || name === 'AbortError';
  }

  private clearSession(): void {
    this.pendingMfaToken = null;
    this._user.set(null);
    this.userSubject.next(null);
  }

  private formatTime(date: Date): string {
    const diff = Math.ceil((date.getTime() - Date.now()) / 1000 / 60);
    return `${diff} minutes`;
  }
}
