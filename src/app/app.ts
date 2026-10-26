import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { ThemeService } from './core/services/theme.service';
import { AdminService } from './core/services/admin.service';

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
export class App implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private adminService = inject(AdminService);

  ngOnInit() {
    this.adminService.startLiveSync(30000);
  }

  ngOnDestroy() {
    this.adminService.stopLiveSync();
  }
}
