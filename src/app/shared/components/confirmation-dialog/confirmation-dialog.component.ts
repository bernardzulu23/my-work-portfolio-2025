import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity" (click)="onCancel.emit()">
          <div class="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10"
                   [class]="getIconContainerClasses()">
                <div [class]="getIconClasses()">
                  <svg *ngIf="type === 'danger'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <svg *ngIf="type === 'warning'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <svg *ngIf="type === 'info'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  {{title}}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{message}}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              (click)="onConfirm.emit()"
              [class]="getConfirmButtonClasses()"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
              {{confirmText}}
            </button>
            <button
              type="button"
              (click)="onCancel.emit()"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              {{cancelText}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfirmationDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  getIconContainerClasses(): string {
    const baseClasses = 'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10';

    switch (this.type) {
      case 'danger':
        return `${baseClasses} bg-red-100 dark:bg-red-900`;
      case 'warning':
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900`;
      case 'info':
        return `${baseClasses} bg-blue-100 dark:bg-blue-900`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-900`;
    }
  }

  getIconClasses(): string {
    const baseClasses = 'flex-shrink-0';

    switch (this.type) {
      case 'danger':
        return `${baseClasses} text-red-600 dark:text-red-400`;
      case 'warning':
        return `${baseClasses} text-yellow-600 dark:text-yellow-400`;
      case 'info':
        return `${baseClasses} text-blue-600 dark:text-blue-400`;
      default:
        return `${baseClasses} text-gray-600 dark:text-gray-400`;
    }
  }

  getConfirmButtonClasses(): string {
    const baseClasses = 'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm';

    switch (this.type) {
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500`;
      case 'info':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
      default:
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 focus:ring-gray-500`;
    }
  }
}
