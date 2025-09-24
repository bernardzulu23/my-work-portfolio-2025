import { Injectable, signal, computed, inject, DOCUMENT } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);

  // Theme state using signals
  private isDarkModeSignal = signal<boolean>(false);

  // Computed signals
  currentTheme = computed(() => this.isDarkModeSignal() ? 'dark' : 'light');

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme() {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('portfolio-theme');

    if (savedTheme) {
      this.isDarkModeSignal.set(savedTheme === 'dark');
    } else {
      this.isDarkModeSignal.set(prefersDark);
    }

    this.applyTheme();
    this.watchSystemThemeChanges();
  }

  private watchSystemThemeChanges() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('portfolio-theme')) {
        this.isDarkModeSignal.set(e.matches);
        this.applyTheme();
      }
    });
  }

  toggleTheme() {
    const newTheme = !this.isDarkModeSignal();
    this.isDarkModeSignal.set(newTheme);
    this.applyTheme();
    localStorage.setItem('portfolio-theme', newTheme ? 'dark' : 'light');
  }

  setTheme(theme: 'light' | 'dark') {
    this.isDarkModeSignal.set(theme === 'dark');
    this.applyTheme();
    localStorage.setItem('portfolio-theme', theme);
  }

  private applyTheme() {
    const isDark = this.isDarkModeSignal();

    if (isDark) {
      this.document.documentElement.classList.add('dark');
    } else {
      this.document.documentElement.classList.remove('dark');
    }

    // Update meta theme-color for mobile browsers
    const themeColor = isDark ? '#0f172a' : '#ffffff';
    let metaThemeColor = this.document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = this.document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      this.document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute('content', themeColor);
  }

  // Get current theme state
  getIsDarkMode() {
    return this.isDarkModeSignal();
  }

  // Reset to system preference
  resetToSystemTheme() {
    localStorage.removeItem('portfolio-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkModeSignal.set(prefersDark);
    this.applyTheme();
  }
}
