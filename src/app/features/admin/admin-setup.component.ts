import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-setup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Setup
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Grant admin privileges to your account
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div *ngIf="authService.getUserEmail()" class="mb-6">
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400">Current User</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ authService.getUserEmail() }}</div>
            </div>
          </div>

          <div *ngIf="message" class="mb-4 p-4 rounded-md" [ngClass]="{
            'bg-green-50 text-green-800 border border-green-200': message.type === 'success',
            'bg-red-50 text-red-800 border border-red-200': message.type === 'error'
          }">
            {{ message.text }}
          </div>

          <div class="space-y-4">
            <button
              (click)="setAdminRole()"
              [disabled]="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Setting Admin Role...' : 'Grant Admin Access' }}
            </button>

            <button
              (click)="goToAdmin()"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Go to Admin Dashboard
            </button>

            <button
              (click)="logout()"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminSetupComponent {
  protected authService = inject(AuthService);

  constructor(private router: Router) {}

  message: { type: 'success' | 'error'; text: string } | null = null;
  isLoading = false;

  async setAdminRole() {
    this.isLoading = true;
    this.message = null;

    try {
      const result = await this.authService.setAdminRole();

      if (result.success) {
        this.message = {
          type: 'success',
          text: 'Admin privileges granted successfully! You can now access the admin dashboard.'
        };

        // Redirect to admin after a short delay
        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 2000);
      } else {
        this.message = {
          type: 'error',
          text: result.error || 'Failed to grant admin privileges'
        };
      }
    } catch (error) {
      this.message = {
        type: 'error',
        text: 'An unexpected error occurred'
      };
    } finally {
      this.isLoading = false;
    }
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
