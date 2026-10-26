import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Education } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-education-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="educationForm" (ngSubmit)="onFormSubmit()" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution *</label>
          <input type="text" formControlName="institution" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location *</label>
          <input type="text" formControlName="location" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Degree *</label>
          <input type="text" formControlName="degree" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Field of Study *</label>
          <input type="text" formControlName="field" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date *</label>
          <input type="date" formControlName="startDate" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
          <input type="date" formControlName="endDate" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
        </div>
        <div class="flex items-end">
          <label class="flex items-center">
            <input type="checkbox" formControlName="current" class="mr-2">
            <span class="text-sm text-gray-700 dark:text-gray-300">Currently studying</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GPA</label>
        <input type="number" step="0.01" min="0" max="4" formControlName="gpa" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
        <textarea rows="4" formControlName="description" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Honors (comma separated)</label>
        <input type="text" formControlName="honors" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
      </div>

      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button type="button" (click)="onCancel.emit()" class="px-4 py-2 border rounded-md text-sm">Cancel</button>
        <button type="submit" [disabled]="educationForm.invalid" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50">
          {{ isEditing ? 'Update Education' : 'Add Education' }}
        </button>
      </div>
    </form>
  `
})
export class EducationFormComponent implements OnInit {
  @Input() education: Education | null = null;
  @Input() isEditing = false;
  @Output() onSubmit = new EventEmitter<Education>();
  @Output() onCancel = new EventEmitter<void>();

  educationForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.educationForm = this.fb.group({
      institution: ['', Validators.required],
      location: ['', Validators.required],
      degree: ['', Validators.required],
      field: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false],
      gpa: [null],
      description: ['', Validators.required],
      honors: ['']
    });

    if (this.education) {
      this.educationForm.patchValue({
        institution: this.education.institution,
        location: this.education.location,
        degree: this.education.degree,
        field: this.education.field,
        startDate: this.formatDate(this.education.startDate),
        endDate: this.education.endDate ? this.formatDate(this.education.endDate) : '',
        current: this.education.current,
        gpa: this.education.gpa,
        description: this.education.description,
        honors: this.education.honors?.join(', ') || ''
      });
    }
  }

  onFormSubmit() {
    if (this.educationForm.invalid) return;

    const formData = this.educationForm.value;
    const education: Education = {
      id: this.education?.id || '',
      institution: formData.institution,
      location: formData.location,
      degree: formData.degree,
      field: formData.field,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      current: formData.current,
      gpa: formData.gpa ?? undefined,
      description: formData.description,
      honors: formData.honors ? formData.honors.split(',').map((h: string) => h.trim()).filter(Boolean) : [],
      institutionLogo: this.education?.institutionLogo
    };

    this.onSubmit.emit(education);
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }
}
