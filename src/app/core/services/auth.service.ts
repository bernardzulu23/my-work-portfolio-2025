import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from './security.service';
import { BehaviorSubject } from 'rxjs';

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
  private readonly USERS_KEY = 'app_users';
  
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
      const passwordValidation = this.securityService.validatePasswordStrength(sanitizedPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: 'Password does not meet security requirements' };
      }

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

      // Get stored users
      const users = this.getStoredUsers();
      const user = users.find(u => u.email === sanitizedEmail);

      if (!user) {
        this.securityService.recordLoginAttempt(clientIdentifier, false);
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password (in production, use proper hashing)
      const isValidPassword = this.verifyPassword(sanitizedPassword, user.password);
      
      if (!isValidPassword) {
        this.securityService.recordLoginAttempt(clientIdentifier, false);
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if user is admin
      if (user.role !== 'admin') {
        this.securityService.recordLoginAttempt(clientIdentifier, false);
        return { success: false, error: 'Access denied. Admin privileges required.' };
      }

      // Create session
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      };

      this._user.set(authUser);
      this.userSubject.next(authUser);
      
      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser));

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

      this._user.set(null);
      this.userSubject.next(null);
      
      localStorage.removeItem(this.STORAGE_KEY);
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

      // Validate email
      if (!this.securityService.validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Validate password
      const passwordValidation = this.securityService.validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.errors[0] || 'Password does not meet security requirements' };
      }

      // Check if user exists
      const users = this.getStoredUsers();
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'User already exists' };
      }

      // Hash password (simple base64 for demo - use bcrypt in production)
      const hashedPassword = this.hashPassword(password);

      // Create new user
      const newUser = {
        id: this.generateId(),
        email,
        password: hashedPassword,
        role,
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

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
    // In a real app, this would send an email
    // For demo, just return success
    return { success: true };
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

    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    users[userIndex].role = 'admin';
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    const updatedUser: AuthUser = {
      ...user,
      role: 'admin'
    };

    this._user.set(updatedUser);
    this.userSubject.next(updatedUser);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));

    return { success: true };
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

  private getStoredUsers(): any[] {
    const users = localStorage.getItem(this.USERS_KEY);
    if (!users) {
      // Create default admin user
      const defaultUsers = [{
        id: 'admin-1',
        email: 'admin@bernardzulu.com',
        password: this.hashPassword('admin123'),
        role: 'admin',
        created_at: new Date().toISOString()
      }];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(users);
  }

  private hashPassword(password: string): string {
    // Simple hash for demo - use bcrypt in production
    return btoa(password + '_salt_bernard');
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
