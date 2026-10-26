import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { environment } from '../../../environments/environment';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthInterceptor]
    });
    interceptor = TestBed.inject(AuthInterceptor);
    sessionStorage.clear();
  });

  it('should send credentials on GET /contact without a bearer token', () => {
    sessionStorage.setItem('auth_token', 'secure-token');

    const request = new HttpRequest('GET', `${environment.apiUrl}/contact`);
    const handler = {
      handle: jasmine.createSpy('handle').and.returnValue({ subscribe: () => undefined })
    };

    interceptor.intercept(request, handler);

    const authorizedRequest = handler.handle.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(authorizedRequest.headers.get('Authorization')).toBeNull();
    expect(authorizedRequest.withCredentials).toBeTrue();
  });

  it('should send credentials on public GET /projects without a bearer token', () => {
    sessionStorage.setItem('auth_token', 'secure-token');

    const request = new HttpRequest('GET', `${environment.apiUrl}/projects`);
    const handler = {
      handle: jasmine.createSpy('handle').and.returnValue({ subscribe: () => undefined })
    };

    interceptor.intercept(request, handler);

    const publicRequest = handler.handle.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(publicRequest.headers.get('Authorization')).toBeNull();
    expect(publicRequest.withCredentials).toBeTrue();
  });

  it('should not attach a bearer token to MFA verify', () => {
    sessionStorage.setItem('auth_token', 'secure-token');

    const request = new HttpRequest('POST', `${environment.apiUrl}/auth/mfa/verify`, {});
    const handler = {
      handle: jasmine.createSpy('handle').and.returnValue({ subscribe: () => undefined })
    };

    interceptor.intercept(request, handler);

    const publicRequest = handler.handle.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(publicRequest.headers.get('Authorization')).toBeNull();
    expect(publicRequest.withCredentials).toBeTrue();
  });

  it('should send credentials on write requests without a bearer token', () => {
    sessionStorage.setItem('auth_token', 'secure-token');

    const request = new HttpRequest('POST', `${environment.apiUrl}/projects`, {});
    const handler = {
      handle: jasmine.createSpy('handle').and.returnValue({ subscribe: () => undefined })
    };

    interceptor.intercept(request, handler);

    const authorizedRequest = handler.handle.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(authorizedRequest.headers.get('Authorization')).toBeNull();
    expect(authorizedRequest.withCredentials).toBeTrue();
  });
});
