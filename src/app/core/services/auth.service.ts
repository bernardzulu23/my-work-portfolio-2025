import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseClient, User, Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { SecurityService } from './security.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  created_at: string;
  updated_at: string;
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
  private supabase: SupabaseClient;
  private _user = signal<AuthUser | null>(null);
  private _session = signal<Session | null>(null);
  private _loading = signal(true);

  // Public signals
  user = this._user.asReadonly();
  session = this._session.asReadonly();
  loading = this._loading.asReadonly();

  // Computed values
  isAuthenticated = computed<boolean>(() => this._user() !== null);
  isAdmin = computed<boolean>(() => this._user()?.role === 'admin');

  // BehaviorSubjects for backward compatibility
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(true);

  // Observable streams with proper typing
  user$ = this.userSubject.asObservable();
  session$ = this.sessionSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private securityService: SecurityService
  ) {
    this.supabase = this.supabaseService.client;
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Get initial session
      const { data: { session }, error } = await this.supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        this._loading.set(false);
        this.loadingSubject.next(false);
        return;
      }

      if (session) {
        await this.setSession(session);
      } else {
        this._loading.set(false);
        this.loadingSubject.next(false);
      }

      // Listen for auth changes
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        if (session) {
          await this.setSession(session);
        } else {
          this.clearSession();
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      this._loading.set(false);
      this.loadingSubject.next(false);
    }
  }

  private async setSession(session: Session) {
    try {
      const user = session.user;

      // Fetch role from profiles table instead of user_metadata
      const { data: profileData, error: profileError } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user role from profiles:', profileError);
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email!,
        role: profileData?.role || 'user',
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at
      };

      this._user.set(authUser);
      this._session.set(session);
      this.userSubject.next(authUser);
      this.sessionSubject.next(session);
    } catch (error) {
      console.error('Error setting session:', error);
    } finally {
      this._loading.set(false);
      this.loadingSubject.next(false);
    }
  }

  private clearSession() {
    this._user.set(null);
    this._session.set(null);
    this.userSubject.next(null);
    this.sessionSubject.next(null);
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
      const passwordValidation = this.securityService.validatePasswordStrength(sanitizedPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: 'Password does not meet security requirements' };
      }

      // Get client identifier (in production, this would be the real IP)
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

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword
      });

      if (error) {
        // Record failed attempt
        this.securityService.recordLoginAttempt(clientIdentifier, false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Check if user has admin role
        const userRole = data.user.user_metadata?.['role'];
        if (userRole !== 'admin') {
          await this.signOut();
          this.securityService.recordLoginAttempt(clientIdentifier, false);
          return { success: false, error: 'Access denied. Admin privileges required.' };
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
      }

      // Record failed attempt for unknown reason
      this.securityService.recordLoginAttempt(clientIdentifier, false);
      return { success: false, error: 'Login failed' };
    } catch (error: unknown) {
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

      const { error } = await this.supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
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

  async signUp(email: string, password: string, role: string = 'user'): Promise<{ success: boolean; error?: string }> {
    try {
      this._loading.set(true);
      this.loadingSubject.next(true);

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      this._loading.set(false);
      this.loadingSubject.next(false);
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
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

  // Utility methods
  getUserEmail(): string | null {
    return this._user()?.email || null;
  }

  getUserId(): string | null {
    return this._user()?.id || null;
  }

  private getClientIdentifier(): string {
    // In a real application, this would be provided by the server
    // For demo purposes, we'll use a hash of the user agent
    return btoa(navigator.userAgent).substring(0, 16);
  }

  private formatTime(date: Date): string {
    const diff = Math.ceil((date.getTime() - Date.now()) / 1000 / 60);
    return `${diff} minutes`;
  }
}
