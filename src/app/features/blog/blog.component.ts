import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-20">
      <div class="text-center mb-16">
        <h1 class="section-title">Tech Blog</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Thoughts, tutorials, and insights on web development and technology.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <article class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">Blog Post Title</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">Post excerpt...</p>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">Jan 15, 2025</span>
              <button class="text-blue-600">Read More</button>
            </div>
          </div>
        </article>
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
  `]
})
export class BlogComponent {}
