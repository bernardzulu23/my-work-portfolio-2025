import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService, AuthUser } from '../services/auth.service';
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

  canActivate(): Observable<boolean> | boolean {
    return this.authService.user$.pipe(
      take(1),
      map(user => {
        // Check if user is authenticated and has admin role
        if (user && user.role === 'admin') {
          // Additional security checks
          const clientIP = this.getClientIdentifier();

          // Check rate limiting status
          if (this.securityService.isRateLimited(clientIP)) {
            console.warn('Rate limit exceeded for user:', user.email);
            // Log the security event
            this.securityService.logSecurityEvent({
              type: 'rate_limit_exceeded',
              timestamp: new Date(),
              details: `Rate limit exceeded during admin access for ${user.email}`
            });
          }

          return true;
        } else {
          // Log failed access attempt
          const clientIP = this.getClientIdentifier();
          this.securityService.logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: new Date(),
            details: `Unauthorized access attempt to admin area from ${clientIP}`
          });

          // Redirect to login if not authenticated or not admin
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }

  private getClientIdentifier(): string {
    // In a real application, this would be provided by the server
    // For demo purposes, we'll use a hash of the user agent
    return btoa(navigator.userAgent).substring(0, 16);
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

  canActivate(): Observable<boolean> | boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    const isAdmin = this.authService.isAdmin();

    if (isAuthenticated && isAdmin) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
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

  canActivate(): Observable<boolean> | boolean {
    return this.authService.user$.pipe(
      take(1),
      map(user => {
        if (user && user.role === 'admin') {
          // If already logged in as admin, redirect to admin dashboard
          this.router.navigate(['/admin']);
          return false;
        } else {
          // Allow access to login page
          return true;
        }
      })
    );
  }
}
