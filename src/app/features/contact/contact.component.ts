import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../shared/services/notification.service';
import { AnalyticsService } from '../../core/services/analytics.service';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-20">
      <div class="text-center mb-16">
        <h1 class="section-title">Get In Touch</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Let's discuss your project and see how we can work together.
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <!-- Contact Information -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Contact Information</h2>

          <div class="space-y-6">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">Email</h3>
                <a href="mailto:bernardzulu23@gmail.com" class="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  bernardzulu23@gmail.com
                </a>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">Phone</h3>
                <a href="tel:+260977934996" class="text-green-600 hover:text-green-700 dark:text-green-400">
                  +260 977 934 996
                </a>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">Location</h3>
                <p class="text-gray-600 dark:text-gray-400">Lusaka, Zambia</p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">LinkedIn</h3>
                <a href="https://linkedin.com/in/bernard-zulu-071977224" target="_blank" rel="noopener noreferrer"
                   class="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  linkedin.com/in/bernard-zulu-071977224
                </a>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">GitHub</h3>
                <a href="https://github.com/bernardzulu23" target="_blank" rel="noopener noreferrer"
                   class="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                  github.com/bernardzulu23
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Send Message</h2>

          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name *</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  [class.border-red-500]="isFieldInvalid('name')"
                  placeholder="Your full name">
                <div *ngIf="isFieldInvalid('name')" class="text-red-500 text-sm mt-1">
                  Name is required
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email *</label>
                <input
                  type="email"
                  formControlName="email"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  [class.border-red-500]="isFieldInvalid('email')"
                  placeholder="your.email@example.com">
                <div *ngIf="isFieldInvalid('email')" class="text-red-500 text-sm mt-1">
                  <span *ngIf="contactForm.get('email')?.errors?.['required']">Email is required</span>
                  <span *ngIf="contactForm.get('email')?.errors?.['email']">Please enter a valid email</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Subject *</label>
              <input
                type="text"
                formControlName="subject"
                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                [class.border-red-500]="isFieldInvalid('subject')"
                placeholder="What's this about?">
              <div *ngIf="isFieldInvalid('subject')" class="text-red-500 text-sm mt-1">
                Subject is required
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Message *</label>
              <textarea
                rows="6"
                formControlName="message"
                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
                [class.border-red-500]="isFieldInvalid('message')"
                placeholder="Tell me about your project or inquiry..."></textarea>
              <div *ngIf="isFieldInvalid('message')" class="text-red-500 text-sm mt-1">
                Message is required
              </div>
            </div>

            <button
              type="submit"
              [disabled]="contactForm.invalid || isSubmitting()"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
              <span *ngIf="!isSubmitting()">Send Message</span>
              <span *ngIf="isSubmitting()" class="flex items-center space-x-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    @media (max-width: 768px) {
      .section-title {
        font-size: 2rem;
      }
    }
  `]
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private analyticsService = inject(AnalyticsService);

  protected contactForm: FormGroup;
  protected isSubmitting = signal(false);

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit() {
    if (this.contactForm.invalid) {
      this.markFormGroupTouched();
      this.notificationService.error('Please fill in all required fields correctly', 'Form validation failed');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formData: ContactForm = this.contactForm.value;

      // Here you would typically send the data to your backend
      // For now, we'll simulate sending an email
      await this.simulateEmailSend(formData);

      // Track contact form submission
      this.analyticsService.trackEvent('contact_form_submitted', {
        subject: formData.subject,
        hasMessage: formData.message.length > 0
      });

      this.notificationService.success(
        'Message sent successfully! 🎉',
        'Thank you for reaching out. I\'ll get back to you within 24 hours.'
      );

      this.contactForm.reset();

    } catch (error) {
      console.error('Error sending message:', error);
      this.notificationService.error(
        'Failed to send message',
        'Please try again or contact me directly via email.'
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  private async simulateEmailSend(formData: ContactForm): Promise<void> {
    // Simulate API call delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Email service temporarily unavailable'));
        }
      }, 1500);
    });
  }
}
