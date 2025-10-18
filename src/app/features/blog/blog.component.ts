import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { SanitizeHtmlPipe } from '../../shared/pipes';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, SanitizeHtmlPipe, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto px-4 py-20">
      <div class="text-center mb-16">
        <h1 class="section-title">Tech Blog</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Thoughts, tutorials, and insights on web development and technology.
        </p>
      </div>

      <div *ngIf="isLoading(); else contentTemplate">
        <div class="flex justify-center py-20">
          <app-loading-spinner></app-loading-spinner>
        </div>
      </div>

      <ng-template #contentTemplate>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" *ngIf="publishedPosts().length > 0; else noPostsTemplate">
        <article *ngFor="let post of publishedPosts(); let i = index"
                 class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 animate-slide-up"
                 [style.animation-delay]="i * 0.1 + 's'">
          <!-- Featured Image -->
          <div *ngIf="post.imageUrl" class="h-48 bg-gradient-to-br from-blue-400 to-purple-600 relative overflow-hidden">
            <img [src]="post.imageUrl" [alt]="post.title"
                 class="w-full h-full object-cover">
            <div class="absolute top-4 right-4">
              <span class="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                {{post.category}}
              </span>
            </div>
          </div>

          <div class="p-6">
            <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">{{post.title}}</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{{post.excerpt}}</p>

            <!-- Tags -->
            <div class="mb-4" *ngIf="post.tags && post.tags.length > 0">
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let tag of post.tags.slice(0, 3)"
                      class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                  {{tag}}
                </span>
                <span *ngIf="post.tags.length > 3"
                      class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                  +{{post.tags.length - 3}} more
                </span>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{{post.publishDate | date:'MMM dd, yyyy'}}</span>
                <span>{{post.readTime}} min read</span>
              </div>
              <button class="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Read More →
              </button>
            </div>
          </div>
        </article>
        </div>
      </ng-template>

      <ng-template #noPostsTemplate>
        <div class="text-center py-20">
          <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Blog Posts Yet</h3>
          <p class="text-gray-600 dark:text-gray-400">Blog posts will appear here once published through the admin dashboard.</p>
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

    @media (max-width: 768px) {
      .section-title {
        font-size: 2rem;
        margin-bottom: 2rem;
      }
    }
  `]
})
export class BlogComponent implements OnInit {
  private adminService = inject(AdminService);

  protected isLoading = signal(true);

  protected publishedPosts = computed(() =>
    this.adminService.getBlogPosts().filter(post => post.status === 'published')
  );

  async ngOnInit() {
    try {
      await this.adminService.loadInitialData();
    } finally {
      this.isLoading.set(false);
    }
  }
}
