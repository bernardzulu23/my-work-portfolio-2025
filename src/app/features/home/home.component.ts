import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ExportService } from '../../core/services/export.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen">
      <!-- Hero Section -->
      <section class="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 overflow-hidden">
        <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div class="container mx-auto px-4 py-20 relative z-10">
          <div class="max-w-4xl mx-auto text-center">
            <div class="animate-fade-in">
              <h1 class="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Hi, I'm <span class="text-purple-600">{{about()?.name}}</span>
              </h1>
              <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {{about()?.title}}
              </p>
              <p class="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                {{about()?.bio}}
              </p>

              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button (click)="onViewWork()" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                  View My Work
                </button>
                <button (click)="onDownloadResume()" class="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg font-semibold text-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                  Download Resume
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating elements -->
        <div class="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-bounce-slow"></div>
        <div class="absolute top-40 right-20 w-16 h-16 bg-purple-400 rounded-full opacity-20 animate-bounce-slow" style="animation-delay: 1s;"></div>
        <div class="absolute bottom-20 left-1/4 w-12 h-12 bg-indigo-400 rounded-full opacity-20 animate-bounce-slow" style="animation-delay: 2s;"></div>
      </section>

      <div *ngIf="isLoading(); else contentTemplate">
        <div class="flex justify-center py-20">
          <app-loading-spinner></app-loading-spinner>
        </div>
      </div>

      <ng-template #contentTemplate>
        <!-- Quick Stats Section -->
        <section class="py-16 bg-white dark:bg-gray-800">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div class="text-center animate-slide-in-left">
              <div class="text-3xl font-bold text-blue-600 mb-2">{{stats().projects}}+</div>
              <div class="text-gray-600 dark:text-gray-400">Projects Completed</div>
            </div>
            <div class="text-center animate-slide-in-left" style="animation-delay: 0.1s;">
              <div class="text-3xl font-bold text-purple-600 mb-2">{{stats().workExperience}}+</div>
              <div class="text-gray-600 dark:text-gray-400">Years Experience</div>
            </div>
            <div class="text-center animate-slide-in-left" style="animation-delay: 0.2s;">
              <div class="text-3xl font-bold text-indigo-600 mb-2">{{stats().certificates}}+</div>
              <div class="text-gray-600 dark:text-gray-400">Certifications</div>
            </div>
            <div class="text-center animate-slide-in-left" style="animation-delay: 0.3s;">
              <div class="text-3xl font-bold text-green-600 mb-2">{{stats().skills}}+</div>
              <div class="text-gray-600 dark:text-gray-400">Technologies</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Projects Section -->
      <section class="py-20 bg-gray-50 dark:bg-gray-900">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="section-title">Featured Projects</h2>
            <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Here are some of my recent projects that showcase my skills and passion for development.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let project of featuredProjects(); let i = index"
                 class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-up"
                 [style.animation-delay]="i * 0.1 + 's'">
              <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <div class="text-white text-6xl font-bold">{{project.title.charAt(0)}}</div>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">{{project.title}}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{{project.description}}</p>

                <div class="flex flex-wrap gap-2 mb-4">
                  <span *ngFor="let tech of project.technologies.slice(0, 3)"
                        class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {{tech}}
                  </span>
                  <span *ngIf="project.technologies.length > 3"
                        class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                    +{{project.technologies.length - 3}} more
                  </span>
                </div>

                <div class="flex space-x-4">
                  <button (click)="onViewProject(project)" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    View Project
                  </button>
                  <button *ngIf="project.githubUrl"
                          class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center mt-12">
            <button (click)="onViewAllProjects()" class="border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 transition-all duration-200">
              View All Projects
            </button>
          </div>
        </div>
      </section>

      <!-- Skills Preview Section -->
      <section class="py-20 bg-white dark:bg-gray-800">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="section-title">Technologies I Work With</h2>
            <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              I specialize in modern web technologies and frameworks to build robust applications.
            </p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div *ngFor="let skill of topSkills(); let i = index"
                 class="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 animate-slide-up"
                 [style.animation-delay]="i * 0.05 + 's'">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-white font-bold text-xl">{{skill.name.charAt(0)}}</span>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">{{skill.name}}</h3>
              <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                     [style.width.%]="skill.proficiency">
                </div>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{skill.proficiency}}% proficiency</span>
            </div>
          </div>

          <div class="text-center mt-12">
            <button (click)="onViewAllSkills()" class="border-2 border-purple-600 text-purple-600 dark:text-purple-400 px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 hover:text-white dark:hover:bg-purple-400 transition-all duration-200">
              View All Skills
            </button>
          </div>
        </div>
      </section>

      <!-- Call to Action Section -->
      <section class="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-4xl font-bold mb-6">Let's Work Together</h2>
          <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            I'm always interested in new opportunities and exciting projects.
            Let's discuss how we can bring your ideas to life.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button (click)="onGetInTouch()" class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200">
              Get In Touch
            </button>
            <button (click)="onViewResume()" class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200">
              View Resume
            </button>
          </div>
        </div>
      </section>
      </ng-template>
    </div>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .bg-grid-pattern {
      background-image:
        linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
      background-size: 20px 20px;
    }

    @media (max-width: 768px) {
      .section-title {
        font-size: 2rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private exportService = inject(ExportService);

  protected isLoading = signal(true);

  protected about = computed(() => this.adminService.getAbout()[0]);

  protected featuredProjects = computed(() =>
    this.adminService.getProjects().filter(project => project.featured)
  );

  protected topSkills = computed(() => {
    const skills = this.adminService.getSkills();
    return skills
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 8);
  });

  protected stats = computed(() => this.adminService.getStats());

  async ngOnInit() {
    try {
      await this.adminService.loadInitialData();
    } finally {
      this.isLoading.set(false);
    }

    // Show welcome notification
    setTimeout(() => {
      this.notificationService.success('Welcome to my portfolio! 🎉', 'Feel free to explore my projects and get in touch.');
    }, 1000);
  }

  // Add method to navigate to experience page
  onViewExperience() {
    this.router.navigate(['/experience']);
    this.notificationService.info('Navigating to experience...', 'Check out my professional journey and education.');
  }

  onViewWork() {
    this.router.navigate(['/projects']);
    this.notificationService.info('Navigating to projects...', 'Check out my featured projects!');
  }

  onDownloadResume() {
    const about = this.adminService.getAbout()[0];
    const skills = this.adminService.getSkills();
    const certificates = this.adminService.getCertificates();

    this.notificationService.success('Resume download started!', 'Your resume will be downloaded shortly.');

    this.exportService.exportResume({
      personalInfo: {
        name: about?.name || '',
        title: about?.title || '',
        summary: about?.bio || '',
        location: about?.location || '',
        email: about?.email || '',
        phone: about?.phone || '',
        website: about?.websiteUrl || '',
        linkedin: about?.linkedinUrl || '',
        github: about?.githubUrl || ''
      },
      experiences: this.adminService.getWorkExperience(),
      education: this.adminService.getEducation(),
      skills: skills.map(skill => skill.name),
      certifications: certificates.map(cert => cert.title)
    }, 'pdf');

    setTimeout(() => {
      this.notificationService.info('Resume ready!', 'Resume download completed successfully.');
    }, 2000);
  }

  onViewProject(project: any) {
    this.router.navigate(['/projects'], { queryParams: { project: project.id } });
    this.notificationService.info(`Opening ${project.title}...`, 'Project details will be displayed.');
  }

  onViewAllProjects() {
    this.router.navigate(['/projects']);
    this.notificationService.info('Loading all projects...', 'Redirecting to projects page.');
  }

  onViewAllSkills() {
    this.router.navigate(['/skills']);
    this.notificationService.info('Loading all skills...', 'Redirecting to skills page.');
  }

  onGetInTouch() {
    this.router.navigate(['/contact']);
    this.notificationService.success('Opening contact form...', 'Let\'s discuss your project!');
  }

  onViewResume() {
    const about = this.adminService.getAbout()[0];
    const skills = this.adminService.getSkills();
    const certificates = this.adminService.getCertificates();

    this.exportService.exportResume({
      personalInfo: {
        name: about?.name || '',
        title: about?.title || '',
        summary: about?.bio || '',
        location: about?.location || '',
        email: about?.email || '',
        phone: about?.phone || '',
        website: about?.websiteUrl || '',
        linkedin: about?.linkedinUrl || '',
        github: about?.githubUrl || ''
      },
      experiences: this.adminService.getWorkExperience(),
      education: this.adminService.getEducation(),
      skills: skills.map(skill => skill.name),
      certifications: certificates.map(cert => cert.title)
    }, 'pdf');
    this.notificationService.info('Opening resume...', 'Resume will be displayed in a new tab.');
  }
}
