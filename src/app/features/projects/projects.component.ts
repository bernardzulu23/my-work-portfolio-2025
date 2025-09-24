import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-600"></div>
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">Project Title</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">Project description goes here...</p>
            <div class="flex space-x-4">
              <button class="bg-blue-600 text-white px-4 py-2 rounded">View</button>
              <button class="border border-gray-300 px-4 py-2 rounded">GitHub</button>
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
  `]
})
export class ProjectsComponent {}
