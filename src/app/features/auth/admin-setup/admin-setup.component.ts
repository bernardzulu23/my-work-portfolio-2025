import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SecurityService } from '../../../core/services/security.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { BrandLogoComponent } from '../../../shared/components/brand-logo/brand-logo.component';

@Component({
  selector: 'app-admin-setup',
  standalone: true,
  imports: [ReactiveFormsModule, BrandLogoComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-brand-navy py-12 px-4">
      <div class="max-w-lg w-full space-y-8">
        <div class="text-center">
          <div class="flex justify-center">
            <app-brand-logo size="lg"></app-brand-logo>
          </div>
          <h1 class="mt-6 text-3xl font-extrabold text-white">Secure your admin account</h1>
          <p class="mt-2 text-sm text-slate-300">{{ subtitle() }}</p>
        </div>

        <ol class="flex justify-between text-xs text-slate-400">
          <li [class.text-brand-gold]="step() === 'password'">1. Password</li>
          <li [class.text-brand-gold]="step() === 'totp'">2. Authenticator</li>
          <li [class.text-brand-gold]="step() === 'passkey'">3. Passkey</li>
        </ol>

        @if (error()) {
          <div class="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">{{ error() }}</div>
        }

        @if (step() === 'password') {
          <form class="space-y-4" [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
            <p class="text-sm text-slate-300">
              Replace the seeded password with one only you know. It must be at least 12 characters
              with uppercase, lowercase, a number, and a special character.
            </p>
            <input type="password" formControlName="currentPassword" autocomplete="current-password"
                   placeholder="Current password"
                   class="w-full px-3 py-2 rounded-md bg-white text-gray-900">
            <input type="password" formControlName="newPassword" autocomplete="new-password"
                   placeholder="New password"
                   class="w-full px-3 py-2 rounded-md bg-white text-gray-900">
            <input type="password" formControlName="confirmPassword" autocomplete="new-password"
                   placeholder="Confirm new password"
                   class="w-full px-3 py-2 rounded-md bg-white text-gray-900">
            <button type="submit" [disabled]="passwordForm.invalid || busy()"
                    class="w-full py-2 rounded-md text-white bg-gradient-to-r from-blue-800 to-amber-600 disabled:opacity-50">
              {{ busy() ? 'Saving...' : 'Save new password' }}
            </button>
          </form>
        }

        @if (step() === 'totp') {
          <div class="space-y-4">
            <p class="text-sm text-slate-300">
              Scan this QR code with Google Authenticator, Authy, 1Password, or another authentication app,
              then enter the 6-digit code.
            </p>
            @if (totpSetup(); as setup) {
              <img [src]="setup.qrDataUrl" alt="Authenticator QR code" class="mx-auto w-44 h-44 bg-white p-2 rounded">
              <p class="text-xs text-center text-slate-400 break-all">Manual key: {{ setup.secret }}</p>
              <form class="space-y-3" [formGroup]="totpForm" (ngSubmit)="onConfirmTotp()">
                <input formControlName="code" maxlength="6" inputmode="numeric" autocomplete="one-time-code"
                       placeholder="000000"
                       class="w-full px-3 py-2 rounded-md bg-white text-gray-900 text-center tracking-[0.4em] text-lg">
                <button type="submit" [disabled]="totpForm.invalid || busy()"
                        class="w-full py-2 rounded-md text-white bg-blue-600 disabled:opacity-50">
                  {{ busy() ? 'Verifying...' : 'Enable authenticator' }}
                </button>
              </form>
            }
            @if (recoveryCodes(); as codes) {
              <div class="rounded-md bg-white/10 p-4">
                <p class="text-sm text-amber-200 mb-2">Save these recovery codes now. They will not be shown again.</p>
                <ul class="grid grid-cols-2 gap-1 font-mono text-sm text-white">
                  @for (code of codes; track code) {
                    <li>{{ code }}</li>
                  }
                </ul>
              </div>
              <button type="button" (click)="continueToPasskey()"
                      class="w-full py-2 rounded-md text-white bg-blue-600">
                Continue to passkey
              </button>
            }
          </div>
        }

        @if (step() === 'passkey') {
          <div class="space-y-4">
            <p class="text-sm text-slate-300">
              Add a passkey with Windows Hello, Touch ID, Face ID, or a security key so you can sign in without typing a password.
            </p>
            <button type="button" (click)="onAddPasskey()" [disabled]="busy() || !supportsPasskeys"
                    class="w-full py-2 rounded-md text-white bg-blue-600 disabled:opacity-50">
              {{ passkeyLabel() }}
            </button>
            @if (!supportsPasskeys) {
              <button type="button" (click)="onSkipPasskey()" [disabled]="busy()"
                      class="w-full py-2 rounded-md border border-brand-gold/40 text-brand-goldLight">
                Continue without a passkey
              </button>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class AdminSetupComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private security = inject(SecurityService);
  private notifications = inject(NotificationService);
  private router = inject(Router);

  step = signal<'password' | 'totp' | 'passkey'>('password');
  busy = signal(false);
  error = signal<string | null>(null);
  totpSetup = signal<{ qrDataUrl: string; secret: string; setupToken: string } | null>(null);
  recoveryCodes = signal<string[] | null>(null);
  supportsPasskeys = this.auth.supportsPasskeys();

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(12)]],
    confirmPassword: ['', Validators.required]
  });
  totpForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  constructor() {
    const user = this.auth.user();
    if (user && !user.mustChangePassword) {
      this.step.set(user.mfa?.totpEnabled ? 'passkey' : 'totp');
      if (!user.mfa?.totpEnabled) {
        void this.startTotp();
      }
    }
  }

  subtitle() {
    switch (this.step()) {
      case 'password':
        return 'First, change the seeded admin password';
      case 'totp':
        return 'Next, add an authentication app';
      default:
        return 'Finally, register a passkey';
    }
  }

  passkeyLabel() {
    if (this.busy()) return 'Waiting for passkey...';
    return this.supportsPasskeys ? 'Add a passkey' : 'Passkeys are not supported in this browser';
  }

  async onChangePassword() {
    if (this.passwordForm.invalid) return;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.error.set('New password and confirmation do not match');
      return;
    }
    const strength = this.security.validatePasswordStrength(newPassword || '');
    if (!strength.valid || (newPassword || '').length < 12) {
      this.error.set(strength.errors[0] || 'Choose a stronger password');
      return;
    }

    this.busy.set(true);
    this.error.set(null);
    try {
      const result = await this.auth.changePassword(currentPassword || '', newPassword || '');
      if (!result.success) {
        this.error.set(result.error || 'Could not update password');
        return;
      }
      this.notifications.success('Password updated', 'Set up an authenticator app next.');
      this.step.set('totp');
      await this.startTotp();
    } finally {
      this.busy.set(false);
    }
  }

  async startTotp() {
    const setup = await this.auth.startTotpSetup();
    if (!setup) {
      this.error.set('Unable to start authenticator setup');
      return;
    }
    this.totpSetup.set(setup);
  }

  async onConfirmTotp() {
    const setup = this.totpSetup();
    if (!setup || this.totpForm.invalid) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      const result = await this.auth.enableTotp(setup.setupToken, this.totpForm.value.code || '');
      if (!result.success) {
        this.error.set(result.error || 'Invalid authenticator code');
        return;
      }
      this.totpSetup.set(null);
      this.recoveryCodes.set(result.recoveryCodes || null);
      this.notifications.success('Authenticator enabled', 'Save your recovery codes, then add a passkey.');
      if (!result.recoveryCodes?.length) {
        this.continueToPasskey();
      }
    } finally {
      this.busy.set(false);
    }
  }

  continueToPasskey() {
    this.recoveryCodes.set(null);
    this.step.set('passkey');
  }

  async onAddPasskey() {
    this.busy.set(true);
    this.error.set(null);
    try {
      const result = await this.auth.registerPasskey('Admin passkey');
      if (!result.success) {
        this.error.set(result.error || 'Could not register this passkey');
        return;
      }
      this.notifications.success('Passkey added', 'Your admin account is ready.');
      void this.router.navigate(['/admin']);
    } finally {
      this.busy.set(false);
    }
  }

  async onSkipPasskey() {
    this.busy.set(true);
    this.error.set(null);
    try {
      const result = await this.auth.skipPasskeySetup();
      if (!result.success) {
        this.error.set(result.error || 'Unable to continue');
        return;
      }
      void this.router.navigate(['/admin']);
    } finally {
      this.busy.set(false);
    }
  }
}
