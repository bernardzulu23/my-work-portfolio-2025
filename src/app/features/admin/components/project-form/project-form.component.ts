import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Project } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="projectForm" (ngSubmit)="onFormSubmit()" class="space-y-6">
      <!-- Title -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Title *
        </label>
        <input
          type="text"
          id="title"
          formControlName="title"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter project title">
        <div *ngIf="projectForm.get('title')?.invalid && projectForm.get('title')?.touched"
             class="mt-1 text-sm text-red-600">
          Project title is required
        </div>
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          formControlName="description"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Describe your project..."></textarea>
        <div *ngIf="projectForm.get('description')?.invalid && projectForm.get('description')?.touched"
             class="mt-1 text-sm text-red-600">
          Description is required
        </div>
      </div>

      <!-- Category and Status Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Category -->
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            id="category"
            formControlName="category"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="">Select category</option>
            <option value="Web Application">Web Application</option>
            <option value="Mobile App">Mobile App</option>
            <option value="Desktop Application">Desktop Application</option>
            <option value="API">API</option>
            <option value="Library">Library</option>
            <option value="Tool">Tool</option>
            <option value="Website">Website</option>
            <option value="Other">Other</option>
          </select>
          <div *ngIf="projectForm.get('category')?.invalid && projectForm.get('category')?.touched"
               class="mt-1 text-sm text-red-600">
            Category is required
          </div>
        </div>

        <!-- Status -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status *
          </label>
          <select
            id="status"
            formControlName="status"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <!-- Featured and Image URL Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Featured -->
        <div class="flex items-center">
          <input
            type="checkbox"
            id="featured"
            formControlName="featured"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
          <label for="featured" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Featured project
          </label>
        </div>

        <!-- Image URL -->
        <div>
          <label for="imageUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Image URL *
          </label>
          <input
            type="url"
            id="imageUrl"
            formControlName="imageUrl"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://example.com/project-image.jpg">
          <div *ngIf="projectForm.get('imageUrl')?.invalid && projectForm.get('imageUrl')?.touched"
               class="mt-1 text-sm text-red-600">
            Image URL is required
          </div>
        </div>
      </div>

      <!-- Technologies -->
      <div>
        <label for="technologies" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Technologies Used (comma separated) *
        </label>
        <input
          type="text"
          id="technologies"
          formControlName="technologies"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Angular, TypeScript, Node.js, MongoDB">
        <div *ngIf="projectForm.get('technologies')?.invalid && projectForm.get('technologies')?.touched"
             class="mt-1 text-sm text-red-600">
          Technologies are required
        </div>
        <small class="text-sm text-gray-500 dark:text-gray-400">
          Enter technologies separated by commas
        </small>
      </div>

      <!-- GitHub URL -->
      <div>
        <label for="githubUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          GitHub Repository URL
        </label>
        <input
          type="url"
          id="githubUrl"
          formControlName="githubUrl"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="https://github.com/username/repository">
      </div>

      <!-- Live URL -->
      <div>
        <label for="liveUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Live Demo URL
        </label>
        <input
          type="url"
          id="liveUrl"
          formControlName="liveUrl"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="https://your-project-demo.com">
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          (click)="onCancel.emit()"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Cancel
        </button>
        <button
          type="submit"
          [disabled]="projectForm.invalid"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {{isEditing ? 'Update Project' : 'Add Project'}}
        </button>
      </div>
    </form>
  `
})
export class ProjectFormComponent implements OnInit {
  @Input() project: Project | null = null;
  @Input() isEditing = false;

  @Output() onSubmit = new EventEmitter<Project>();
  @Output() onCancel = new EventEmitter<void>();

  projectForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    if (this.project) {
      this.populateForm();
    }
  }

  private initializeForm() {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      status: ['active', [Validators.required]],
      featured: [false],
      imageUrl: ['', [Validators.required]],
      technologies: ['', [Validators.required]],
      githubUrl: [''],
      liveUrl: ['']
    });
  }

  private populateForm() {
    if (this.project) {
      this.projectForm.patchValue({
        title: this.project.title,
        description: this.project.description,
        category: this.project.category,
        status: this.project.status,
        featured: this.project.featured,
        imageUrl: this.project.imageUrl,
        technologies: this.project.technologies.join(', '),
        githubUrl: this.project.githubUrl || '',
        liveUrl: this.project.liveUrl || ''
      });
    }
  }

  onFormSubmit() {
    if (this.projectForm.valid) {
      const formData = this.projectForm.value;

      const projectData: Project = {
        id: this.project?.id || '',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        featured: formData.featured,
        imageUrl: formData.imageUrl,
        technologies: formData.technologies.split(',').map((tech: string) => tech.trim()),
        githubUrl: formData.githubUrl || undefined,
        liveUrl: formData.liveUrl || undefined
      };

      this.onSubmit.emit(projectData);
    }
  }
}
