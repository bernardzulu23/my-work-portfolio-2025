
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Testimonial, Recommendation } from '../../../../core/types';
@Component({
  selector: 'app-testimonial-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="testimonialForm" (ngSubmit)="onFormSubmit()" class="space-y-6">
      <!-- Form Type Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Testimonial Type *
        </label>
        <div class="flex space-x-4">
          <label class="flex items-center">
            <input
              type="radio"
              formControlName="type"
              value="testimonial"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Testimonial</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              formControlName="type"
              value="recommendation"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Recommendation</span>
          </label>
        </div>
      </div>

      <!-- Author and Position Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Author -->
        <div>
          <label for="author" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Author Name *
          </label>
          <input
            type="text"
            id="author"
            formControlName="author"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Full Name">
          <div *ngIf="testimonialForm.get('author')?.invalid && testimonialForm.get('author')?.touched"
               class="mt-1 text-sm text-red-600">
            Author name is required
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
          <div *ngIf="testimonialForm.get('position')?.invalid && testimonialForm.get('position')?.touched"
               class="mt-1 text-sm text-red-600">
            Position is required
          </div>
        </div>
      </div>

      <!-- Company and Avatar Row -->
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
          <div *ngIf="testimonialForm.get('company')?.invalid && testimonialForm.get('company')?.touched"
               class="mt-1 text-sm text-red-600">
            Company is required
          </div>
        </div>

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
      </div>

      <!-- Content -->
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content *
        </label>
        <textarea
          id="content"
          formControlName="content"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Write the testimonial or recommendation content..."></textarea>
        <div *ngIf="testimonialForm.get('content')?.invalid && testimonialForm.get('content')?.touched"
             class="mt-1 text-sm text-red-600">
          Content is required
        </div>
      </div>

      <!-- Testimonial-specific fields -->
      <div *ngIf="testimonialForm.get('type')?.value === 'testimonial'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Rating -->
          <div>
            <label for="rating" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating *
            </label>
            <select
              id="rating"
              formControlName="rating"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">Select rating</option>
              <option value="5">5 Stars - Excellent</option>
              <option value="4">4 Stars - Very Good</option>
              <option value="3">3 Stars - Good</option>
              <option value="2">2 Stars - Fair</option>
              <option value="1">1 Star - Poor</option>
            </select>
            <div *ngIf="testimonialForm.get('rating')?.invalid && testimonialForm.get('rating')?.touched"
                 class="mt-1 text-sm text-red-600">
              Rating is required
            </div>
          </div>

          <!-- Date -->
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              id="date"
              formControlName="date"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
            <div *ngIf="testimonialForm.get('date')?.invalid && testimonialForm.get('date')?.touched"
                 class="mt-1 text-sm text-red-600">
              Date is required
            </div>
          </div>
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

        <!-- Project -->
        <div>
          <label for="project" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project (optional)
          </label>
          <input
            type="text"
            id="project"
            formControlName="project"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Project or collaboration name">
        </div>

        <!-- Skills -->
        <div>
          <label for="skills" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Skills Demonstrated (comma separated)
          </label>
          <input
            type="text"
            id="skills"
            formControlName="skills"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Technical skills, soft skills, etc.">
          <small class="text-sm text-gray-500 dark:text-gray-400">
            Enter skills separated by commas
          </small>
        </div>

        <!-- Boolean flags -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center">
            <input
              type="checkbox"
              id="verified"
              formControlName="verified"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label for="verified" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Verified testimonial
            </label>
          </div>
          <div class="flex items-center">
            <input
              type="checkbox"
              id="featured"
              formControlName="featured"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label for="featured" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Featured testimonial
            </label>
          </div>
        </div>
      </div>

      <!-- Recommendation-specific fields -->
      <div *ngIf="testimonialForm.get('type')?.value === 'recommendation'" class="space-y-4">
        <!-- Date -->
        <div>
          <label for="recDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date *
          </label>
          <input
            type="date"
            id="recDate"
            formControlName="date"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
          <div *ngIf="testimonialForm.get('date')?.invalid && testimonialForm.get('date')?.touched"
               class="mt-1 text-sm text-red-600">
            Date is required
          </div>
        </div>

        <!-- Company Logo URL -->
        <div>
          <label for="recCompanyLogo" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Logo URL
          </label>
          <input
            type="url"
            id="recCompanyLogo"
            formControlName="companyLogo"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://company.com/logo.png">
        </div>

        <!-- LinkedIn URL -->
        <div>
          <label for="recLinkedinUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            id="recLinkedinUrl"
            formControlName="linkedinUrl"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://linkedin.com/in/username">
        </div>

        <!-- Skills -->
        <div>
          <label for="recSkills" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Skills Mentioned (comma separated)
          </label>
          <input
            type="text"
            id="recSkills"
            formControlName="skills"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Technical skills, soft skills, etc.">
          <small class="text-sm text-gray-500 dark:text-gray-400">
            Enter skills separated by commas
          </small>
        </div>

        <!-- Verified flag -->
        <div class="flex items-center">
          <input
            type="checkbox"
            id="recVerified"
            formControlName="verified"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
          <label for="recVerified" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Verified recommendation
          </label>
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
          [disabled]="testimonialForm.invalid"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {{isEditing ? 'Update' : 'Add'}} {{testimonialForm.get('type')?.value === 'testimonial' ? 'Testimonial' : 'Recommendation'}}
        </button>
      </div>
    </form>
  `
})
export class TestimonialFormComponent implements OnInit {
  @Input() testimonial: Testimonial | Recommendation | null = null;
  @Input() isEditing = false;

  @Output() onSubmit = new EventEmitter<Testimonial | Recommendation>();
  @Output() onCancel = new EventEmitter<void>();

  testimonialForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    if (this.testimonial) {
      this.populateForm();
    }
  }

  private initializeForm() {
    this.testimonialForm = this.fb.group({
      type: ['testimonial', [Validators.required]],
      author: ['', [Validators.required]],
      position: ['', [Validators.required]],
      company: ['', [Validators.required]],
      content: ['', [Validators.required]],
      avatar: [''],
      companyLogo: [''],
      linkedinUrl: [''],

      // Testimonial-specific fields
      rating: ['', [Validators.required]],
      date: ['', [Validators.required]],
      project: [''],
      skills: [''],
      verified: [false],
      featured: [false]
    });

    // Handle type changes
    this.testimonialForm.get('type')?.valueChanges.subscribe(type => {
      this.updateFormValidation(type);
    });
  }

  private updateFormValidation(type: string) {
    const ratingControl = this.testimonialForm.get('rating');
    const dateControl = this.testimonialForm.get('date');

    if (type === 'testimonial') {
      ratingControl?.setValidators([Validators.required]);
      ratingControl?.enable();
    } else {
      ratingControl?.clearValidators();
      ratingControl?.disable();
    }

    ratingControl?.updateValueAndValidity();
  }

  private populateForm() {
    if (this.testimonial) {
      const isTestimonial = 'rating' in this.testimonial;

      this.testimonialForm.patchValue({
        type: isTestimonial ? 'testimonial' : 'recommendation',
        author: this.testimonial.author,
        position: this.testimonial.position,
        company: this.testimonial.company,
        content: this.testimonial.content,
        avatar: this.testimonial.avatar || '',
        companyLogo: this.testimonial.companyLogo || '',
        linkedinUrl: this.testimonial.linkedinUrl || '',
        verified: this.testimonial.verified || false
      });

      if (isTestimonial) {
        const testimonial = this.testimonial as Testimonial;
        this.testimonialForm.patchValue({
          rating: testimonial.rating,
          date: this.formatDateForInput(testimonial.date),
          project: testimonial.project || '',
          skills: testimonial.skills?.join(', ') || '',
          featured: testimonial.featured || false
        });
      } else {
        const recommendation = this.testimonial as Recommendation;
        this.testimonialForm.patchValue({
          date: this.formatDateForInput(recommendation.date),
          skills: recommendation.skills?.join(', ') || ''
        });
      }
    }
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onFormSubmit() {
    if (this.testimonialForm.valid) {
      const formData = this.testimonialForm.value;
      const isTestimonial = formData.type === 'testimonial';

      const baseData = {
        id: this.testimonial?.id || '',
        author: formData.author,
        position: formData.position,
        company: formData.company,
        content: formData.content,
        avatar: formData.avatar || undefined,
        companyLogo: formData.companyLogo || undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
        verified: formData.verified
      };

      if (isTestimonial) {
        const testimonialData: Testimonial = {
          ...baseData,
          rating: parseInt(formData.rating),
          date: new Date(formData.date),
          project: formData.project || undefined,
          skills: formData.skills ? formData.skills.split(',').map((s: string) => s.trim()) : undefined,
          featured: formData.featured
        };
        this.onSubmit.emit(testimonialData);
      } else {
        const recommendationData: Recommendation = {
          ...baseData,
          date: new Date(formData.date),
          skills: formData.skills ? formData.skills.split(',').map((s: string) => s.trim()) : undefined
        };
        this.onSubmit.emit(recommendationData);
      }
    }
  }
}
