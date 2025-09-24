import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="flex items-center justify-center" [class]="containerClass">
      <div class="animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
           [class]="spinnerClass">
      </div>
      <span *ngIf="message" class="ml-3 text-gray-600 dark:text-gray-400">{{message}}</span>
    </div>
  `,
  styles: [`
    .spinner-sm {
      width: 1rem;
      height: 1rem;
      border-width: 2px;
    }

    .spinner-md {
      width: 2rem;
      height: 2rem;
      border-width: 3px;
    }

    .spinner-lg {
      width: 3rem;
      height: 3rem;
      border-width: 4px;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() visible = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() message = '';
  @Input() containerClass = '';

  get spinnerClass(): string {
    const baseClasses = 'animate-spin rounded-full border-4 border-gray-300 border-t-blue-600';

    switch (this.size) {
      case 'sm':
        return `${baseClasses} spinner-sm`;
      case 'lg':
        return `${baseClasses} spinner-lg`;
      default:
        return `${baseClasses} spinner-md`;
    }
  }
}
