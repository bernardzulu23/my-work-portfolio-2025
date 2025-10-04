import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';


export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  companyLogo?: string;
  location: string;
  employmentType: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  gpa?: number;
  honors?: string[];
  description: string;
  institutionLogo?: string;
  location: string;
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Header Section -->
      <section class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-20">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Experience & Education
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              My professional journey and academic background that shaped my expertise
            </p>
          </div>
        </div>
      </section>

      <!-- Work Experience Section -->
      <section class="py-20 bg-white dark:bg-gray-800">
        <div class="container mx-auto px-4">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Work Experience
              </h2>
              <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                A timeline of my professional career and the impactful roles I've held
              </p>
            </div>

            <div class="relative">
              <!-- Timeline line -->
              <div class="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600 transform md:-translate-x-0.5"></div>

              <div class="space-y-12">
                <div *ngFor="let experience of workExperience(); let i = index; let isLast = last; trackBy: trackByFn"
                     class="relative flex items-start"
                     [class.md:flex-row-reverse]="i % 2 === 1">

                  <!-- Timeline dot -->
                  <div class="absolute left-8 md:left-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-800 transform md:-translate-x-2 z-10"></div>

                  <!-- Content -->
                  <div class="ml-16 md:ml-0 md:w-1/2 md:px-8"
                       [class.md:text-right]="i % 2 === 1">

                    <div class="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                      <!-- Company and Position -->
                      <div class="flex items-start justify-between mb-4">
                        <div [class.md:text-right]="i % 2 === 1">
                          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {{experience.position}}
                          </h3>
                          <div class="flex items-center space-x-2 mb-2"
                               [class.md:justify-end]="i % 2 === 1">
                            <span class="text-lg font-semibold text-blue-600">{{experience.company}}</span>
                            <span *ngIf="experience.companyLogo" class="w-6 h-6 bg-gray-200 rounded"></span>
                          </div>
                        </div>
                      </div>

                      <!-- Duration and Location -->
                      <div class="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400"
                           [class.md:justify-end]="i % 2 === 1">
                        <span class="flex items-center space-x-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>{{getDurationText(experience)}}</span>
                        </span>
                        <span class="flex items-center space-x-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <span>{{experience.location}}</span>
                        </span>
                        <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          {{experience.employmentType}}
                        </span>
                      </div>

                      <!-- Description -->
                      <p class="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {{experience.description}}
                      </p>

                      <!-- Achievements -->
                      <div *ngIf="experience.achievements.length > 0" class="mb-4">
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Key Achievements:</h4>
                        <ul class="space-y-1">
                          <li *ngFor="let achievement of experience.achievements"
                              class="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <span class="text-blue-500 mt-1">•</span>
                            <span>{{achievement}}</span>
                          </li>
                        </ul>
                      </div>

                      <!-- Technologies -->
                      <div class="flex flex-wrap gap-2"
                           [class.md:justify-end]="i % 2 === 1">
                        <span *ngFor="let tech of experience.technologies"
                              class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
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
      </section>

      <!-- Education Section -->
      <section class="py-20 bg-gray-50 dark:bg-gray-900">
        <div class="container mx-auto px-4">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Education
              </h2>
              <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                My academic background and continuous learning journey
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
              <div *ngFor="let education of education()"
                   class="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">

                <!-- Institution Header -->
                <div class="flex items-start space-x-4 mb-4">
                  <div *ngIf="education.institutionLogo" class="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {{education.degree}}
                    </h3>
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="text-lg font-semibold text-purple-600">{{education.institution}}</span>
                    </div>
                    <div class="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>{{education.location}}</span>
                    </div>
                  </div>
                </div>

                <!-- Duration and GPA -->
                <div class="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{{getEducationDurationText(education)}}</span>
                  <span *ngIf="education.gpa" class="font-semibold">GPA: {{education.gpa}}</span>
                </div>

                <!-- Description -->
                <p class="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {{education.description}}
                </p>

                <!-- Honors -->
                <div *ngIf="education.honors && education.honors.length > 0">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Honors & Achievements:</h4>
                  <div class="flex flex-wrap gap-2">
                    <span *ngFor="let honor of education.honors"
                          class="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                      {{honor}}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Career Stats Section -->
      <section class="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-3xl font-bold mb-8">Career Highlights</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div class="text-center">
                <div class="text-3xl md:text-4xl font-bold mb-2">{{totalExperience()}}</div>
                <div class="text-blue-100">Years Experience</div>
              </div>
              <div class="text-center">
                <div class="text-3xl md:text-4xl font-bold mb-2">{{workExperience().length}}</div>
                <div class="text-blue-100">Companies</div>
              </div>
              <div class="text-center">
                <div class="text-3xl md:text-4xl font-bold mb-2">{{getTotalTechnologies()}}</div>
                <div class="text-blue-100">Technologies</div>
              </div>
              <div class="text-center">
                <div class="text-3xl md:text-4xl font-bold mb-2">{{getTotalAchievements()}}</div>
                <div class="text-blue-100">Achievements</div>
              </div>
            </div>
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
export class ExperienceComponent implements OnInit {
  private adminService = inject(AdminService);

  protected workExperience = computed(() => this.adminService.getWorkExperience());
  protected education = computed(() => this.adminService.getEducation());

  protected totalExperience = computed(() => {
    const experiences = this.workExperience();
    if (experiences.length === 0) return 0;

    const now = new Date();
    let totalMonths = 0;

    experiences.forEach((exp: any) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.current ? now : new Date(exp.endDate!);
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                    (endDate.getMonth() - startDate.getMonth());
      totalMonths += months;
    });

    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
  });

  ngOnInit() {
    this.adminService.loadInitialData();
  }

  getDurationText(experience: any): string {
    const startDate = new Date(experience.startDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });

    if (experience.current) {
      return `${startDate} - Present`;
    }

    const endDate = new Date(experience.endDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });

    return `${startDate} - ${endDate}`;
  }

  getEducationDurationText(education: any): string {
    const startDate = new Date(education.startDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });

    if (education.current) {
      return `${startDate} - Present`;
    }

    const endDate = new Date(education.endDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });

    return `${startDate} - ${endDate}`;
  }

  getTotalTechnologies(): number {
    const experiences = this.workExperience();
    const technologies = new Set<string>();

    experiences.forEach((exp: any) => {
      exp.technologies.forEach((tech: any) => technologies.add(tech));
    });

    return technologies.size;
  }

  getTotalAchievements(): number {
    const experiences = this.workExperience();
    let total = 0;

    experiences.forEach((exp: any) => {
      total += exp.achievements.length;
    });

    return total;
  }

  trackByFn(index: number, item: any): any {
    return item.id;
  }
}
