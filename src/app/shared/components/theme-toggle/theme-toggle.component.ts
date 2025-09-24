import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="themeService.toggleTheme()"
      class="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      [attr.aria-label]="themeService.getIsDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
      type="button">
      <!-- Sun icon -->
      <svg
        *ngIf="!themeService.getIsDarkMode()"
        class="w-5 h-5 text-yellow-500 transition-transform duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
        </path>
      </svg>

      <!-- Moon icon -->
      <svg
        *ngIf="themeService.getIsDarkMode()"
        class="w-5 h-5 text-blue-400 transition-transform duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z">
        </path>
      </svg>

      <!-- Loading spinner -->
      <div *ngIf="isToggling"
           class="absolute inset-0 flex items-center justify-center">
        <div class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class ThemeToggleComponent {
  protected themeService = inject(ThemeService);
  protected isToggling = false;

  async toggleTheme() {
    this.isToggling = true;

    // Add a small delay for better UX
    setTimeout(() => {
      this.themeService.toggleTheme();
      this.isToggling = false;
    }, 150);
  }
}
