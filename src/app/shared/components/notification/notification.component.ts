import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        *ngFor="let notification of notifications()"
        [class]="getNotificationClasses(notification.type)"
        class="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
        [style.transform]="notification.visible ? 'translateX(0)' : 'translateX(100%)'"
        [style.transition]="'transform 300ms ease-in-out'">
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <div [class]="getIconClasses(notification.type)">
                <svg *ngIf="notification.type === 'success'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg *ngIf="notification.type === 'error'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <svg *ngIf="notification.type === 'warning'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <svg *ngIf="notification.type === 'info'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{notification.title}}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{notification.message}}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                (click)="removeNotification(notification.id)"
                class="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span class="sr-only">Close</span>
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-enter {
      transform: translateX(100%);
    }

    .notification-enter-active {
      transform: translateX(0);
      transition: transform 300ms ease-in-out;
    }

    .notification-leave {
      transform: translateX(0);
    }

    .notification-leave-active {
      transform: translateX(100%);
      transition: transform 300ms ease-in-out;
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: any;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notifications = this.notificationService.getNotifications();
    // Add visibility tracking to notifications
    this.notifications().forEach((notification: Notification) => {
      if (notification.visible === undefined) {
        notification.visible = true;
      }
    });
  }

  ngOnDestroy() {
    // Cleanup
  }

  getNotificationClasses(type: string): string {
    const baseClasses = 'rounded-md shadow-lg';

    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 dark:bg-green-900 border-l-4 border-green-400`;
      case 'error':
        return `${baseClasses} bg-red-50 dark:bg-red-900 border-l-4 border-red-400`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400`;
      case 'info':
        return `${baseClasses} bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400`;
      default:
        return `${baseClasses} bg-gray-50 dark:bg-gray-900 border-l-4 border-gray-400`;
    }
  }

  getIconClasses(type: string): string {
    const baseClasses = 'flex-shrink-0';

    switch (type) {
      case 'success':
        return `${baseClasses} text-green-400`;
      case 'error':
        return `${baseClasses} text-red-400`;
      case 'warning':
        return `${baseClasses} text-yellow-400`;
      case 'info':
        return `${baseClasses} text-blue-400`;
      default:
        return `${baseClasses} text-gray-400`;
    }
  }

  removeNotification(id: string) {
    this.notificationService.remove(id);
  }
}
