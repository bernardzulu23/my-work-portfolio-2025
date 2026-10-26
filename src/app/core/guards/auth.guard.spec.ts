import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { SecurityService } from '../services/security.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let securityServiceSpy: jasmine.SpyObj<SecurityService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['validateSession', 'canAccessAdmin']);
    securityServiceSpy = jasmine.createSpyObj('SecurityService', [
      'generateClientId',
      'isRateLimited',
      'logSecurityEvent'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    securityServiceSpy.generateClientId.and.returnValue('client-id');
    securityServiceSpy.isRateLimited.and.returnValue(false);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: SecurityService, useValue: securityServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should allow access for valid admin session', (done) => {
    authServiceSpy.validateSession.and.resolveTo(true);
    authServiceSpy.canAccessAdmin.and.returnValue(true);

    guard.canActivate().subscribe((allowed) => {
      expect(allowed).toBe(true);
      done();
    });
  });

  it('should deny access when session is invalid', (done) => {
    authServiceSpy.validateSession.and.resolveTo(false);
    authServiceSpy.canAccessAdmin.and.returnValue(false);

    guard.canActivate().subscribe((allowed) => {
      expect(allowed).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('should deny access when rate limited', (done) => {
    securityServiceSpy.isRateLimited.and.returnValue(true);

    guard.canActivate().subscribe((allowed) => {
      expect(allowed).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
