import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService, MfaMethods } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { SecurityService } from '../../../core/services/security.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BrandLogoComponent } from '../../../shared/components/brand-logo/brand-logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    BrandLogoComponent
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private securityService = inject(SecurityService);

  loginForm: FormGroup;
  totpForm: FormGroup;
  recoveryForm: FormGroup;
  isLoading = signal(false);
  passkeyLoading = signal(false);
  loginError = signal<string | null>(null);
  failedAttempts = signal(0);
  lockoutTime = signal<number | null>(null);
  showPassword = signal(false);
  step = signal<'password' | 'mfa'>('password');
  methods = signal<MfaMethods>({ totp: false, passkey: false, recovery: false });
  mfaMode = signal<'totp' | 'recovery'>('totp');
  supportsPasskeys = this.authService.supportsPasskeys();

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, this.emailValidator.bind(this)]],
      password: ['', [Validators.required, this.passwordValidator.bind(this)]]
    });
    this.totpForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
    this.recoveryForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(8)]]
    });

    if (this.authService.canAccessAdmin()) {
      void this.router.navigate(['/admin']);
    } else if (this.authService.needsSetup()) {
      void this.router.navigate(['/admin/setup']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  fieldHasError(fieldName: string, errorKey: string): boolean {
    const errors = this.loginForm.get(fieldName)?.errors;
    return !!errors && Object.prototype.hasOwnProperty.call(errors, errorKey);
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  async onSubmit() {
    const remainingSeconds = this.remainingLockoutSeconds();
    if (remainingSeconds > 0) {
      this.loginError.set(`Too many failed attempts. Please try again in ${remainingSeconds} seconds.`);
      return;
    }

    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.loginError.set(null);

    const { email, password } = this.loginForm.value;

    try {
      const result = await this.authService.signIn(email, password);

      if (result.mfaRequired) {
        this.step.set('mfa');
        this.methods.set(result.methods || { totp: false, passkey: false, recovery: false });
        this.mfaMode.set(result.methods?.totp ? 'totp' : 'recovery');
        this.notificationService.info('Additional verification', 'Enter your second factor to finish signing in.');
        return;
      }

      if (result.success) {
        this.finishLogin();
        return;
      }

      this.handleFailedPassword();
    } catch {
      this.loginError.set('Unable to sign in. Please try again later.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onVerifyTotp() {
    if (this.totpForm.invalid) return;
    await this.completeMfa(this.totpForm.value.code, 'totp');
  }

  async onVerifyRecovery() {
    if (this.recoveryForm.invalid) return;
    await this.completeMfa(this.recoveryForm.value.code, 'recovery');
  }

  async onPasskeyLogin(usePendingMfa: boolean) {
    this.passkeyLoading.set(true);
    this.loginError.set(null);
    try {
      const result = await this.authService.loginWithPasskey(usePendingMfa);
      if (result.success) {
        this.finishLogin();
      } else {
        this.loginError.set(result.error || 'Passkey sign in failed');
      }
    } finally {
      this.passkeyLoading.set(false);
    }
  }

  toggleRecovery() {
    this.mfaMode.update((mode) => (mode === 'recovery' ? 'totp' : 'recovery'));
    this.loginError.set(null);
  }

  backToPassword() {
    this.authService.cancelMfa();
    this.step.set('password');
    this.loginError.set(null);
  }

  private handleFailedPassword() {
    const attempts = this.failedAttempts() + 1;
    this.failedAttempts.set(attempts);

    if (attempts >= 5) {
      this.lockoutTime.set(Date.now() + 60000);
      this.loginError.set('Too many failed attempts. Please try again in 60 seconds.');
      return;
    }

    this.loginError.set('Invalid email or password. Please try again.');
  }

  private remainingLockoutSeconds(): number {
    const until = this.lockoutTime();
    if (until === null) {
      return 0;
    }
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
  }

  private async completeMfa(code: string, method: 'totp' | 'recovery') {
    this.isLoading.set(true);
    this.loginError.set(null);
    try {
      const result = await this.authService.verifyMfaCode(code, method);
      if (result.success) {
        this.finishLogin();
      } else {
        this.loginError.set(result.error || 'Invalid verification code');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private finishLogin() {
    this.failedAttempts.set(0);
    this.lockoutTime.set(null);
    if (this.authService.needsSetup()) {
      this.notificationService.info('Secure your account', 'Change the seeded password, then add an authenticator and passkey.');
      void this.router.navigate(['/admin/setup']);
      return;
    }
    this.notificationService.success('Success', 'Successfully logged in!');
    void this.router.navigate([this.authService.isAdmin() ? '/admin' : '/']);
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) return null;

    if (this.securityService.sanitizeInput(email) !== email) {
      return { xssAttempt: true };
    }

    if (!this.securityService.validateEmail(email)) {
      return { invalidEmail: true };
    }

    return null;
  }

  passwordValidator(_control: AbstractControl): ValidationErrors | null {
    return null;
  }
}
