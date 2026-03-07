// ============================================================================
// AuthService Tests - Updated for localStorage-based implementation
// File: src/app/core/services/auth.service.spec.ts
// ============================================================================

import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SecurityService } from './security.service';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let securityServiceSpy: jasmine.SpyObj<SecurityService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Create SecurityService spy with all required methods
    securityServiceSpy = jasmine.createSpyObj('SecurityService', [
      'sanitizeInput',
      'detectXSSAttempt',
      'validateEmail',
      'validatePasswordStrength',
      'isRateLimited',
      'getRateLimitStatus',
      'recordLoginAttempt',
      'logSecurityEvent'
    ]);

    // Set default return values for SecurityService
    securityServiceSpy.sanitizeInput.and.callFake((input: string) => input);
    securityServiceSpy.detectXSSAttempt.and.returnValue(false);
    securityServiceSpy.validateEmail.and.returnValue(true);
    securityServiceSpy.validatePasswordStrength.and.returnValue({
      valid: true,
      isValid: true,
      errors: [],
      score: 5,
      strength: 'strong'
    });
    securityServiceSpy.isRateLimited.and.returnValue(false);
    securityServiceSpy.getRateLimitStatus.and.returnValue({
      isLimited: false,
      isBlocked: false,
      remainingAttempts: 5
    });

    // Create Router spy
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SecurityService, useValue: securityServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ============================================================================
  // Service Creation Tests
  // ============================================================================

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have required methods', () => {
      expect(service.signIn).toBeDefined();
      expect(service.signOut).toBeDefined();
      expect(service.signUp).toBeDefined();
      expect(service.resetPassword).toBeDefined();
    });
  });

  // ============================================================================
  // Sign In Tests
  // ============================================================================

  describe('signIn', () => {
    it('should sign in successfully for admin user', async () => {
      // Set up admin user in localStorage
      const hashedPassword = btoa('ValidPass123!' + '_salt_bernard');
      const users = [{
        id: 'admin-1',
        email: 'admin@bernardzulu.com',
        password: hashedPassword,
        role: 'admin',
        created_at: new Date().toISOString()
      }];
      localStorage.setItem('app_users', JSON.stringify(users));

      const result = await service.signIn('admin@bernardzulu.com', 'ValidPass123!');
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-admin user', async () => {
      // Set up non-admin user in localStorage
      const hashedPassword = btoa('ValidPass123!' + '_salt_bernard');
      const users = [{
        id: 'user-1',
        email: 'user@example.com',
        password: hashedPassword,
        role: 'user',
        created_at: new Date().toISOString()
      }];
      localStorage.setItem('app_users', JSON.stringify(users));

      const result = await service.signIn('user@example.com', 'ValidPass123!');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Admin');
    });

    it('should reject invalid email format', async () => {
      securityServiceSpy.validateEmail.and.returnValue(false);

      const result = await service.signIn('invalid-email', 'password');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject weak passwords', async () => {
      securityServiceSpy.validatePasswordStrength.and.returnValue({
        valid: false,
        isValid: false,
        errors: ['Password too weak'],
        score: 1,
        strength: 'weak'
      });

      const result = await service.signIn('test@example.com', '123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('security requirements');
    });

    it('should detect and reject XSS attempts', async () => {
      securityServiceSpy.detectXSSAttempt.and.returnValue(true);

      const result = await service.signIn('<script>alert("xss")</script>', 'password');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input detected');
      expect(securityServiceSpy.logSecurityEvent).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'xss_attempt' })
      );
    });

    it('should check for rate limiting', async () => {
      securityServiceSpy.isRateLimited.and.returnValue(true);
      securityServiceSpy.getRateLimitStatus.and.returnValue({
        isLimited: true,
        isBlocked: true,
        blockedUntil: new Date(Date.now() + 300000),
        remainingAttempts: 0
      });

      const result = await service.signIn('test@example.com', 'ValidPass123!');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many failed attempts');
    });

    it('should reject invalid credentials', async () => {
      const result = await service.signIn('nonexistent@example.com', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email or password');
    });
  });

  // ============================================================================
  // Sign Out Tests
  // ============================================================================

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      // First sign in
      const hashedPassword = btoa('ValidPass123!' + '_salt_bernard');
      const users = [{
        id: 'admin-1',
        email: 'admin@bernardzulu.com',
        password: hashedPassword,
        role: 'admin',
        created_at: new Date().toISOString()
      }];
      localStorage.setItem('app_users', JSON.stringify(users));
      
      await service.signIn('admin@bernardzulu.com', 'ValidPass123!');
      
      // Now sign out
      await service.signOut();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  // ============================================================================
  // Sign Up Tests
  // ============================================================================

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      const result = await service.signUp('new@example.com', 'ValidPass123!', 'user');
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', async () => {
      securityServiceSpy.validateEmail.and.returnValue(false);

      const result = await service.signUp('invalid-email', 'ValidPass123!');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject weak passwords', async () => {
      securityServiceSpy.validatePasswordStrength.and.returnValue({
        valid: false,
        isValid: false,
        errors: ['Password too weak'],
        score: 1,
        strength: 'weak'
      });

      const result = await service.signUp('new@example.com', '123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Password');
    });
  });

  // ============================================================================
  // Authentication State Tests
  // ============================================================================

  describe('Authentication State', () => {
    it('should start unauthenticated', () => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });

    it('should have loading state', () => {
      expect(typeof service.loading()).toBe('boolean');
    });

    it('should expose user signals', () => {
      expect(service.user()).toBeNull();
    });
  });

  // ============================================================================
  // Admin Access Tests
  // ============================================================================

  describe('Admin Access', () => {
    it('should check admin access correctly', () => {
      expect(service.canAccessAdmin()).toBe(false);
    });

    it('should redirect non-admin users', () => {
      service.requireAdmin();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle set admin role when no user', async () => {
      const result = await service.setAdminRole();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No user logged in');
    });
  });

  // ============================================================================
  // Utility Methods Tests
  // ============================================================================

  describe('Utility Methods', () => {
    it('should return null for user email when not authenticated', () => {
      expect(service.getUserEmail()).toBeNull();
    });

    it('should return null for user id when not authenticated', () => {
      expect(service.getUserId()).toBeNull();
    });
  });
});
