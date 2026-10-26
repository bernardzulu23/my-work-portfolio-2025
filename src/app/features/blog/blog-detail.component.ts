import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService, type BlogPost } from '../../core/services/admin.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto px-4 py-12 md:py-20">
      <div *ngIf="isLoading(); else contentTemplate">
        <div class="flex justify-center py-20">
          <app-loading-spinner></app-loading-spinner>
        </div>
      </div>

      <ng-template #contentTemplate>
        <article *ngIf="post() as article; else missingTemplate" class="max-w-3xl mx-auto">
          <a routerLink="/blog" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">← All posts</a>
          <p class="mt-6 text-sm text-gray-500 dark:text-gray-400">
            {{ article.publishDate | date:'MMMM d, y' }} · {{ article.readTime }} min read
            <span *ngIf="article.category"> · {{ article.category }}</span>
          </p>
          <h1 class="mt-2 text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">{{ article.title }}</h1>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">{{ article.excerpt }}</p>
          <img *ngIf="article.imageUrl"
               [src]="article.imageUrl"
               [alt]="article.title"
               class="mt-8 w-full max-h-[28rem] object-cover rounded-xl">
          <div class="mt-8 whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">{{ article.content }}</div>
        </article>
      </ng-template>

      <ng-template #missingTemplate>
        <div class="text-center py-20">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Post not found</h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">This article is unpublished or no longer available.</p>
          <a routerLink="/blog" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">Back to the blog</a>
        </div>
      </ng-template>
    </div>
  `
})
export class BlogDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);

  protected isLoading = signal(true);
  protected post = signal<BlogPost | null>(null);

  async ngOnInit() {
    try {
      await this.adminService.refreshData();
      const id = this.route.snapshot.paramMap.get('id');
      const found = this.adminService.blogPosts().find(
        (entry) => entry.id === id && entry.status === 'published'
      );
      this.post.set(found || null);
    } finally {
      this.isLoading.set(false);
    }
  }
}
