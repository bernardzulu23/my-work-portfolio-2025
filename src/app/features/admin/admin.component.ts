import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService, BlogPost, Skill, WorkExperience, Project, Certificate } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { BlogFormComponent } from './components/blog-form/blog-form.component';
import { SkillFormComponent } from './components/skill-form/skill-form.component';
import { ExperienceFormComponent } from './components/experience-form/experience-form.component';
import { ProjectFormComponent } from './components/project-form/project-form.component';
import { CertificateFormComponent } from './components/certificate-form/certificate-form.component';
import { NotificationService } from '../../shared/services/notification.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    BlogFormComponent,
    SkillFormComponent,
    ExperienceFormComponent,
    ProjectFormComponent,
    CertificateFormComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-20">
      <!-- Admin Header -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {{ authService.getUserEmail() }}!
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ authService.getUserEmail() }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Administrator</div>
              </div>
            </div>
            <button
              (click)="logout()"
              [disabled]="isLoggingOut()"
              class="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg *ngIf="isLoggingOut()" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <svg *ngIf="!isLoggingOut()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span>{{ isLoggingOut() ? 'Logging out...' : 'Logout' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="text-center mb-16">
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Manage your portfolio content and analytics.
        </p>
      </div>

      <!-- Statistics Cards -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 class="text-lg font-semibold mb-2">Blog Posts</h3>
          <div class="text-3xl font-bold text-orange-600">{{stats().blogPosts}}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 class="text-lg font-semibold mb-2">Skills</h3>
          <div class="text-3xl font-bold text-green-600">{{stats().skills}}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 class="text-lg font-semibold mb-2">Projects</h3>
          <div class="text-3xl font-bold text-blue-600">{{stats().projects}}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 class="text-lg font-semibold mb-2">Certificates</h3>
          <div class="text-3xl font-bold text-purple-600">{{stats().certificates}}</div>
        </div>
      </div>

      <!-- Content Management Tabs -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              (click)="activeTab.set('blog')"
              [class]="getTabClass('blog')"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Blog Posts
            </button>
            <button
              (click)="activeTab.set('skills')"
              [class]="getTabClass('skills')"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Skills
            </button>
            <button
              (click)="activeTab.set('experience')"
              [class]="getTabClass('experience')"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Experience
            </button>
            <button
              (click)="activeTab.set('projects')"
              [class]="getTabClass('projects')"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Projects
            </button>
            <button
              (click)="activeTab.set('certificates')"
              [class]="getTabClass('certificates')"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Certificates
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Blog Posts Tab -->
          <div *ngIf="activeTab() === 'blog'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold">Blog Posts</h2>
              <button
                (click)="openBlogModal()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                Add New Post
              </button>
            </div>
            <div class="grid gap-4">
              <div *ngFor="let post of blogPosts()"
                    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold">{{post.title}}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm">{{post.excerpt}}</p>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{{post.publishDate | date}}</span>
                      <span>{{post.category}}</span>
                      <span>{{post.readTime}} min read</span>
                      <span [class]="post.status === 'published' ? 'text-green-600' : 'text-yellow-600'">
                        {{post.status}}
                      </span>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      (click)="editBlogPost(post)"
                      class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded">
                      Edit
                    </button>
                    <button
                      (click)="deleteBlogPost(post.id)"
                      class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skills Tab -->
          <div *ngIf="activeTab() === 'skills'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold">Skills</h2>
              <button
                (click)="openSkillModal()"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
                Add New Skill
              </button>
            </div>
            <div class="grid gap-4">
              <div *ngFor="let skill of skills()"
                    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold">{{skill.name}}</h3>
                    <p class="text-gray-600 dark:text-gray-400">{{skill.category}}</p>
                    <div class="flex items-center space-x-4 mt-2">
                      <span class="text-sm">Proficiency: {{skill.proficiency}}%</span>
                      <span class="text-sm">{{skill.yearsOfExperience}} years experience</span>
                      <span class="text-sm">{{skill.projects}} projects</span>
                    </div>
                    <div *ngIf="skill.certifications.length > 0" class="mt-2">
                      <span class="text-sm text-gray-500">Certifications: {{skill.certifications.join(', ')}}</span>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      (click)="editSkill(skill)"
                      class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded">
                      Edit
                    </button>
                    <button
                      (click)="deleteSkill(skill.id)"
                      class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Experience Tab -->
          <div *ngIf="activeTab() === 'experience'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold">Work Experience</h2>
              <button
                (click)="openExperienceModal()"
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
                Add Experience
              </button>
            </div>
            <div class="grid gap-4">
              <div *ngFor="let exp of workExperience()"
                    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold">{{exp.position}}</h3>
                    <p class="text-blue-600">{{exp.company}}</p>
                    <p class="text-gray-600 dark:text-gray-400">{{exp.location}} • {{exp.employmentType}}</p>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{{exp.startDate | date}} - {{exp.current ? 'Present' : (exp.endDate | date)}}</span>
                    </div>
                    <p class="mt-2 text-sm">{{exp.description}}</p>
                    <div *ngIf="exp.achievements.length > 0" class="mt-2">
                      <div class="text-sm">
                        <span class="font-medium">Key Achievements:</span>
                        <ul class="list-disc list-inside mt-1">
                          <li *ngFor="let achievement of exp.achievements">{{achievement}}</li>
                        </ul>
                      </div>
                    </div>
                    <div *ngIf="exp.technologies.length > 0" class="mt-2">
                      <span class="text-sm text-gray-500">Technologies: {{exp.technologies.join(', ')}}</span>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      (click)="editExperience(exp)"
                      class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded">
                      Edit
                    </button>
                    <button
                      (click)="deleteExperience(exp.id)"
                      class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Projects Tab -->
          <div *ngIf="activeTab() === 'projects'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold">Projects</h2>
              <button
                (click)="openProjectModal()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors">
                Add Project
              </button>
            </div>
            <div class="grid gap-4">
              <div *ngFor="let project of projects()"
                    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold">{{project.title}}</h3>
                    <p class="text-gray-600 dark:text-gray-400">{{project.description}}</p>
                    <div class="flex items-center space-x-4 mt-2">
                      <span class="text-sm">{{project.category}}</span>
                      <span [class]="project.status === 'active' ? 'text-green-600' : 'text-gray-600'">
                        {{project.status}}
                      </span>
                      <span *ngIf="project.featured" class="text-yellow-600 text-sm">★ Featured</span>
                    </div>
                    <div *ngIf="project.technologies.length > 0" class="mt-2">
                      <span class="text-sm text-gray-500">Technologies: {{project.technologies.join(', ')}}</span>
                    </div>
                    <div *ngIf="project.githubUrl || project.liveUrl" class="mt-2 space-x-4">
                      <a *ngIf="project.githubUrl" [href]="project.githubUrl" target="_blank"
                         class="text-blue-600 hover:underline text-sm">GitHub</a>
                      <a *ngIf="project.liveUrl" [href]="project.liveUrl" target="_blank"
                         class="text-blue-600 hover:underline text-sm">Live Demo</a>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      (click)="editProject(project)"
                      class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded">
                      Edit
                    </button>
                    <button
                      (click)="deleteProject(project.id)"
                      class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Certificates Tab -->
          <div *ngIf="activeTab() === 'certificates'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold">Certificates</h2>
              <button
                (click)="openCertificateModal()"
                class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors">
                Add Certificate
              </button>
            </div>
            <div class="grid gap-4">
              <div *ngFor="let cert of certificates()"
                    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold">{{cert.title}}</h3>
                    <p class="text-blue-600">{{cert.issuer}}</p>
                    <div class="flex items-center space-x-4 mt-2">
                      <span class="text-sm">{{cert.category}}</span>
                      <span class="text-sm">Issued: {{cert.issueDate | date}}</span>
                      <span *ngIf="cert.expiryDate" class="text-sm">Expires: {{cert.expiryDate | date}}</span>
                      <span *ngIf="cert.verificationBadge" class="text-green-600 text-sm">✓ Verified</span>
                    </div>
                    <div *ngIf="cert.credentialId" class="mt-2">
                      <span class="text-sm text-gray-500">Credential ID: {{cert.credentialId}}</span>
                    </div>
                    <div class="mt-2 space-x-4">
                      <a [href]="cert.pdfUrl" target="_blank"
                         class="text-blue-600 hover:underline text-sm">View PDF</a>
                      <a *ngIf="cert.issuerVerification" [href]="cert.issuerVerification" target="_blank"
                         class="text-blue-600 hover:underline text-sm">Verify</a>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      (click)="editCertificate(cert)"
                      class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded">
                      Edit
                    </button>
                    <button
                      (click)="deleteCertificate(cert.id)"
                      class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Blog Modal -->
      <app-modal
        [isOpen]="blogModalOpen()"
        title="Blog Post"
        (onClose)="closeBlogModal()"
        (onConfirm)="handleBlogSubmit()">
        <app-blog-form
          [blogPost]="selectedBlogPost()"
          [isEditing]="isEditingBlog()"
          (onSubmit)="handleBlogSubmit()"
          (onCancel)="closeBlogModal()">
        </app-blog-form>
      </app-modal>

      <!-- Skill Modal -->
      <app-modal
        [isOpen]="skillModalOpen()"
        title="Skill"
        (onClose)="closeSkillModal()"
        (onConfirm)="handleSkillSubmit()">
        <app-skill-form
          [skill]="selectedSkill()"
          [isEditing]="isEditingSkill()"
          (onSubmit)="handleSkillSubmit()"
          (onCancel)="closeSkillModal()">
        </app-skill-form>
      </app-modal>

      <!-- Experience Modal -->
      <app-modal
        [isOpen]="experienceModalOpen()"
        title="Work Experience"
        (onClose)="closeExperienceModal()"
        (onConfirm)="handleExperienceSubmit()">
        <app-experience-form
          [experience]="selectedExperience()"
          [isEditing]="isEditingExperience()"
          (onSubmit)="handleExperienceSubmit()"
          (onCancel)="closeExperienceModal()">
        </app-experience-form>
      </app-modal>

      <!-- Project Modal -->
      <app-modal
        [isOpen]="projectModalOpen()"
        title="Project"
        (onClose)="closeProjectModal()"
        (onConfirm)="handleProjectSubmit()">
        <app-project-form
          [project]="selectedProject()"
          [isEditing]="isEditingProject()"
          (onSubmit)="handleProjectSubmit()"
          (onCancel)="closeProjectModal()">
        </app-project-form>
      </app-modal>

      <!-- Certificate Modal -->
      <app-modal
        [isOpen]="certificateModalOpen()"
        title="Certificate"
        (onClose)="closeCertificateModal()"
        (onConfirm)="handleCertificateSubmit()">
        <app-certificate-form
          [certificate]="selectedCertificate()"
          [isEditing]="isEditingCertificate()"
          (onSubmit)="handleCertificateSubmit()"
          (onCancel)="closeCertificateModal()">
        </app-certificate-form>
      </app-modal>
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

    .tab-active {
      @apply border-blue-500 text-blue-600;
    }

    .tab-inactive {
      @apply border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300;
    }
  `]
})
export class AdminComponent implements OnInit {
  private router = inject(Router);
  protected authService = inject(AuthService);

  // Active tab state
  activeTab = signal<'blog' | 'skills' | 'experience' | 'projects' | 'certificates'>('blog');

  // Modal states
  blogModalOpen = signal(false);
  skillModalOpen = signal(false);
  experienceModalOpen = signal(false);
  projectModalOpen = signal(false);
  certificateModalOpen = signal(false);

  // Selected items for editing
  selectedBlogPost = signal<BlogPost | null>(null);
  selectedSkill = signal<Skill | null>(null);
  selectedExperience = signal<WorkExperience | null>(null);
  selectedProject = signal<Project | null>(null);
  selectedCertificate = signal<Certificate | null>(null);

  // Edit states
  isEditingBlog = signal(false);
  isEditingSkill = signal(false);
  isEditingExperience = signal(false);
  isEditingProject = signal(false);
  isEditingCertificate = signal(false);

  // Logout state
  isLoggingOut = signal(false);

  // Data from service
  blogPosts = signal<BlogPost[]>([]);
  skills = signal<Skill[]>([]);
  workExperience = signal<WorkExperience[]>([]);
  projects = signal<Project[]>([]);
  certificates = signal<Certificate[]>([]);

  // Computed stats
  stats = computed(() => this.adminService.getStats());

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.blogPosts.set(this.adminService.getBlogPosts());
    this.skills.set(this.adminService.getSkills());
    this.workExperience.set(this.adminService.getWorkExperience());
    this.projects.set(this.adminService.getProjects());
    this.certificates.set(this.adminService.getCertificates());
  }

  // Tab management
  getTabClass(tab: string): string {
    return this.activeTab() === tab
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  }

  // Logout functionality
  async logout() {
    this.isLoggingOut.set(true);
    try {
      await this.authService.signOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.isLoggingOut.set(false);
    }
  }

  // Blog management
  openBlogModal() {
    this.selectedBlogPost.set(null);
    this.isEditingBlog.set(false);
    this.blogModalOpen.set(true);
  }

  editBlogPost(post: BlogPost) {
    this.selectedBlogPost.set(post);
    this.isEditingBlog.set(true);
    this.blogModalOpen.set(true);
  }

  closeBlogModal() {
    this.blogModalOpen.set(false);
    this.selectedBlogPost.set(null);
    this.isEditingBlog.set(false);
  }

  handleBlogSubmit() {
    // This will be handled by the form component
    this.closeBlogModal();
    this.loadData(); // Refresh data
  }

  deleteBlogPost(id: string) {
    if (confirm('Are you sure you want to delete this blog post?')) {
      this.adminService.deleteBlogPost(id);
      this.loadData();
    }
  }

  // Skill management
  openSkillModal() {
    this.selectedSkill.set(null);
    this.isEditingSkill.set(false);
    this.skillModalOpen.set(true);
  }

  editSkill(skill: Skill) {
    this.selectedSkill.set(skill);
    this.isEditingSkill.set(true);
    this.skillModalOpen.set(true);
  }

  closeSkillModal() {
    this.skillModalOpen.set(false);
    this.selectedSkill.set(null);
    this.isEditingSkill.set(false);
  }

  handleSkillSubmit() {
    this.closeSkillModal();
    this.loadData();
  }

  deleteSkill(id: string) {
    if (confirm('Are you sure you want to delete this skill?')) {
      this.adminService.deleteSkill(id);
      this.loadData();
    }
  }

  // Experience management
  openExperienceModal() {
    this.selectedExperience.set(null);
    this.isEditingExperience.set(false);
    this.experienceModalOpen.set(true);
  }

  editExperience(experience: WorkExperience) {
    this.selectedExperience.set(experience);
    this.isEditingExperience.set(true);
    this.experienceModalOpen.set(true);
  }

  closeExperienceModal() {
    this.experienceModalOpen.set(false);
    this.selectedExperience.set(null);
    this.isEditingExperience.set(false);
  }

  handleExperienceSubmit() {
    this.closeExperienceModal();
    this.loadData();
  }

  deleteExperience(id: string) {
    if (confirm('Are you sure you want to delete this experience?')) {
      this.adminService.deleteWorkExperience(id);
      this.loadData();
    }
  }

  // Project management
  openProjectModal() {
    this.selectedProject.set(null);
    this.isEditingProject.set(false);
    this.projectModalOpen.set(true);
  }

  editProject(project: Project) {
    this.selectedProject.set(project);
    this.isEditingProject.set(true);
    this.projectModalOpen.set(true);
  }

  closeProjectModal() {
    this.projectModalOpen.set(false);
    this.selectedProject.set(null);
    this.isEditingProject.set(false);
  }

  handleProjectSubmit() {
    this.closeProjectModal();
    this.loadData();
  }

  deleteProject(id: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.adminService.deleteProject(id);
      this.loadData();
    }
  }

  // Certificate management
  openCertificateModal() {
    this.selectedCertificate.set(null);
    this.isEditingCertificate.set(false);
    this.certificateModalOpen.set(true);
  }

  editCertificate(certificate: Certificate) {
    this.selectedCertificate.set(certificate);
    this.isEditingCertificate.set(true);
    this.certificateModalOpen.set(true);
  }

  closeCertificateModal() {
    this.certificateModalOpen.set(false);
    this.selectedCertificate.set(null);
    this.isEditingCertificate.set(false);
  }

  handleCertificateSubmit() {
    this.closeCertificateModal();
    this.loadData();
  }

  deleteCertificate(id: string) {
    if (confirm('Are you sure you want to delete this certificate?')) {
      this.adminService.deleteCertificate(id);
      this.loadData();
    }
  }
}
