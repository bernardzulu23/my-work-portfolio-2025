import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // in milliseconds, undefined means persistent
  action?: {
    label: string;
    callback: () => void;
  };
  icon?: string;
  persistent?: boolean;
}

export interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
  icon?: string;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private notificationId = 0;

  // Computed signals for different notification types
  allNotifications = computed(() => this.notifications());
  activeNotifications = computed(() =>
    this.notifications().filter(n => !n.persistent || n.duration === undefined)
  );
  persistentNotifications = computed(() =>
    this.notifications().filter(n => n.persistent && n.duration === undefined)
  );

  // Default durations for different notification types
  private readonly defaultDurations: Record<NotificationType, number> = {
    success: 5000,
    error: 10000,
    warning: 8000,
    info: 6000
  };

  constructor() {
    // Auto-remove non-persistent notifications after their duration
    setInterval(() => {
      this.removeExpiredNotifications();
    }, 1000);
  }

  // Show a notification
  show(config: NotificationConfig): string {
    const id = this.generateId();
    const notification: Notification = {
      id,
      type: config.type,
      title: config.title,
      message: config.message,
      timestamp: new Date(),
      duration: config.duration || this.defaultDurations[config.type],
      action: config.action,
      icon: config.icon,
      persistent: config.persistent || false
    };

    this.notifications.update(notifications => [...notifications, notification]);

    // Auto-remove after duration if not persistent
    if (!notification.persistent && notification.duration) {
      setTimeout(() => {
        this.remove(id);
      }, notification.duration);
    }

    return id;
  }

  // Convenience methods for different notification types
  success(title: string, message: string, options?: Partial<NotificationConfig>): string {
    return this.show({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  error(title: string, message: string, options?: Partial<NotificationConfig>): string {
    return this.show({
      type: 'error',
      title,
      message,
      ...options
    });
  }

  warning(title: string, message: string, options?: Partial<NotificationConfig>): string {
    return this.show({
      type: 'warning',
      title,
      message,
      ...options
    });
  }

  info(title: string, message: string, options?: Partial<NotificationConfig>): string {
    return this.show({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  // Remove a notification
  remove(id: string): void {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  // Remove all notifications
  clear(): void {
    this.notifications.set([]);
  }

  // Remove all notifications of a specific type
  clearByType(type: NotificationType): void {
    this.notifications.update(notifications =>
      notifications.filter(n => n.type !== type)
    );
  }

  // Get notification by ID
  getNotification(id: string): Notification | undefined {
    return this.notifications().find(n => n.id === id);
  }

  // Update notification
  update(id: string, updates: Partial<Notification>): void {
    this.notifications.update(notifications =>
      notifications.map(n =>
        n.id === id ? { ...n, ...updates } : n
      )
    );
  }

  // Mark notification as read (for persistent notifications)
  markAsRead(id: string): void {
    this.update(id, { persistent: false });
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, persistent: false }))
    );
  }

  // Get notifications count
  getCount(): number {
    return this.notifications().length;
  }

  // Get count by type
  getCountByType(type: NotificationType): number {
    return this.notifications().filter(n => n.type === type).length;
  }

  // Check if there are any notifications
  hasNotifications(): boolean {
    return this.notifications().length > 0;
  }

  // Check if there are notifications of a specific type
  hasNotificationsOfType(type: NotificationType): boolean {
    return this.getCountByType(type) > 0;
  }

  // Bulk operations
  removeMultiple(ids: string[]): void {
    this.notifications.update(notifications =>
      notifications.filter(n => !ids.includes(n.id))
    );
  }

  updateMultiple(updates: Array<{ id: string; updates: Partial<Notification> }>): void {
    this.notifications.update(notifications =>
      notifications.map(n => {
        const update = updates.find(u => u.id === n.id);
        return update ? { ...n, ...update.updates } : n;
      })
    );
  }

  // Notification templates for common scenarios
  showLoading(message: string = 'Loading...'): string {
    return this.info('Loading', message, {
      persistent: true,
      icon: '⏳'
    });
  }

  hideLoading(notificationId: string): void {
    this.remove(notificationId);
  }

  showSuccess(message: string, title: string = 'Success'): string {
    return this.success(title, message, {
      icon: '✅'
    });
  }

  showError(message: string, title: string = 'Error'): string {
    return this.error(title, message, {
      icon: '❌',
      duration: 15000 // Longer duration for errors
    });
  }

  showWarning(message: string, title: string = 'Warning'): string {
    return this.warning(title, message, {
      icon: '⚠️'
    });
  }

  showInfo(message: string, title: string = 'Information'): string {
    return this.info(title, message, {
      icon: 'ℹ️'
    });
  }

  // Network-related notifications
  showNetworkError(message: string = 'Network connection failed'): string {
    return this.error('Connection Error', message, {
      action: {
        label: 'Retry',
        callback: () => {
          // This would typically trigger a retry action
          console.log('Retry network request');
        }
      }
    });
  }

  showOffline(): string {
    return this.warning('Offline', 'You are currently offline', {
      persistent: true,
      icon: '📶'
    });
  }

  showOnline(): string {
    return this.success('Online', 'Connection restored', {
      icon: '📶'
    });
  }

  // Form-related notifications
  showFormSuccess(message: string = 'Form submitted successfully'): string {
    return this.success('Form Submitted', message, {
      icon: '📝'
    });
  }

  showFormError(message: string = 'Please check your input'): string {
    return this.error('Form Error', message, {
      icon: '📝'
    });
  }

  showValidationError(message: string): string {
    return this.warning('Validation Error', message, {
      icon: '⚠️'
    });
  }

  // Certificate expiry notifications
  showCertificateExpiring(certificateName: string, daysUntilExpiry: number): string {
    const message = `${certificateName} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;
    return this.warning('Certificate Expiring', message, {
      persistent: true,
      icon: '📜',
      action: {
        label: 'Renew',
        callback: () => {
          console.log(`Navigate to renew ${certificateName}`);
        }
      }
    });
  }

  showCertificateExpired(certificateName: string): string {
    return this.error('Certificate Expired', `${certificateName} has expired`, {
      persistent: true,
      icon: '📜',
      action: {
        label: 'Renew Now',
        callback: () => {
          console.log(`Navigate to renew ${certificateName}`);
        }
      }
    });
  }

  // Performance notifications
  showPerformanceWarning(metric: string, value: number, threshold: number): string {
    return this.warning('Performance Issue', `${metric} is ${value}ms (threshold: ${threshold}ms)`, {
      icon: '⚡'
    });
  }

  // Analytics notifications
  showAnalyticsUpdate(message: string): string {
    return this.info('Analytics Updated', message, {
      icon: '📊'
    });
  }

  private generateId(): string {
    return `notification-${++this.notificationId}-${Date.now()}`;
  }

  private removeExpiredNotifications(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    this.notifications().forEach(notification => {
      if (notification.duration && !notification.persistent) {
        const elapsed = now - notification.timestamp.getTime();
        if (elapsed > notification.duration) {
          toRemove.push(notification.id);
        }
      }
    });

    if (toRemove.length > 0) {
      this.removeMultiple(toRemove);
    }
  }

  // Export notifications for debugging
  exportNotifications(): Notification[] {
    return [...this.notifications()];
  }

  // Import notifications (for testing or state restoration)
  importNotifications(notifications: Notification[]): void {
    this.notifications.set(notifications);
  }
}
