import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, MfaStatus } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Protect admin access with an authenticator app and passkeys. Recovery codes are shown once when you first enable MFA.
      </p>

      <div *ngIf="status()?.enrolled" class="rounded-md bg-green-50 dark:bg-green-900/20 px-3 py-2 text-sm text-green-800 dark:text-green-200">
        MFA is on. Sign in will ask for a second factor.
      </div>
      <div *ngIf="status() && !status()?.enrolled" class="rounded-md bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
        MFA is not enabled yet. Add an authenticator or passkey below.
      </div>

      <section class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white">Authenticator app</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Use Google Authenticator, Authy, 1Password, or similar.</p>
          </div>
          <span class="text-xs font-medium px-2 py-1 rounded-full"
                [class]="status()?.totpEnabled ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'">
            {{ status()?.totpEnabled ? 'Enabled' : 'Off' }}
          </span>
        </div>

        <div *ngIf="totpSetup() as setup" class="space-y-3">
          <img [src]="setup.qrDataUrl" alt="Authenticator QR code" class="mx-auto w-44 h-44 bg-white p-2 rounded">
          <p class="text-xs text-center text-gray-500 dark:text-gray-400 break-all">
            Manual key: <span class="font-mono">{{ setup.secret }}</span>
          </p>
          <input
            [(ngModel)]="totpCode"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="6-digit code"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-center tracking-[0.3em]">
          <button type="button" (click)="confirmTotp()" [disabled]="busy()"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm disabled:opacity-50">
            Confirm and enable
          </button>
        </div>

        <div *ngIf="!totpSetup()" class="flex flex-wrap gap-2">
          <button *ngIf="!status()?.totpEnabled" type="button" (click)="startTotp()" [disabled]="busy()"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50">
            Set up authenticator
          </button>
          <div *ngIf="status()?.totpEnabled" class="w-full space-y-2">
            <input
              [(ngModel)]="disableCode"
              placeholder="Authenticator or recovery code"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm">
            <button type="button" (click)="disableTotp()" [disabled]="busy()"
                    class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50">
              Disable authenticator
            </button>
          </div>
        </div>
      </section>

      <section class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white">Passkeys</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Windows Hello, Touch ID, Face ID, or a security key.</p>
          </div>
        </div>

        <ul *ngIf="status()?.passkeys?.length" class="divide-y divide-gray-200 dark:divide-gray-700">
          <li *ngFor="let key of status()?.passkeys" class="py-2 flex items-center justify-between gap-2">
            <div>
              <div class="text-sm text-gray-900 dark:text-white">{{ key.name }}</div>
              <div class="text-xs text-gray-500">Added {{ key.createdAt | date:'mediumDate' }}</div>
            </div>
            <button type="button" (click)="removePasskey(key.id)" [disabled]="busy()"
                    class="text-sm text-red-600 hover:text-red-500 disabled:opacity-50">Remove</button>
          </li>
        </ul>
        <p *ngIf="!status()?.passkeys?.length" class="text-sm text-gray-500 dark:text-gray-400">No passkeys registered.</p>

        <button type="button" (click)="addPasskey()" [disabled]="busy() || !supportsPasskeys"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50">
          {{ supportsPasskeys ? 'Add a passkey' : 'Passkeys not supported in this browser' }}
        </button>
      </section>

      <section class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
        <h4 class="font-medium text-gray-900 dark:text-white">Recovery codes</h4>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ status()?.recoveryRemaining || 0 }} unused code{{ (status()?.recoveryRemaining || 0) === 1 ? '' : 's' }} remaining.
        </p>
        <div *ngIf="recoveryCodes() as codes" class="rounded-md bg-gray-50 dark:bg-gray-900 p-3">
          <p class="text-xs text-amber-700 dark:text-amber-300 mb-2">Save these now. They will not be shown again.</p>
          <ul class="grid grid-cols-2 gap-1 font-mono text-sm text-gray-900 dark:text-gray-100">
            <li *ngFor="let code of codes">{{ code }}</li>
          </ul>
          <button type="button" (click)="copyRecovery()" class="mt-2 text-sm text-blue-600 hover:text-blue-500">Copy all</button>
        </div>
        <div *ngIf="status()?.enrolled" class="space-y-2">
          <input
            [(ngModel)]="recoveryCode"
            placeholder="Current authenticator or recovery code"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm">
          <button type="button" (click)="regenerateRecovery()" [disabled]="busy()"
                  class="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            Generate new recovery codes
          </button>
        </div>
      </section>
    </div>
  `
})
export class SecuritySettingsComponent implements OnChanges {
  @Input() isOpen = false;

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  status = signal<MfaStatus | null>(null);
  totpSetup = signal<{ qrDataUrl: string; secret: string; setupToken: string } | null>(null);
  recoveryCodes = signal<string[] | null>(null);
  busy = signal(false);
  supportsPasskeys = this.authService.supportsPasskeys();

  totpCode = '';
  disableCode = '';
  recoveryCode = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue) {
      this.totpSetup.set(null);
      this.totpCode = '';
      this.disableCode = '';
      this.recoveryCode = '';
      void this.load();
    }
  }

  async load() {
    this.status.set(await this.authService.getMfaStatus());
  }

  async startTotp() {
    this.busy.set(true);
    const setup = await this.authService.startTotpSetup();
    this.busy.set(false);
    if (!setup) {
      this.notificationService.error('Authenticator', 'Unable to start authenticator setup');
      return;
    }
    this.totpSetup.set(setup);
  }

  async confirmTotp() {
    const setup = this.totpSetup();
    if (!setup) return;
    this.busy.set(true);
    const result = await this.authService.enableTotp(setup.setupToken, this.totpCode);
    this.busy.set(false);
    if (!result.success) {
      this.notificationService.error('Authenticator', result.error || 'Invalid code');
      return;
    }
    this.totpSetup.set(null);
    this.totpCode = '';
    this.showRecovery(result.recoveryCodes);
    this.notificationService.success('Authenticator', 'Authenticator app enabled');
    await this.load();
  }

  async disableTotp() {
    this.busy.set(true);
    const result = await this.authService.disableTotp(this.disableCode);
    this.busy.set(false);
    if (!result.success) {
      this.notificationService.error('Authenticator', result.error || 'Unable to disable');
      return;
    }
    this.disableCode = '';
    this.notificationService.success('Authenticator', 'Authenticator app disabled');
    await this.load();
  }

  async addPasskey() {
    this.busy.set(true);
    const result = await this.authService.registerPasskey();
    this.busy.set(false);
    if (!result.success) {
      this.notificationService.error('Passkey', result.error || 'Could not add passkey');
      return;
    }
    this.showRecovery(result.recoveryCodes);
    this.notificationService.success('Passkey', 'Passkey added');
    await this.load();
  }

  async removePasskey(id: string) {
    this.busy.set(true);
    const result = await this.authService.deletePasskey(id);
    this.busy.set(false);
    if (!result.success) {
      this.notificationService.error('Passkey', result.error || 'Unable to remove passkey');
      return;
    }
    this.notificationService.success('Passkey', 'Passkey removed');
    await this.load();
  }

  async regenerateRecovery() {
    this.busy.set(true);
    const result = await this.authService.regenerateRecoveryCodes(this.recoveryCode);
    this.busy.set(false);
    if (!result.success) {
      this.notificationService.error('Recovery codes', result.error || 'Unable to regenerate');
      return;
    }
    this.recoveryCode = '';
    this.showRecovery(result.recoveryCodes);
    await this.load();
  }

  async copyRecovery() {
    const codes = this.recoveryCodes();
    if (!codes?.length) return;
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      this.notificationService.success('Copied', 'Recovery codes copied');
    } catch {
      this.notificationService.error('Copy', 'Unable to copy recovery codes');
    }
  }

  private showRecovery(codes?: string[] | null) {
    if (codes?.length) {
      this.recoveryCodes.set(codes);
    }
  }
}
