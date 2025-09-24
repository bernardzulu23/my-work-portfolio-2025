import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainLayoutComponent, NotificationComponent],
  template: `
    <app-main-layout>
      <router-outlet></router-outlet>
    </app-main-layout>
    <app-notification></app-notification>
  `,
  styleUrl: './app.css'
})
export class App implements OnInit {
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Theme service is already initialized in constructor
    // This ensures theme is applied on app startup
  }
}
