import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-20">
      <div class="text-center mb-16">
        <h1 class="section-title">Projects</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A showcase of my recent work and personal projects.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" *ngIf="projects().length > 0; else noProjectsTemplate">
        <div *ngFor="let project of projects(); let i = index"
             class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 animate-slide-up"
             [style.animation-delay]="i * 0.1 + 's'">
          <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-600 relative overflow-hidden">
            <div *ngIf="project.imageUrl" class="w-full h-full">
              <img [src]="project.imageUrl" [alt]="project.title"
                   class="w-full h-full object-cover">
            </div>
            <div class="absolute top-4 right-4">
              <span class="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                {{project.category}}
              </span>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">{{project.title}}</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{{project.description}}</p>

            <div class="mb-4" *ngIf="project.technologies && project.technologies.length > 0">
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let tech of project.technologies.slice(0, 3)"
                      class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                  {{tech}}
                </span>
                <span *ngIf="project.technologies.length > 3"
                      class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                  +{{project.technologies.length - 3}} more
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex space-x-3">
                <a *ngIf="project.liveUrl"
                   [href]="project.liveUrl"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  View Demo
                </a>
                <a *ngIf="project.githubUrl"
                   [href]="project.githubUrl"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  GitHub
                </a>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{project.featured ? 'Featured' : 'Project'}}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noProjectsTemplate>
        <div class="text-center py-20">
          <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Projects Yet</h3>
          <p class="text-gray-600 dark:text-gray-400">Projects will appear here once added through the admin dashboard.</p>
        </div>
      </ng-template>
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

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .section-title {
        font-size: 2rem;
        margin-bottom: 2rem;
      }
    }
  `]
})
export class ProjectsComponent implements OnInit {
  private adminService = inject(AdminService);

  protected projects = computed(() => this.adminService.getProjects());

  ngOnInit() {
    this.adminService.loadInitialData();
  }
}
