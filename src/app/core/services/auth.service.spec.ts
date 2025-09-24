import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { SecurityService } from './security.service';
import { BehaviorSubject } from 'rxjs';

// Mock classes
class MockSupabaseService {
  client = {
    auth: {
      getSession: jasmine.createSpy('getSession'),
      onAuthStateChange: jasmine.createSpy('onAuthStateChange'),
      signInWithPassword: jasmine.createSpy('signInWithPassword'),
      signOut: jasmine.createSpy('signOut'),
      signUp: jasmine.createSpy('signUp'),
      resetPasswordForEmail: jasmine.createSpy('resetPasswordForEmail')
    }
  };
}

class MockSecurityService {
  sanitizeInput = jasmine.createSpy('sanitizeInput');
  detectXSSAttempt = jasmine.createSpy('detectXSSAttempt');
  validateEmail = jasmine.createSpy('validateEmail');
  validatePasswordStrength = jasmine.createSpy('validatePasswordStrength');
  isRateLimited = jasmine.createSpy('isRateLimited');
  getRateLimitStatus = jasmine.createSpy('getRateLimitStatus');
  recordLoginAttempt = jasmine.createSpy('recordLoginAttempt');
  logSecurityEvent = jasmine.createSpy('logSecurityEvent');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('AuthService', () => {
  let service: AuthService;
  let supabaseService: MockSupabaseService;
  let securityService: MockSecurityService;
  let router: MockRouter;

  beforeEach(() => {
    const mockSupabaseService = new MockSupabaseService();
    const mockSecurityService = new MockSecurityService();
    const mockRouter = new MockRouter();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    supabaseService = TestBed.inject(SupabaseService) as any;
    securityService = TestBed.inject(SecurityService) as any;
    router = TestBed.inject(Router) as any;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with no session', (done) => {
      supabaseService.client.auth.getSession.and.returnValue(Promise.resolve({ data: { session: null }, error: null }));

      // Create new service instance to trigger initializeAuth
      const newService = new AuthService(supabaseService as any, router as any, securityService as any);

      setTimeout(() => {
        expect(newService.user()).toBeNull();
        expect(newService.session()).toBeNull();
        expect(newService.loading()).toBeFalse();
        done();
      });
    });

    it('should initialize with existing session', (done) => {
      const mockSession = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: '123',
          email: 'test@example.com',
          user_metadata: { role: 'admin' },
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }
      } as any;
      supabaseService.client.auth.getSession.and.returnValue(Promise.resolve({ data: { session: mockSession }, error: null }));

      // Create new service instance
      const newService = new AuthService(supabaseService as any, router as any, securityService as any);

      setTimeout(() => {
        expect(newService.user()?.id).toBe('123');
        expect(newService.user()?.email).toBe('test@example.com');
        expect(newService.user()?.role).toBe('admin');
        expect(newService.session()).toBe(mockSession);
        expect(newService.loading()).toBeFalse();
        done();
      });
    });

    it('should handle initialization error', (done) => {
      supabaseService.client.auth.getSession.and.returnValue(Promise.resolve({ data: { session: null }, error: new Error('Session error') }));

      const newService = new AuthService(supabaseService as any, router as any, securityService as any);

      setTimeout(() => {
        expect(newService.loading()).toBeFalse();
        done();
      });
    });
  });

  describe('signIn', () => {
    beforeEach(() => {
      securityService.sanitizeInput.and.callFake((input: string) => input);
      securityService.detectXSSAttempt.and.returnValue(false);
      securityService.validateEmail.and.returnValue(true);
      securityService.validatePasswordStrength.and.returnValue({ valid: true });
      securityService.isRateLimited.and.returnValue(false);
    });

    it('should sign in successfully for admin user', async () => {
      const mockUser = {
        id: '123',
        email: 'admin@example.com',
        user_metadata: { role: 'admin' }
      };
      supabaseService.client.auth.signInWithPassword.and.returnValue(Promise.resolve({ data: { user: mockUser }, error: null }));

      const result = await service.signIn('admin@example.com', 'password123');

      expect(result.success).toBeTrue();
      expect(securityService.recordLoginAttempt).toHaveBeenCalledWith(jasmine.any(String), true);
      expect(service.user()?.role).toBe('admin');
    });

    it('should reject non-admin user', async () => {
      const mockUser = {
        id: '123',
        email: 'user@example.com',
        user_metadata: { role: 'user' }
      };
      supabaseService.client.auth.signInWithPassword.and.returnValue(Promise.resolve({ data: { user: mockUser }, error: null }));

      const result = await service.signIn('user@example.com', 'password123');

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Access denied. Admin privileges required.');
      expect(supabaseService.client.auth.signOut).toHaveBeenCalled();
    });

    it('should handle XSS attempt', async () => {
      securityService.detectXSSAttempt.and.returnValue(true);

      const result = await service.signIn('<script>alert("xss")</script>', 'password123');

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Invalid input detected');
      expect(securityService.logSecurityEvent).toHaveBeenCalled();
    });

    it('should handle invalid email', async () => {
      securityService.validateEmail.and.returnValue(false);

      const result = await service.signIn('invalid-email', 'password123');

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Invalid email format');
    });

    it('should handle weak password', async () => {
      securityService.validatePasswordStrength.and.returnValue({ valid: false });

      const result = await service.signIn('test@example.com', 'weak');

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Password does not meet security requirements');
    });

    it('should handle rate limiting', async () => {
      securityService.isRateLimited.and.returnValue(true);
      securityService.getRateLimitStatus.and.returnValue({ isBlocked: true, blockedUntil: new Date(Date.now() + 60000) });

      const result = await service.signIn('test@example.com', 'password123');

      expect(result.success).toBeFalse();
      expect(result.error).toContain('Too many failed attempts');
    });

    it('should handle sign in error', async () => {
      supabaseService.client.auth.signInWithPassword.and.returnValue(Promise.resolve({ data: null, error: { message: 'Invalid credentials' } }));

      const result = await service.signIn('test@example.com', 'wrongpassword');

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Invalid credentials');
      expect(securityService.recordLoginAttempt).toHaveBeenCalledWith(jasmine.any(String), false);
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      supabaseService.client.auth.signOut.and.returnValue(Promise.resolve({ error: null }));

      await service.signOut();

      expect(supabaseService.client.auth.signOut).toHaveBeenCalled();
      expect(service.user()).toBeNull();
      expect(service.session()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle sign out error', async () => {
      supabaseService.client.auth.signOut.and.returnValue(Promise.resolve({ error: new Error('Sign out error') }));

      await service.signOut();

      expect(supabaseService.client.auth.signOut).toHaveBeenCalled();
      // Should still clear session and navigate
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      supabaseService.client.auth.signUp.and.returnValue(Promise.resolve({ data: {}, error: null }));

      const result = await service.signUp('newuser@example.com', 'password123', 'user');

      expect(result.success).toBeTrue();
      expect(supabaseService.client.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            role: 'user'
          }
        }
      });
    });

    it('should handle sign up error', async () => {
      supabaseService.client.auth.signUp.and.returnValue(Promise.resolve({ data: null, error: { message: 'Email already exists' } }));

      const result = await service.signUp('existing@example.com', 'password123');

      expect(result.success).toBeFalse();
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      supabaseService.client.auth.resetPasswordForEmail.and.returnValue(Promise.resolve({ error: null }));

      const result = await service.resetPassword('test@example.com');

      expect(result.success).toBeTrue();
      expect(supabaseService.client.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: jasmine.stringMatching(/reset-password$/)
      });
    });

    it('should handle reset password error', async () => {
      supabaseService.client.auth.resetPasswordForEmail.and.returnValue(Promise.resolve({ error: { message: 'User not found' } }));

      const result = await service.resetPassword('nonexistent@example.com');

      expect(result.success).toBeFalse();
      expect(result.error).toBe('User not found');
    });
  });

  describe('Admin checks', () => {
    it('should allow admin access when authenticated as admin', () => {
      service['_user'].set({ id: '123', email: 'admin@example.com', role: 'admin', created_at: '2023-01-01', updated_at: '2023-01-01' });

      expect(service.canAccessAdmin()).toBeTrue();
      expect(service.isAdmin()).toBeTrue();
    });

    it('should deny admin access when not authenticated', () => {
      service['_user'].set(null);

      expect(service.canAccessAdmin()).toBeFalse();
      expect(service.isAdmin()).toBeFalse();
    });

    it('should deny admin access when authenticated as user', () => {
      service['_user'].set({ id: '123', email: 'user@example.com', role: 'user', created_at: '2023-01-01', updated_at: '2023-01-01' });

      expect(service.canAccessAdmin()).toBeFalse();
      expect(service.isAdmin()).toBeFalse();
    });

    it('should navigate to login when requiring admin without access', () => {
      service['_user'].set(null);

      service.requireAdmin();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Utility methods', () => {
    it('should return user email', () => {
      service['_user'].set({ id: '123', email: 'test@example.com', role: 'user', created_at: '2023-01-01', updated_at: '2023-01-01' });

      expect(service.getUserEmail()).toBe('test@example.com');
    });

    it('should return null for email when not authenticated', () => {
      service['_user'].set(null);

      expect(service.getUserEmail()).toBeNull();
    });

    it('should return user id', () => {
      service['_user'].set({ id: '123', email: 'test@example.com', role: 'user', created_at: '2023-01-01', updated_at: '2023-01-01' });

      expect(service.getUserId()).toBe('123');
    });

    it('should return null for id when not authenticated', () => {
      service['_user'].set(null);

      expect(service.getUserId()).toBeNull();
    });

    it('should generate client identifier', () => {
      const identifier = service['getClientIdentifier']();

      expect(typeof identifier).toBe('string');
      expect(identifier.length).toBeGreaterThan(0);
    });

    it('should format time correctly', () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      const formatted = service['formatTime'](futureDate);

      expect(formatted).toContain('minutes');
    });
  });

  describe('Signals and Observables', () => {
    it('should provide readonly signals', () => {
      expect(service.user).toBeDefined();
      expect(service.session).toBeDefined();
      expect(service.loading).toBeDefined();
      expect(service.isAuthenticated).toBeDefined();
      expect(service.isAdmin).toBeDefined();
    });

    it('should provide observable streams', () => {
      expect(service.user$).toBeDefined();
      expect(service.session$).toBeDefined();
      expect(service.loading$).toBeDefined();
    });
  });
});
