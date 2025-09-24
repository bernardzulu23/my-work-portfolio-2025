import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { About, AboutValue, AboutExperience } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-about-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="aboutForm" (ngSubmit)="onFormSubmit()" class="space-y-6">
      <!-- Basic Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            formControlName="name"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Your full name">
          <div *ngIf="aboutForm.get('name')?.invalid && aboutForm.get('name')?.touched"
               class="mt-1 text-sm text-red-600">
            Name is required
          </div>
        </div>

        <!-- Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Professional Title *
          </label>
          <input
            type="text"
            id="title"
            formControlName="title"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g. Full Stack Developer">
          <div *ngIf="aboutForm.get('title')?.invalid && aboutForm.get('title')?.touched"
               class="mt-1 text-sm text-red-600">
            Title is required
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="your.email@example.com">
          <div *ngIf="aboutForm.get('email')?.invalid && aboutForm.get('email')?.touched"
               class="mt-1 text-sm text-red-600">
            Valid email is required
          </div>
        </div>

        <!-- Phone -->
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            formControlName="phone"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="+260 123 456 789">
        </div>
      </div>

      <!-- Location and Tagline -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Location -->
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location *
          </label>
          <input
            type="text"
            id="location"
            formControlName="location"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="City, Country">
          <div *ngIf="aboutForm.get('location')?.invalid && aboutForm.get('location')?.touched"
               class="mt-1 text-sm text-red-600">
            Location is required
          </div>
        </div>

        <!-- Tagline -->
        <div>
          <label for="tagline" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tagline *
          </label>
          <input
            type="text"
            id="tagline"
            formControlName="tagline"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Brief professional tagline">
          <div *ngIf="aboutForm.get('tagline')?.invalid && aboutForm.get('tagline')?.touched"
               class="mt-1 text-sm text-red-600">
            Tagline is required
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div>
        <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bio *
        </label>
        <textarea
          id="bio"
          formControlName="bio"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Tell us about yourself, your background, and what you do..."></textarea>
        <div *ngIf="aboutForm.get('bio')?.invalid && aboutForm.get('bio')?.touched"
             class="mt-1 text-sm text-red-600">
          Bio is required
        </div>
      </div>

      <!-- Availability -->
      <div>
        <label for="availability" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Availability Status *
        </label>
        <select
          id="availability"
          formControlName="availability"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
          <option value="">Select availability</option>
          <option value="available">Available for work</option>
          <option value="busy">Busy with current projects</option>
          <option value="unavailable">Not available</option>
        </select>
        <div *ngIf="aboutForm.get('availability')?.invalid && aboutForm.get('availability')?.touched"
             class="mt-1 text-sm text-red-600">
          Availability status is required
        </div>
      </div>

      <!-- Social Links -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Avatar URL -->
        <div>
          <label for="avatar" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Avatar URL
          </label>
          <input
            type="url"
            id="avatar"
            formControlName="avatar"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://example.com/avatar.jpg">
        </div>

        <!-- Resume URL -->
        <div>
          <label for="resumeUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resume URL
          </label>
          <input
            type="url"
            id="resumeUrl"
            formControlName="resumeUrl"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://example.com/resume.pdf">
        </div>
      </div>

      <!-- Social Links Row 2 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- LinkedIn URL -->
        <div>
          <label for="linkedinUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            id="linkedinUrl"
            formControlName="linkedinUrl"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://linkedin.com/in/username">
        </div>

        <!-- GitHub URL -->
        <div>
          <label for="githubUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub URL
          </label>
          <input
            type="url"
            id="githubUrl"
            formControlName="githubUrl"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://github.com/username">
        </div>

        <!-- Website URL -->
        <div>
          <label for="websiteUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website URL
          </label>
          <input
            type="url"
            id="websiteUrl"
            formControlName="websiteUrl"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://yourwebsite.com">
        </div>
      </div>

      <!-- Values Section -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Core Values</h3>
        <div formArrayName="values" class="space-y-4">
          <div *ngFor="let valueControl of valuesArray.controls; let i = index"
               [formGroupName]="i"
               class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Value Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Value Title *
                </label>
                <input
                  type="text"
                  formControlName="title"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Innovation">
              </div>

              <!-- Value Icon -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon Name *
                </label>
                <input
                  type="text"
                  formControlName="icon"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. lightbulb, heart, users">
              </div>
            </div>

            <!-- Value Description -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                formControlName="description"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe this core value..."></textarea>
            </div>

            <!-- Value Color -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color Theme
              </label>
              <select
                formControlName="color"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="red">Red</option>
                <option value="yellow">Yellow</option>
                <option value="indigo">Indigo</option>
                <option value="pink">Pink</option>
                <option value="gray">Gray</option>
              </select>
            </div>

            <!-- Remove Value Button -->
            <div class="mt-4 flex justify-end">
              <button
                type="button"
                (click)="removeValue(i)"
                class="text-red-600 hover:text-red-800 text-sm">
                Remove Value
              </button>
            </div>
          </div>
        </div>

        <!-- Add Value Button -->
        <div class="mt-4">
          <button
            type="button"
            (click)="addValue()"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
            Add Core Value
          </button>
        </div>
      </div>

      <!-- Experience Section -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Experience Timeline</h3>
        <div formArrayName="experience" class="space-y-4">
          <div *ngFor="let expControl of experienceArray.controls; let i = index"
               [formGroupName]="i"
               class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Year -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year *
                </label>
                <input
                  type="text"
                  formControlName="year"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. 2024, 2023-2024">
              </div>

              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  formControlName="title"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Job title or role">
              </div>
            </div>

            <!-- Company -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company *
              </label>
              <input
                type="text"
                formControlName="company"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Company or organization name">
            </div>

            <!-- Description -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                formControlName="description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe your role and responsibilities..."></textarea>
            </div>

            <!-- Technologies -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Technologies (comma separated)
              </label>
              <input
                type="text"
                formControlName="technologies"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Angular, Node.js, TypeScript, etc.">
              <small class="text-sm text-gray-500 dark:text-gray-400">
                Enter technologies separated by commas
              </small>
            </div>

            <!-- Remove Experience Button -->
            <div class="mt-4 flex justify-end">
              <button
                type="button"
                (click)="removeExperience(i)"
                class="text-red-600 hover:text-red-800 text-sm">
                Remove Experience
              </button>
            </div>
          </div>
        </div>

        <!-- Add Experience Button -->
        <div class="mt-4">
          <button
            type="button"
            (click)="addExperience()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
            Add Experience
          </button>
        </div>
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
          [disabled]="aboutForm.invalid"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {{isEditing ? 'Update' : 'Add'}} About Information
        </button>
      </div>
    </form>
  `
})
export class AboutFormComponent implements OnInit {
  @Input() about: About | null = null;
  @Input() isEditing = false;

  @Output() onSubmit = new EventEmitter<About>();
  @Output() onCancel = new EventEmitter<void>();

  aboutForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    if (this.about) {
      this.populateForm();
    }
  }

  private initializeForm() {
    this.aboutForm = this.fb.group({
      name: ['', [Validators.required]],
      title: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      location: ['', [Validators.required]],
      tagline: ['', [Validators.required]],
      bio: ['', [Validators.required]],
      availability: ['', [Validators.required]],
      avatar: [''],
      resumeUrl: [''],
      linkedinUrl: [''],
      githubUrl: [''],
      websiteUrl: [''],
      values: this.fb.array([]),
      experience: this.fb.array([])
    });
  }

  get valuesArray() {
    return this.aboutForm.get('values') as any;
  }

  get experienceArray() {
    return this.aboutForm.get('experience') as any;
  }

  private populateForm() {
    if (this.about) {
      this.aboutForm.patchValue({
        name: this.about.name,
        title: this.about.title,
        email: this.about.email,
        phone: this.about.phone || '',
        location: this.about.location,
        tagline: this.about.tagline,
        bio: this.about.bio,
        availability: this.about.availability,
        avatar: this.about.avatar || '',
        resumeUrl: this.about.resumeUrl || '',
        linkedinUrl: this.about.linkedinUrl || '',
        githubUrl: this.about.githubUrl || '',
        websiteUrl: this.about.websiteUrl || ''
      });

      // Populate values
      this.about.values.forEach(value => {
        this.addValue(value);
      });

      // Populate experience
      this.about.experience.forEach(exp => {
        this.addExperience(exp);
      });
    }
  }

  addValue(value?: AboutValue): void {
    const valueGroup = this.fb.group({
      title: [value?.title || '', [Validators.required]],
      description: [value?.description || '', [Validators.required]],
      icon: [value?.icon || '', [Validators.required]],
      color: [value?.color || 'blue']
    });

    this.valuesArray.push(valueGroup);
  }

  removeValue(index: number) {
    this.valuesArray.removeAt(index);
  }

  addExperience(experience?: AboutExperience): void {
    const expGroup = this.fb.group({
      year: [experience?.year || '', [Validators.required]],
      title: [experience?.title || '', [Validators.required]],
      company: [experience?.company || '', [Validators.required]],
      description: [experience?.description || '', [Validators.required]],
      technologies: [experience?.technologies?.join(', ') || '']
    });

    this.experienceArray.push(expGroup);
  }

  removeExperience(index: number) {
    this.experienceArray.removeAt(index);
  }

  onFormSubmit() {
    if (this.aboutForm.valid) {
      const formData = this.aboutForm.value;

      const aboutData: About = {
        id: this.about?.id || '',
        name: formData.name,
        title: formData.title,
        email: formData.email,
        phone: formData.phone || undefined,
        location: formData.location,
        tagline: formData.tagline,
        bio: formData.bio,
        availability: formData.availability,
        avatar: formData.avatar || undefined,
        resumeUrl: formData.resumeUrl || undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
        githubUrl: formData.githubUrl || undefined,
        websiteUrl: formData.websiteUrl || undefined,
        values: formData.values.map((v: any) => ({
          id: v.id || this.generateId(),
          title: v.title,
          description: v.description,
          icon: v.icon,
          color: v.color
        })),
        experience: formData.experience.map((e: any) => ({
          id: e.id || this.generateId(),
          year: e.year,
          title: e.title,
          company: e.company,
          description: e.description,
          technologies: e.technologies ? e.technologies.split(',').map((t: string) => t.trim()) : undefined
        }))
      };

      this.onSubmit.emit(aboutData);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
