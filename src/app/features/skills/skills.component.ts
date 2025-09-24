import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService, Skill } from '../../core/services/portfolio.service';


@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-20">
      <div class="text-center mb-16">
        <h1 class="section-title">Skills & Expertise</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A comprehensive overview of my technical skills and proficiency levels across different technologies.
        </p>
      </div>

      <!-- Skills Overview Cards -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div class="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-slide-up">
          <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Frontend</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Modern web technologies and frameworks</p>
          <div class="text-2xl font-bold text-blue-600">{{getSkillsByCategory('Frontend').length}}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Technologies</div>
        </div>

        <div class="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-slide-up" style="animation-delay: 0.1s;">
          <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Backend</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Server-side development and APIs</p>
          <div class="text-2xl font-bold text-purple-600">{{getSkillsByCategory('Backend').length}}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Technologies</div>
        </div>

        <div class="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-slide-up" style="animation-delay: 0.2s;">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Tools & Others</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Development tools and methodologies</p>
          <div class="text-2xl font-bold text-green-600">{{getSkillsByCategory('Tools').length}}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Technologies</div>
        </div>
      </div>

      <!-- Skills by Category -->
      <div class="space-y-12">
        <!-- Frontend Skills -->
        <div *ngIf="getSkillsByCategory('Frontend').length > 0">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <svg class="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Frontend Development
          </h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let skill of getSkillsByCategory('Frontend'); let i = index"
                 class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up"
                 [style.animation-delay]="i * 0.05 + 's'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{skill.name}}</h3>
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{skill.proficiency}}%</span>
              </div>

              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000"
                     [style.width.%]="skill.proficiency">
                </div>
              </div>

              <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{{skill.yearsOfExperience}} years exp</span>
                <span>{{skill.projects}} projects</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Backend Skills -->
        <div *ngIf="getSkillsByCategory('Backend').length > 0">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <svg class="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
            </svg>
            Backend Development
          </h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let skill of getSkillsByCategory('Backend'); let i = index"
                 class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up"
                 [style.animation-delay]="i * 0.05 + 's'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{skill.name}}</h3>
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{skill.proficiency}}%</span>
              </div>

              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                     [style.width.%]="skill.proficiency">
                </div>
              </div>

              <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{{skill.yearsOfExperience}} years exp</span>
                <span>{{skill.projects}} projects</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tools & Others -->
        <div *ngIf="getSkillsByCategory('Tools').length > 0">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <svg class="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Tools & Technologies
          </h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let skill of getSkillsByCategory('Tools'); let i = index"
                 class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up"
                 [style.animation-delay]="i * 0.05 + 's'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{skill.name}}</h3>
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{skill.proficiency}}%</span>
              </div>

              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                <div class="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000"
                     [style.width.%]="skill.proficiency">
                </div>
              </div>

              <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{{skill.yearsOfExperience}} years exp</span>
                <span>{{skill.projects}} projects</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skills Radar Chart Section -->
      <div class="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Skills Overview</h2>
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div class="text-center">
            <div class="w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <div class="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
              <div class="absolute inset-4 rounded-full border-4 border-purple-200 dark:border-purple-800"></div>
              <div class="absolute inset-8 rounded-full border-4 border-indigo-200 dark:border-indigo-800"></div>
              <div class="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-2xl">Skills</span>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="font-medium text-gray-900 dark:text-white">Frontend Development</span>
              <div class="flex items-center space-x-2">
                <div class="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" style="width: 90%"></div>
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-400">90%</span>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="font-medium text-gray-900 dark:text-white">Backend Development</span>
              <div class="flex items-center space-x-2">
                <div class="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div class="bg-purple-600 h-2 rounded-full" style="width: 85%"></div>
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-400">85%</span>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="font-medium text-gray-900 dark:text-white">Database Design</span>
              <div class="flex items-center space-x-2">
                <div class="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div class="bg-green-600 h-2 rounded-full" style="width: 80%"></div>
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-400">80%</span>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="font-medium text-gray-900 dark:text-white">DevOps & Tools</span>
              <div class="flex items-center space-x-2">
                <div class="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div class="bg-indigo-600 h-2 rounded-full" style="width: 75%"></div>
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-400">75%</span>
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
export class SkillsComponent {
  private portfolioService = inject(PortfolioService);

  protected getSkillsByCategory(category: string): Skill[] {
    return this.portfolioService.getSkills().filter(skill => skill.category === category);
  }
}
