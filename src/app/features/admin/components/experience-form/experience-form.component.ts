import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkExperience } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-experience-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="experienceForm" (ngSubmit)="onFormSubmit()" class="space-y-6">
      <!-- Company and Position Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Company -->
        <div>
          <label for="company" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company *
          </label>
          <input
            type="text"
            id="company"
            formControlName="company"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Company Name">
          <div *ngIf="experienceForm.get('company')?.invalid && experienceForm.get('company')?.touched"
               class="mt-1 text-sm text-red-600">
            Company is required
          </div>
        </div>

        <!-- Position -->
        <div>
          <label for="position" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Position *
          </label>
          <input
            type="text"
            id="position"
            formControlName="position"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Job Title">
          <div *ngIf="experienceForm.get('position')?.invalid && experienceForm.get('position')?.touched"
               class="mt-1 text-sm text-red-600">
            Position is required
          </div>
        </div>
      </div>

      <!-- Location and Employment Type Row -->
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
          <div *ngIf="experienceForm.get('location')?.invalid && experienceForm.get('location')?.touched"
               class="mt-1 text-sm text-red-600">
            Location is required
          </div>
        </div>

        <!-- Employment Type -->
        <div>
          <label for="employmentType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Employment Type *
          </label>
          <select
            id="employmentType"
            formControlName="employmentType"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="">Select type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
            <option value="Internship">Internship</option>
          </select>
          <div *ngIf="experienceForm.get('employmentType')?.invalid && experienceForm.get('employmentType')?.touched"
               class="mt-1 text-sm text-red-600">
            Employment type is required
          </div>
        </div>
      </div>

      <!-- Start Date and Current/End Date Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Start Date -->
        <div>
          <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            formControlName="startDate"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
          <div *ngIf="experienceForm.get('startDate')?.invalid && experienceForm.get('startDate')?.touched"
               class="mt-1 text-sm text-red-600">
            Start date is required
          </div>
        </div>

        <!-- End Date / Current -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <div class="flex items-center space-x-4">
            <input
              type="date"
              formControlName="endDate"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              [disabled]="experienceForm.get('current')?.value">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="current"
                formControlName="current"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="current" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Current
              </label>
            </div>
          </div>
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
          placeholder="Describe your role and responsibilities..."></textarea>
        <div *ngIf="experienceForm.get('description')?.invalid && experienceForm.get('description')?.touched"
             class="mt-1 text-sm text-red-600">
          Description is required
        </div>
      </div>

      <!-- Achievements -->
      <div>
        <label for="achievements" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Key Achievements (one per line)
        </label>
        <textarea
          id="achievements"
          formControlName="achievements"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="• Led 5 major projects\n• Improved performance by 40%\n• Mentored junior developers">
        </textarea>
        <small class="text-sm text-gray-500 dark:text-gray-400">
          Enter each achievement on a new line
        </small>
      </div>

      <!-- Technologies -->
      <div>
        <label for="technologies" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Technologies Used (comma separated)
        </label>
        <input
          type="text"
          id="technologies"
          formControlName="technologies"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Angular, TypeScript, Node.js, MongoDB">
        <small class="text-sm text-gray-500 dark:text-gray-400">
          Enter technologies separated by commas
        </small>
      </div>

      <!-- Company Logo URL -->
      <div>
        <label for="companyLogo" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Company Logo URL
        </label>
        <input
          type="url"
          id="companyLogo"
          formControlName="companyLogo"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="https://company.com/logo.png">
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
          [disabled]="experienceForm.invalid"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {{isEditing ? 'Update Experience' : 'Add Experience'}}
        </button>
      </div>
    </form>
  `
})
export class ExperienceFormComponent implements OnInit {
  @Input() experience: WorkExperience | null = null;
  @Input() isEditing = false;

  @Output() onSubmit = new EventEmitter<WorkExperience>();
  @Output() onCancel = new EventEmitter<void>();

  experienceForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    if (this.experience) {
      this.populateForm();
    }
  }

  private initializeForm() {
    this.experienceForm = this.fb.group({
      company: ['', [Validators.required]],
      position: ['', [Validators.required]],
      location: ['', [Validators.required]],
      employmentType: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      current: [false],
      description: ['', [Validators.required]],
      achievements: [''],
      technologies: [''],
      companyLogo: ['']
    });

    // Handle current job logic
    this.experienceForm.get('current')?.valueChanges.subscribe(current => {
      const endDateControl = this.experienceForm.get('endDate');
      if (current) {
        endDateControl?.disable();
        endDateControl?.setValue('');
      } else {
        endDateControl?.enable();
      }
    });
  }

  private populateForm() {
    if (this.experience) {
      this.experienceForm.patchValue({
        company: this.experience.company,
        position: this.experience.position,
        location: this.experience.location,
        employmentType: this.experience.employmentType,
        startDate: this.formatDateForInput(this.experience.startDate),
        endDate: this.experience.endDate ? this.formatDateForInput(this.experience.endDate) : '',
        current: this.experience.current,
        description: this.experience.description,
        achievements: this.experience.achievements.join('\n'),
        technologies: this.experience.technologies.join(', '),
        companyLogo: this.experience.companyLogo || ''
      });
    }
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onFormSubmit() {
    if (this.experienceForm.valid) {
      const formData = this.experienceForm.value;

      const experienceData: WorkExperience = {
        id: this.experience?.id || '',
        company: formData.company,
        position: formData.position,
        location: formData.location,
        employmentType: formData.employmentType,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        current: formData.current,
        description: formData.description,
        achievements: formData.achievements ? formData.achievements.split('\n').filter((a: string) => a.trim()) : [],
        technologies: formData.technologies ? formData.technologies.split(',').map((t: string) => t.trim()) : [],
        companyLogo: formData.companyLogo || undefined
      };

      this.onSubmit.emit(experienceData);
    }
  }
}
