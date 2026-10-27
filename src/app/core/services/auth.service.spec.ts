import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SecurityService } from './security.service';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let securityServiceSpy: jasmine.SpyObj<SecurityService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    sessionStorage.clear();

    securityServiceSpy = jasmine.createSpyObj('SecurityService', [
      'sanitizeInput',
      'detectXSSAttempt',
      'validateEmail',
      'validatePasswordStrength',
      'isRateLimited',
      'getRateLimitStatus',
      'recordLoginAttempt',
      'logSecurityEvent',
      'generateClientId'
    ]);

    securityServiceSpy.sanitizeInput.and.callFake((input: string) => input);
    securityServiceSpy.detectXSSAttempt.and.returnValue(false);
    securityServiceSpy.validateEmail.and.returnValue(true);
    securityServiceSpy.validatePasswordStrength.and.returnValue({
      valid: true,
      isValid: true,
      errors: [],
      score: 6,
      strength: 'strong'
    });
    securityServiceSpy.isRateLimited.and.returnValue(false);
    securityServiceSpy.getRateLimitStatus.and.returnValue({
      isLimited: false,
      isBlocked: false,
      remainingAttempts: 5
    });
    securityServiceSpy.generateClientId.and.returnValue('client-test-id');

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        AuthInterceptor,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: SecurityService, useValue: securityServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush(
      { error: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should sign in successfully for admin user', async () => {
    const signInPromise = service.signIn('admin@example.com', 'SecurePass1!');

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({
      success: true,
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        role: 'admin',
        created_at: new Date().toISOString()
      }
    });

    const result = await signInPromise;
    expect(result.success).toBe(true);
    expect(result.mfaRequired).toBeFalsy();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    expect(service.isAdmin()).toBe(true);
  });

  it('should require a second factor without storing a session token', async () => {
    const signInPromise = service.signIn('admin@example.com', 'SecurePass1!');

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({
      success: true,
      mfaRequired: true,
      mfaToken: 'pending-mfa',
      methods: { totp: true, passkey: false, recovery: true }
    });

    const result = await signInPromise;
    expect(result.success).toBe(true);
    expect(result.mfaRequired).toBe(true);
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should complete TOTP verification after password login', async () => {
    const signInPromise = service.signIn('admin@example.com', 'SecurePass1!');
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({
      success: true,
      mfaRequired: true,
      mfaToken: 'pending-mfa',
      methods: { totp: true, passkey: false, recovery: true }
    });
    await signInPromise;

    const verifyPromise = service.verifyMfaCode('123456', 'totp');
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/mfa/verify`);
    expect(req.request.body.mfaToken).toBe('pending-mfa');
    req.flush({
      success: true,
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        mfa: { enrolled: true, totpEnabled: true, passkeyCount: 0 }
      }
    });

    const result = await verifyPromise;
    expect(result.success).toBe(true);
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    expect(service.isAdmin()).toBe(true);
  });

  it('should reject invalid credentials', async () => {
    const signInPromise = service.signIn('admin@example.com', 'wrong');

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ success: false, error: 'Invalid email or password' });

    const result = await signInPromise;
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid email or password');
    expect(result.error).not.toContain('[object Object]');
  });

  it('should stringify object API errors instead of leaking [object Object]', async () => {
    const signInPromise = service.signIn('admin@example.com', 'wrong');

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(
      { success: false, error: { message: 'Invalid email or password' } },
      { status: 401, statusText: 'Unauthorized' }
    );

    const result = await signInPromise;
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email or password');
    expect(result.error).not.toContain('[object Object]');
  });

  it('should detect and reject XSS attempts', async () => {
    securityServiceSpy.detectXSSAttempt.and.returnValue(true);

    const result = await service.signIn('<script>alert(1)</script>', 'password');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid input detected');
    httpMock.expectNone(`${environment.apiUrl}/auth/login`);
  });

  it('should check for rate limiting', async () => {
    securityServiceSpy.isRateLimited.and.returnValue(true);
    securityServiceSpy.getRateLimitStatus.and.returnValue({
      isLimited: true,
      isBlocked: true,
      blockedUntil: new Date(Date.now() + 300000),
      remainingAttempts: 0
    });

    const result = await service.signIn('admin@example.com', 'SecurePass1!');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Too many failed attempts');
    httpMock.expectNone(`${environment.apiUrl}/auth/login`);
  });

  it('should validate session with /auth/me', async () => {
    const validatePromise = service.validateSession();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
    expect(req.request.headers.get('Authorization')).toBeNull();
    expect(req.request.withCredentials).toBeTrue();
    req.flush({
      success: true,
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        role: 'admin',
        created_at: new Date().toISOString()
      }
    });

    const valid = await validatePromise;
    expect(valid).toBe(true);
    expect(service.isAdmin()).toBe(true);
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('should clear session on sign out', async () => {
    const signOutPromise = service.signOut();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    req.flush({ success: true });
    await signOutPromise;

    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
