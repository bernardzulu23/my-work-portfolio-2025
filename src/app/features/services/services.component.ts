import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesService } from './services/services.service';


export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  deliverables: string[];
  duration: string;
  revisions: number;
  price: number;
  originalPrice?: number;
  popular?: boolean;
  badge?: string;
  icon: string;
}

export interface ConsultationBooking {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  price: number;
  availability: string[];
  requirements: string[];
  outcomes: string[];
}

export interface ServiceComparison {
  id: string;
  feature: string;
  basic: boolean | string;
  standard: boolean | string;
  premium: boolean | string;
  enterprise: boolean | string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Header Section -->
      <section class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-20">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Services & Offerings
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Professional services tailored to help you achieve your digital goals
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                Book Consultation
              </button>
              <button class="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg font-semibold text-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                View Portfolio
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Service Packages Section -->
      <section class="py-20 bg-white dark:bg-gray-800">
        <div class="container mx-auto px-4">
          <div class="max-w-7xl mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Service Packages
              </h2>
              <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Choose the perfect package for your project needs and budget
              </p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div *ngFor="let service of servicePackages; let i = index; trackBy: trackByFn"
                   class="relative bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                   [class.border-2]="service.popular"
                   [class.border-blue-500]="service.popular"
                   [class.scale-105]="service.popular">

                <!-- Popular Badge -->
                <div *ngIf="service.popular"
                     class="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-bl-lg font-semibold text-sm">
                  {{service.badge || 'Most Popular'}}
                </div>

                <!-- Package Header -->
                <div class="p-8 pb-6">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path [attr.d]="getIconPath(service.icon)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                    </div>
                    <div class="text-right">
                      <div class="text-3xl font-bold text-gray-900 dark:text-white">
                        \${{service.price}}
                      </div>
                      <div *ngIf="service.originalPrice" class="text-lg text-gray-500 line-through">
                        \${{service.originalPrice}}
                      </div>
                    </div>
                  </div>

                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {{service.name}}
                  </h3>

                  <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {{service.description}}
                  </p>

                  <div class="text-sm text-gray-500 dark:text-gray-500 mb-6">
                    <span class="flex items-center space-x-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>{{service.duration}}</span>
                    </span>
                  </div>
                </div>

                <!-- Features List -->
                <div class="px-8 pb-8">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-4">What's Included:</h4>
                  <ul class="space-y-3 mb-8">
                    <li *ngFor="let feature of service.features"
                        class="flex items-start space-x-3 text-sm text-gray-600 dark:text-gray-400">
                      <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{{feature}}</span>
                    </li>
                  </ul>

                  <!-- Deliverables -->
                  <div *ngIf="service.deliverables.length > 0" class="mb-8">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Deliverables:</h4>
                    <div class="flex flex-wrap gap-2">
                      <span *ngFor="let deliverable of service.deliverables"
                            class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                        {{deliverable}}
                      </span>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <button class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Service Comparison Section -->
      <section class="py-20 bg-gray-50 dark:bg-gray-900">
        <div class="container mx-auto px-4">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Compare Packages
              </h2>
              <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Find the perfect package that fits your needs and budget
              </p>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full bg-white dark:bg-gray-700 rounded-xl shadow-lg">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-800">
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Features</th>
                    <th class="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Basic</th>
                    <th class="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Standard</th>
                    <th class="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900">Premium</th>
                    <th class="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let comparison of serviceComparisons; let isEven = even"
                      class="border-t border-gray-200 dark:border-gray-600"
                      [class.bg-gray-50]="isEven"
                      [class.dark:bg-gray-800]="isEven">

                    <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {{comparison.feature}}
                    </td>

                    <td class="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      <span *ngIf="typeof comparison.basic === 'boolean'">
                        <svg *ngIf="comparison.basic" class="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <svg *ngIf="!comparison.basic" class="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </span>
                      <span *ngIf="typeof comparison.basic === 'string'">{{comparison.basic}}</span>
                    </td>

                    <td class="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      <span *ngIf="typeof comparison.standard === 'boolean'">
                        <svg *ngIf="comparison.standard" class="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <svg *ngIf="!comparison.standard" class="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </span>
                      <span *ngIf="typeof comparison.standard === 'string'">{{comparison.standard}}</span>
                    </td>

                    <td class="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900">
                      <span *ngIf="typeof comparison.premium === 'boolean'">
                        <svg *ngIf="comparison.premium" class="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <svg *ngIf="!comparison.premium" class="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </span>
                      <span *ngIf="typeof comparison.premium === 'string'">{{comparison.premium}}</span>
                    </td>

                    <td class="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      <span *ngIf="typeof comparison.enterprise === 'boolean'">
                        <svg *ngIf="comparison.enterprise" class="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <svg *ngIf="!comparison.enterprise" class="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </span>
                      <span *ngIf="typeof comparison.enterprise === 'string'">{{comparison.enterprise}}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- Consultation Booking Section -->
      <section class="py-20 bg-white dark:bg-gray-800">
        <div class="container mx-auto px-4">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Book a Consultation
              </h2>
              <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Let's discuss your project requirements and find the best solution for your needs
              </p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div *ngFor="let consultation of consultationBookings; trackBy: trackByFn"
                   class="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 hover:shadow-lg transition-all duration-300">

                <div class="text-center mb-6">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {{consultation.title}}
                  </h3>
                  <div class="text-2xl font-bold text-blue-600 mb-2">
                    \${{consultation.price}}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{consultation.duration}} minutes
                  </div>
                </div>

                <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {{consultation.description}}
                </p>

                <!-- Requirements -->
                <div *ngIf="consultation.requirements.length > 0" class="mb-6">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Requirements:</h4>
                  <ul class="space-y-2">
                    <li *ngFor="let req of consultation.requirements"
                        class="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span class="text-blue-500 mt-1">•</span>
                      <span>{{req}}</span>
                    </li>
                  </ul>
                </div>

                <!-- Outcomes -->
                <div *ngIf="consultation.outcomes.length > 0" class="mb-8">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-3">What you'll get:</h4>
                  <ul class="space-y-2">
                    <li *ngFor="let outcome of consultation.outcomes"
                        class="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span class="text-green-500 mt-1">✓</span>
                      <span>{{outcome}}</span>
                    </li>
                  </ul>
                </div>

                <button class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's discuss your project and create something amazing together
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200">
              Schedule Consultation
            </button>
            <button class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200">
              View Portfolio
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ServicesComponent implements OnInit {
  private servicesService = inject(ServicesService);

  servicePackages: ServicePackage[] = [];
  serviceComparisons: ServiceComparison[] = [];
  consultationBookings: ConsultationBooking[] = [];

  ngOnInit() {
    this.servicesService.loadServicesData();
    this.servicePackages = this.servicesService.getServicePackages();
    this.serviceComparisons = this.servicesService.getServiceComparisons();
    this.consultationBookings = this.servicesService.getConsultationBookings();
  }

  getIconPath(iconName: string): string {
    const icons: { [key: string]: string } = {
      'web': 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      'mobile': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
      'code': 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      'design': 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z',
      'consulting': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'support': 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 5.636v6m0 6v.01'
    };

    return icons[iconName] || icons['web'];
  }

  trackByFn(index: number, item: any): any {
    return item.id;
  }
}
