import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, from, map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SecurityService } from '../services/security.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private securityService: SecurityService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return from(this.checkAccess());
  }

  private async checkAccess(): Promise<boolean> {
    const clientId = this.securityService.generateClientId();

    if (this.securityService.isRateLimited(clientId)) {
      this.securityService.logSecurityEvent({
        type: 'rate_limit_exceeded',
        timestamp: new Date(),
        details: `Rate limit exceeded during admin access from ${clientId}`
      });
      this.router.navigate(['/login']);
      return false;
    }

    const sessionValid = await this.authService.validateSession();
    if (!sessionValid) {
      this.securityService.logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date(),
        details: `Unauthorized access attempt to admin area from ${clientId}`
      });
      this.router.navigate(['/login']);
      return false;
    }

    if (this.authService.needsSetup()) {
      this.router.navigate(['/admin/setup']);
      return false;
    }

    if (!this.authService.canAccessAdmin()) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return from(this.authService.validateSession()).pipe(
      map((valid) => {
        if (!valid) {
          this.router.navigate(['/login']);
          return false;
        }
        if (this.authService.needsSetup()) {
          this.router.navigate(['/admin/setup']);
          return false;
        }
        if (this.authService.canAccessAdmin()) {
          return true;
        }
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class SetupGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return from(this.authService.validateSession()).pipe(
      map((valid) => {
        if (!valid) {
          this.router.navigate(['/login']);
          return false;
        }
        if (this.authService.canAccessAdmin()) {
          this.router.navigate(['/admin']);
          return false;
        }
        return true;
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return from(this.authService.validateSession()).pipe(
      map((valid) => {
        if (valid && this.authService.canAccessAdmin()) {
          this.router.navigate(['/admin']);
          return false;
        }
        if (valid && this.authService.needsSetup()) {
          this.router.navigate(['/admin/setup']);
          return false;
        }
        return true;
      })
    );
  }
}
