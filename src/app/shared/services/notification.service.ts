import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  visible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private counter = 0;

  getNotifications() {
    return this.notifications.asReadonly();
  }

  show(notification: Omit<Notification, 'id'>) {
    const id = `notification-${++this.counter}`;
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification
    };

    this.notifications.update(notifications => [...notifications, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }

    return id;
  }

  success(title: string, message: string, duration?: number) {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number) {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number) {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number) {
    return this.show({ type: 'info', title, message, duration });
  }

  remove(id: string) {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  clear() {
    this.notifications.set([]);
  }
}
