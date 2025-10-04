import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-20">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="section-title">About Me</h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {{about().bio}}
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div class="animate-slide-in-left">
            <div class="relative">
              <div class="w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl mx-auto mb-8 flex items-center justify-center">
                <div class="w-72 h-72 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <span class="text-8xl font-bold text-gray-400">{{avatarInitials()}}</span>
                </div>
              </div>
              <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center">
                <span class="text-2xl">🚀</span>
              </div>
            </div>
          </div>

          <div class="animate-slide-in-right">
            <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Hi, I'm {{about().name}}</h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {{about().bio}}
            </p>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed" *ngIf="about().tagline">
              {{about().tagline}}
            </p>

            <div class="flex flex-wrap gap-4">
              <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>{{about().location}}</span>
              </div>
              <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <svg class="w-5 h-5" [class]="getAvailabilityColor(about().availability)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{getAvailabilityText(about().availability)}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Values Section -->
        <div class="mb-16" *ngIf="values().length > 0">
          <h2 class="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">My Values</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div *ngFor="let value of values(); let i = index" class="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-slide-up" [style.animation-delay]="(i * 0.1) + 's'">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" [class]="getValueColor(value.color)">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getValueIcon(value.icon)"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{{value.title}}</h3>
              <p class="text-gray-600 dark:text-gray-400">{{value.description}}</p>
            </div>
          </div>
        </div>

        <!-- Experience Timeline -->
        <div *ngIf="experience().length > 0">
          <h2 class="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Experience</h2>
          <div class="space-y-8">
            <div *ngFor="let exp of experience(); let i = index; let isLast = last" class="flex gap-6 animate-slide-in-left" [style.animation-delay]="(i * 0.1) + 's'">
              <div class="flex flex-col items-center">
                <div class="w-12 h-12 rounded-full flex items-center justify-center" [class]="getExperienceColor(i)">
                  <span class="text-white font-bold">{{exp.year}}</span>
                </div>
                <div *ngIf="!isLast" class="w-0.5 h-16 bg-gray-300 dark:bg-gray-600 mt-4"></div>
              </div>
              <div class="flex-1" [class]="isLast ? '' : 'pb-8'">
                <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{{exp.title}}</h3>
                <p class="text-blue-600 dark:text-blue-400 mb-2">{{exp.company}}</p>
                <p class="text-gray-600 dark:text-gray-400">{{exp.description}}</p>
                <div *ngIf="exp.technologies && exp.technologies.length > 0" class="mt-3">
                  <div class="flex flex-wrap gap-2">
                    <span *ngFor="let tech of exp.technologies" class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                      {{tech}}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
        margin-bottom: 2rem;
      }
    }
  `]
})
export class AboutComponent implements OnInit {
  private adminService = inject(AdminService);

  protected about = computed(() => this.adminService.getAbout()[0] || {});
  protected values = computed(() => this.about().values || []);
  protected experience = computed(() => this.about().experience || []);

  // Computed signal for avatar initials
  protected avatarInitials = computed(() => {
    const name = this.about().name;
    if (!name) return 'JD'; // fallback
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  ngOnInit() {
    this.adminService.loadInitialData();
  }

  getAvailabilityText(availability: string): string {
    switch (availability) {
      case 'available':
        return 'Available for opportunities';
      case 'busy':
        return 'Currently busy';
      case 'unavailable':
        return 'Not available';
      default:
        return 'Available for opportunities';
    }
  }

  getAvailabilityColor(availability: string): string {
    switch (availability) {
      case 'available':
        return 'text-green-600';
      case 'busy':
        return 'text-yellow-600';
      case 'unavailable':
        return 'text-red-600';
      default:
        return 'text-green-600';
    }
  }

  getValueIcon(icon: string): string {
    const iconMap: { [key: string]: string } = {
      'lightning-bolt': 'M13 10V3L4 14h7v7l9-11h-7z',
      'heart': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      'users': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    };
    return iconMap[icon] || iconMap['lightning-bolt'];
  }

  getValueColor(color: string): string {
    const colorMap: { [key: string]: string } = {
      'blue': 'bg-blue-100 dark:bg-blue-900 text-blue-600',
      'purple': 'bg-purple-100 dark:bg-purple-900 text-purple-600',
      'green': 'bg-green-100 dark:bg-green-900 text-green-600'
    };
    return colorMap[color] || colorMap['blue'];
  }

  getExperienceColor(index: number): string {
    const colors = ['bg-blue-600', 'bg-purple-600', 'bg-green-600'];
    return colors[index % colors.length];
  }
}
