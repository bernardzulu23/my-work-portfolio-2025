import { Component, inject, signal, computed, effect, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  children?: NavItem[];
  requiresAuth?: boolean;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent, LoadingSpinnerComponent],
  template: `
    <nav class="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors duration-200">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">BZ</span>
            </div>
            <span class="font-bold text-xl text-gray-900 dark:text-white">Bernard Zulu</span>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <a *ngFor="let item of visibleNavItems()"
               [routerLink]="item.path"
               routerLinkActive="text-blue-600 dark:text-blue-400"
               [routerLinkActiveOptions]="{exact: true}"
               class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path [attr.d]="getIconPath(item.icon)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              <span>{{item.label}}</span>
            </a>

            <!-- Auth Section -->
            <div class="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              <!-- User Info -->
              <div *ngIf="authService.isAuthenticated() && !authService.loading()" class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ authService.getUserEmail() }}</span>
              </div>

              <!-- Login/Logout Button -->
              <button
                *ngIf="!authService.loading()"
                (click)="authService.isAuthenticated() ? logout() : navigateToLogin()"
                [disabled]="isLoggingOut()"
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg *ngIf="isLoggingOut()" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <svg *ngIf="!isLoggingOut()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path *ngIf="!authService.isAuthenticated()" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  <path *ngIf="authService.isAuthenticated()" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span>{{ authService.isAuthenticated() ? 'Logout' : 'Login' }}</span>
              </button>
            </div>
          </div>

          <!-- Theme Toggle & Mobile Menu Button -->
          <div class="flex items-center space-x-4">
            <app-theme-toggle></app-theme-toggle>

            <!-- Mobile menu button -->
            <button
              (click)="toggleMobileMenu()"
              class="md:hidden mobile-menu-button inline-flex items-center justify-center w-12 h-12 p-3 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              [attr.aria-expanded]="mobileMenuOpen()">
              <span class="sr-only">Open main menu</span>
              <!-- Hamburger icon -->
              <svg *ngIf="!mobileMenuOpen()" class="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <!-- Close icon -->
              <svg *ngIf="mobileMenuOpen()" class="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div *ngIf="mobileMenuOpen()" class="mobile-menu-content">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <a *ngFor="let item of visibleNavItems()"
               [routerLink]="item.path"
               routerLinkActive="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
               [routerLinkActiveOptions]="{exact: true}"
               (click)="closeMobileMenu()"
               class="mobile-menu-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path [attr.d]="getIconPath(item.icon)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              <span>{{item.label}}</span>
            </a>

            <!-- Mobile Auth Section -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <div *ngIf="authService.isAuthenticated() && !authService.loading()" class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>{{ authService.getUserEmail() }}</span>
                </div>
              </div>

              <button
                *ngIf="!authService.loading()"
                (click)="authService.isAuthenticated() ? logout() : navigateToLogin()"
                [disabled]="isLoggingOut()"
                class="mobile-menu-link w-full text-left disabled:opacity-50 disabled:cursor-not-allowed">
                <svg *ngIf="isLoggingOut()" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <svg *ngIf="!isLoggingOut()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path *ngIf="!authService.isAuthenticated()" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  <path *ngIf="authService.isAuthenticated()" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span>{{ authService.isAuthenticated() ? 'Logout' : 'Login' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }

    .router-link-active {
      @apply text-blue-600 dark:text-blue-400;
    }

    .mobile-menu-button {
      touch-action: manipulation;
    }
  `]
})
export class NavigationComponent {
  private router = inject(Router);
  private document = inject(DOCUMENT);
  protected authService: AuthService = inject(AuthService);

  protected mobileMenuOpen = signal<boolean>(false);
  protected isLoggingOut = signal<boolean>(false);

  constructor() {
    // Toggle body class when mobile menu opens/closes
    effect(() => {
      if (this.mobileMenuOpen()) {
        this.document.body.classList.add('mobile-menu-open');
      } else {
        this.document.body.classList.remove('mobile-menu-open');
      }
    });

    // Close mobile menu when resizing to desktop view
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.mobileMenuOpen()) {
        this.mobileMenuOpen.set(false);
      }
    });
  }

  protected navItems: NavItem[] = [
    { label: 'Home', path: '/', icon: 'home' },
    { label: 'About', path: '/about', icon: 'user' },
    { label: 'Experience', path: '/experience', icon: 'briefcase' },
    { label: 'Testimonials', path: '/testimonials', icon: 'star' },
    { label: 'Skills', path: '/skills', icon: 'code' },
    { label: 'Certificates', path: '/certificates', icon: 'award' },
    { label: 'Projects', path: '/projects', icon: 'folder' },
    { label: 'Blog', path: '/blog', icon: 'document-text' },
    { label: 'Contact', path: '/contact', icon: 'mail' },
    { label: 'Admin', path: '/admin', icon: 'cog', requiresAuth: true }
  ];

  protected visibleNavItems = computed(() => {
    return this.navItems.filter(item => {
      if (item.requiresAuth) {
        return this.authService.isAuthenticated() && this.authService.isAdmin();
      }
      return true;
    });
  });

  toggleMobileMenu() {
    console.log('toggleMobileMenu called');
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
    console.log('mobileMenuOpen:', this.mobileMenuOpen());
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  async logout() {
    this.isLoggingOut.set(true);
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.isLoggingOut.set(false);
    }
  }

  getIconPath(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'user': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'briefcase': 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H6a2 2 0 00-2-2V4m8 0H8m0 0v2H6m2-2V4m8 0v2h2m-2-2V4',
      'star': 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      'code': 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      'award': 'M12 15l3.09 1.636L16 19.5l-5-2.5-5 2.5.91-2.864L10 15V9.5a1.5 1.5 0 013 0V15z M5 3l3.09 1.636L9 7.5 4 5l1-2.5z M19 3l-3.09 1.636L15 7.5l5-2.5-1-2.5z',
      'folder': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
      'document-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'mail': 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      'cog': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    };

    return icons[iconName] || icons['home'];
  }
}
