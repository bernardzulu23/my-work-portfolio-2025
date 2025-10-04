import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { SanitizeHtmlPipe } from '../../shared/pipes';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, SanitizeHtmlPipe],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Header Section -->
      <section class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-20">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Testimonials & Recommendations
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              What clients and colleagues say about working with me
            </p>
            <div class="flex justify-center items-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span>{{averageRating()}} / 5.0 average rating</span>
              </div>
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>{{totalTestimonials()}} testimonials</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Testimonials Carousel -->
      <section class="py-20 bg-white dark:bg-gray-800" *ngIf="featuredTestimonials().length > 0">
        <div class="container mx-auto px-4">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Featured Testimonials
              </h2>
              <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Hand-picked testimonials from clients and colleagues who have experienced my work firsthand
              </p>
            </div>

            <div class="relative">
              <!-- Carousel Container -->
              <div class="overflow-hidden">
                <div class="flex transition-transform duration-500 ease-in-out"
                     [style.transform]="'translateX(-' + currentSlide() * 100 + '%)'">
                  <div *ngFor="let testimonial of featuredTestimonials(); let i = index"
                       class="w-full flex-shrink-0 px-4">
                    <div class="max-w-4xl mx-auto">
                      <div class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 md:p-12 shadow-xl">
                        <!-- Rating -->
                        <div class="flex justify-center mb-6">
                          <div class="flex space-x-1">
                            <svg *ngFor="let star of getStars(testimonial.rating)"
                                 class="w-6 h-6"
                                 [ngClass]="star === 'full' ? 'text-yellow-400' : 'text-gray-300'"
                                 fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          </div>
                        </div>

                        <!-- Content -->
                        <blockquote class="text-xl md:text-2xl text-center text-gray-700 dark:text-gray-300 mb-8 leading-relaxed italic">
                          <span [innerHTML]="testimonial.content | sanitizeHtml"></span>
                        </blockquote>

                        <!-- Author -->
                        <div class="flex items-center justify-center">
                          <div class="flex items-center space-x-4">
                            <div *ngIf="testimonial.avatar" class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                              <span class="text-2xl font-bold text-gray-600">{{testimonial.author.charAt(0)}}</span>
                            </div>
                            <div class="text-center">
                              <div class="font-bold text-lg text-gray-900 dark:text-white">{{testimonial.author}}</div>
                              <div class="text-gray-600 dark:text-gray-400">{{testimonial.position}}</div>
                              <div class="text-blue-600 dark:text-blue-400 font-medium">{{testimonial.company}}</div>
                            </div>
                            <div *ngIf="testimonial.companyLogo" class="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          </div>
                        </div>

                        <!-- Verification Badge -->
                        <div *ngIf="testimonial.verified" class="flex justify-center mt-4">
                          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                            Verified Testimonial
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Carousel Navigation -->
              <div class="flex justify-center mt-8 space-x-2">
                <button *ngFor="let testimonial of featuredTestimonials(); let i = index"
                        (click)="goToSlide(i)"
                        class="w-3 h-3 rounded-full transition-colors duration-200"
                        [ngClass]="i === currentSlide() ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'">
                </button>
              </div>

              <!-- Carousel Arrows -->
              <button (click)="previousSlide()"
                      class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 shadow-lg rounded-full p-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>

              <button (click)="nextSlide()"
                      class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 shadow-lg rounded-full p-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- All Testimonials Grid -->
      <section class="py-20 bg-gray-50 dark:bg-gray-900">
        <div class="container mx-auto px-4">
          <div class="max-w-7xl mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                All Testimonials
              </h2>
              <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Read what clients and colleagues have to say about their experience working with me
              </p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div *ngFor="let testimonial of allTestimonials(); let i = index; trackBy: trackByFn"
                   class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 animate-slide-up"
                   [style.animation-delay]="i * 0.1 + 's'">

                <!-- Rating -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex space-x-1">
                    <svg *ngFor="let star of getStars(testimonial.rating)"
                         class="w-4 h-4"
                         [ngClass]="star === 'full' ? 'text-yellow-400' : 'text-gray-300'"
                         fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </div>
                  <span *ngIf="testimonial.verified" class="text-green-600 dark:text-green-400">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </span>
                </div>

                <!-- Content -->
                <p class="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-4">
                  <span [innerHTML]="testimonial.content | sanitizeHtml"></span>
                </p>

                <!-- Author -->
                <div class="flex items-center space-x-3">
                  <div *ngIf="testimonial.avatar" class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span class="text-sm font-bold text-gray-600">{{testimonial.author.charAt(0)}}</span>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-gray-900 dark:text-white">{{testimonial.author}}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">{{testimonial.position}}</div>
                    <div class="text-sm text-blue-600 dark:text-blue-400">{{testimonial.company}}</div>
                  </div>
                </div>

                <!-- Project Context -->
                <div *ngIf="testimonial.project" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Project: {{testimonial.project}}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- LinkedIn Recommendations Section -->
      <section class="py-20 bg-white dark:bg-gray-800" *ngIf="recommendations().length > 0">
        <div class="container mx-auto px-4">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                LinkedIn Recommendations
              </h2>
              <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Professional recommendations from my LinkedIn network
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
              <div *ngFor="let recommendation of recommendations(); let i = index; trackBy: trackByFn"
                   class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 animate-slide-up"
                   [style.animation-delay]="i * 0.1 + 's'">

                <!-- Author Header -->
                <div class="flex items-center space-x-4 mb-4">
                  <div *ngIf="recommendation.avatar" class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold">{{recommendation.author.charAt(0)}}</span>
                  </div>
                  <div>
                    <div class="font-bold text-gray-900 dark:text-white">{{recommendation.author}}</div>
                    <div class="text-gray-600 dark:text-gray-400">{{recommendation.position}}</div>
                    <div class="text-blue-600 dark:text-blue-400">{{recommendation.company}}</div>
                  </div>
                </div>

                <!-- Content -->
                <p class="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  <span [innerHTML]="recommendation.content | sanitizeHtml"></span>
                </p>

                <!-- LinkedIn Link -->
                <div *ngIf="recommendation.linkedinUrl" class="flex justify-end">
                  <a [href]="recommendation.linkedinUrl"
                     target="_blank"
                     class="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200">
                    <span class="text-sm">View on LinkedIn</span>
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">Ready to Work Together?</h2>
          <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's create something amazing together. Get in touch to discuss your project.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200">
              Start a Project
            </button>
            <button class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200">
              View My Work
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .line-clamp-4 {
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @keyframes slide-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-slide-up {
      animation: slide-up 0.6s ease-out forwards;
    }
  `]
})
export class TestimonialsComponent implements OnInit {
  private adminService = inject(AdminService);

  protected featuredTestimonials = computed(() => this.adminService.getTestimonials().filter(t => t.featured));
  protected allTestimonials = computed(() => this.adminService.getTestimonials());
  protected recommendations = computed(() => this.adminService.getRecommendations());

  protected currentSlide = signal<number>(0);
  protected totalTestimonials = computed(() => this.allTestimonials().length);

  protected averageRating = computed(() => {
    const testimonials = this.allTestimonials();
    if (testimonials.length === 0) return 0;

    const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0);
    return Math.round((totalRating / testimonials.length) * 10) / 10;
  });

  ngOnInit() {
    this.adminService.loadInitialData();
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }

    if (hasHalfStar) {
      stars.push('half');
    }

    while (stars.length < 5) {
      stars.push('empty');
    }

    return stars;
  }

  nextSlide() {
    const featured = this.featuredTestimonials();
    if (featured.length > 0) {
      this.currentSlide.set((this.currentSlide() + 1) % featured.length);
    }
  }

  previousSlide() {
    const featured = this.featuredTestimonials();
    if (featured.length > 0) {
      this.currentSlide.set(this.currentSlide() === 0 ? featured.length - 1 : this.currentSlide() - 1);
    }
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
  }

  trackByFn(index: number, item: any): any {
    return item.id;
  }
}
