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
        <!-- Background overlay - FIXED: Added pointer-events-auto and relative positioning -->
        <div class="fixed inset-0 transition-opacity pointer-events-auto" 
             [class]="overlayClass"
             (click)="close()">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- Modal panel - FIXED: Added relative positioning and higher z-index -->
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10 pointer-events-auto"
             role="dialog"
             aria-modal="true"
             aria-labelledby="modal-headline"
             (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-headline">
                {{title}}
              </h3>
              <button (click)="close()"
                      type="button"
                      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative z-10 cursor-pointer">
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

          <!-- Footer with action buttons - FIXED: Added relative positioning and z-index -->
          <div *ngIf="showFooter" 
               class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse relative z-10">
            <button type="button"
                    (click)="confirm()"
                    [class]="confirmButtonClass"
                    [disabled]="confirmDisabled"
                    class="relative z-10 cursor-pointer {{confirmButtonClass}}">
              {{confirmText}}
            </button>
            <button type="button"
                    (click)="close()"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm relative z-10 cursor-pointer">
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

    /* Ensure buttons are always clickable */
    button {
      pointer-events: auto !important;
      position: relative;
    }

    /* Prevent overlay from blocking modal content */
    [role="dialog"] {
      pointer-events: auto;
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
    if (this.isOpen) {
      this.close();
    }
  }

  close() {
    this.onClose.emit();
  }

  confirm() {
    if (!this.confirmDisabled) {
      this.onConfirm.emit();
    }
  }
}