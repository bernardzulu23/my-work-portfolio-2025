import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen"
         class="fixed inset-0 z-50 overflow-y-auto"
         [class]="modalClass">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity" [class]="overlayClass">
          <div class="absolute inset-0 bg-gray-500 opacity-75" (click)="close()"></div>
        </div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
             role="dialog"
             aria-modal="true"
             aria-labelledby="modal-headline">
          <!-- Header -->
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-headline">
                {{title}}
              </h3>
              <button (click)="close()"
                      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Modal content -->
            <div class="mt-3">
              <ng-content></ng-content>
            </div>
          </div>

          <!-- Footer with action buttons -->
          <div *ngIf="showFooter" class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button"
                    (click)="confirm()"
                    [class]="confirmButtonClass"
                    [disabled]="confirmDisabled">
              {{confirmText}}
            </button>
            <button type="button"
                    (click)="close()"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              {{cancelText}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-enter {
      opacity: 0;
    }

    .modal-enter-active {
      opacity: 1;
      transition: opacity 300ms ease-out;
    }

    .modal-leave {
      opacity: 1;
    }

    .modal-leave-active {
      opacity: 0;
      transition: opacity 300ms ease-in;
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Modal Title';
  @Input() showFooter = true;
  @Input() confirmText = 'Save';
  @Input() cancelText = 'Cancel';
  @Input() confirmButtonClass = 'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm';
  @Input() confirmDisabled = false;
  @Input() modalClass = '';
  @Input() overlayClass = '';

  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    this.close();
  }

  close() {
    this.onClose.emit();
  }

  confirm() {
    this.onConfirm.emit();
  }
}
