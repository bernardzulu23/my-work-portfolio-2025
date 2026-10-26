import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SecurityService } from './security.service';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
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
  private readonly STORAGE_KEY = 'auth_user';
  private readonly TOKEN_KEY = 'auth_token';
  private http = inject(HttpClient);
  
  private _user = signal<AuthUser | null>(null);
  private _loading = signal(false);

  // Public signals
  user = this._user.asReadonly();
  loading = this._loading.asReadonly();

  // Computed values
  isAuthenticated = computed<boolean>(() => this._user() !== null);
  isAdmin = computed<boolean>(() => this._user()?.role === 'admin');

  // BehaviorSubjects for backward compatibility
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Observable streams
  user$ = this.userSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(
    private router: Router,
    private securityService: SecurityService
  ) {
    this.initializeAuth();
  }

  private initializeAuth() {
    // Check for existing session
    const savedUser = localStorage.getItem(this.STORAGE_KEY);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this._user.set(user);
        this.userSubject.next(user);
      } catch (e) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
    this._loading.set(false);
    this.loadingSubject.next(false);
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      this._loading.set(true);
      this.loadingSubject.next(true);

      // Sanitize inputs
      const sanitizedEmail = this.securityService.sanitizeInput(email);
      const sanitizedPassword = this.securityService.sanitizeInput(password);

      // Check for XSS attempts
      if (this.securityService.detectXSSAttempt(sanitizedEmail) ||
          this.securityService.detectXSSAttempt(sanitizedPassword)) {
        this.securityService.logSecurityEvent({
          type: 'xss_attempt',
          timestamp: new Date(),
          details: `XSS attempt detected in login for email: ${sanitizedEmail}`
        });
        return { success: false, error: 'Invalid input detected' };
      }

      // Validate email format
      if (!this.securityService.validateEmail(sanitizedEmail)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Validate password strength
      /*
      const passwordValidation = this.securityService.validatePasswordStrength(sanitizedPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: 'Password does not meet security requirements' };
      }
      */

      // Get client identifier
      const clientIdentifier = this.getClientIdentifier();

      // Check rate limiting
      if (this.securityService.isRateLimited(clientIdentifier)) {
        const status = this.securityService.getRateLimitStatus(clientIdentifier);
        if (status.isBlocked) {
          return {
            success: false,
            error: `Too many failed attempts. Try again after ${this.formatTime(status.blockedUntil!)}`
          };
        }
      }

      // Authenticate via API
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; error?: string; user?: AuthUser; token?: string }>(
          `${environment.apiUrl}/auth/login`,
          { email: sanitizedEmail, password: sanitizedPassword }
        )
      );

      if (!response.success || !response.user) {
        this.securityService.recordLoginAttempt(clientIdentifier, false);
        return { success: false, error: response.error || 'Invalid email or password' };
      }

      if (response.user.role !== 'admin') {
        this.securityService.recordLoginAttempt(clientIdentifier, false);
        return { success: false, error: 'Access denied. Admin privileges required.' };
      }

      const authUser: AuthUser = response.user;

      this._user.set(authUser);
      this.userSubject.next(authUser);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser));
      if (response.token) {
        localStorage.setItem(this.TOKEN_KEY, response.token);
      }

      // Record successful login
      this.securityService.recordLoginAttempt(clientIdentifier, true);

      // Log successful admin login
      this.securityService.logSecurityEvent({
        type: 'login_attempt',
        timestamp: new Date(),
        details: `Successful admin login for ${sanitizedEmail}`
      });

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
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

      this._user.set(null);
      this.userSubject.next(null);
      
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
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

  // Admin check methods
  canAccessAdmin(): boolean {
    return this.isAuthenticated() && this.isAdmin();
  }

  requireAdmin(): void {
    if (!this.canAccessAdmin()) {
      this.router.navigate(['/login']);
    }
  }

  // Set admin role for current user
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

  // Utility methods
  getUserEmail(): string | null {
    return this._user()?.email || null;
  }

  getUserId(): string | null {
    return this._user()?.id || null;
  }

  private getClientIdentifier(): string {
    return btoa(navigator.userAgent).substring(0, 16);
  }

  private formatTime(date: Date): string {
    const diff = Math.ceil((date.getTime() - Date.now()) / 1000 / 60);
    return `${diff} minutes`;
  }
}
