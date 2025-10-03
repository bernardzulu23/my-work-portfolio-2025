import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials } from '../../../core/services';
import { NotificationService } from '../../../shared/services/notification.service';
import { SecurityService, RateLimitStatus } from '../../../core/services';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { SanitizeHtmlPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Login
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email" class="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                formControlName="email"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                [class.border-red-300]="isFieldInvalid('email')"
                [class.focus:border-red-500]="isFieldInvalid('email')"
                [class.focus:ring-red-500]="isFieldInvalid('email')"
              >
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                formControlName="password"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                [class.border-red-300]="isFieldInvalid('password')"
                [class.focus:border-red-500]="isFieldInvalid('password')"
                [class.focus:ring-red-500]="isFieldInvalid('password')"
              >
            </div>
          </div>

          <!-- Error Messages -->
          <div *ngIf="loginError()" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-800 dark:text-red-200">{{ loginError() }}</p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3" *ngIf="isLoading()">
                <app-loading-spinner class="h-4 w-4"></app-loading-spinner>
              </span>
              <span [class]="isLoading() ? 'ml-6' : ''">
                {{ isLoading() ? 'Signing in...' : 'Sign in' }}
              </span>
            </button>
          </div>

          <!-- Demo Credentials -->
          <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Demo Credentials</h3>
            <div class="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div><strong>Email:</strong> admin@demo.com</div>
              <div><strong>Password:</strong> admin123</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-field-error {
      @apply border-red-300 focus:border-red-500 focus:ring-red-500;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private securityService = inject(SecurityService);

  loginForm: FormGroup;
  isLoading = signal(false);
  loginError = signal<string | null>(null);
  rateLimitStatus = signal<RateLimitStatus | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, this.emailValidator.bind(this)]],
      password: ['', [Validators.required, this.passwordValidator.bind(this)]]
    });

    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/admin-setup']);
      }
    }

    // Check rate limit status on component init
    this.checkRateLimitStatus();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.loginError.set(null);

    const { email, password } = this.loginForm.value;

    try {
      const result = await this.authService.signIn(email, password);

      if (result.success) {
        this.notificationService.success('Success', 'Successfully logged in!');
        // Check if user has admin role, if not redirect to admin setup
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/admin-setup']);
        }
      } else {
        this.loginError.set(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.loginError.set('An unexpected error occurred');
    } finally {
      this.isLoading.set(false);
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  emailValidator(control: any) {
    const email = control.value;
    if (!email) return null;

    // Sanitize input
    const sanitizedEmail = this.securityService.sanitizeInput(email);

    if (sanitizedEmail !== email) {
      return { xssAttempt: true };
    }

    if (!this.securityService.validateEmail(email)) {
      return { invalidEmail: true };
    }

    return null;
  }

  passwordValidator(control: any) {
    const password = control.value;
    if (!password) return null;

    // Sanitize input
    const sanitizedPassword = this.securityService.sanitizeInput(password);

    if (sanitizedPassword !== password) {
      return { xssAttempt: true };
    }

    const validation = this.securityService.validatePasswordStrength(password);
    if (!validation.valid) {
      return { weakPassword: { errors: validation.errors } };
    }

    return null;
  }

  checkRateLimitStatus() {
    // Get client IP (in a real app, this would come from the server)
    const clientIP = this.getClientIP();
    const status = this.securityService.getRateLimitStatus(clientIP);
    this.rateLimitStatus.set(status);

    if (status.isBlocked) {
      this.loginError.set(`Too many failed login attempts. Try again after ${this.formatTime(status.blockedUntil!)}`);
    }
  }

  private getClientIP(): string {
    // In a real application, this would be provided by the server
    // For demo purposes, we'll use a hash of the user agent
    return btoa(navigator.userAgent).substring(0, 16);
  }

  
  private formatTime(date: Date): string {
    const diff = Math.ceil((date.getTime() - Date.now()) / 1000 / 60);
    return `${diff} minutes`;
  }
}
