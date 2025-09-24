import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Skill } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-skill-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="skillForm" (ngSubmit)="onFormSubmit()" class="space-y-6">
      <!-- Skill Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Skill Name *
        </label>
        <input
          type="text"
          id="name"
          formControlName="name"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Angular, React, Node.js">
        <div *ngIf="skillForm.get('name')?.invalid && skillForm.get('name')?.touched"
             class="mt-1 text-sm text-red-600">
          Skill name is required
        </div>
      </div>

      <!-- Category and Proficiency Row -->
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
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Database">Database</option>
            <option value="DevOps">DevOps</option>
            <option value="Language">Programming Language</option>
            <option value="Framework">Framework</option>
            <option value="Tool">Tool</option>
            <option value="Cloud">Cloud</option>
            <option value="Other">Other</option>
          </select>
          <div *ngIf="skillForm.get('category')?.invalid && skillForm.get('category')?.touched"
               class="mt-1 text-sm text-red-600">
            Category is required
          </div>
        </div>

        <!-- Proficiency -->
        <div>
          <label for="proficiency" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Proficiency (%) *
          </label>
          <input
            type="number"
            id="proficiency"
            formControlName="proficiency"
            min="0"
            max="100"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="85">
          <div *ngIf="skillForm.get('proficiency')?.invalid && skillForm.get('proficiency')?.touched"
               class="mt-1 text-sm text-red-600">
            Proficiency must be between 0 and 100
          </div>
        </div>
      </div>

      <!-- Years of Experience and Projects Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Years of Experience -->
        <div>
          <label for="yearsOfExperience" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            id="yearsOfExperience"
            formControlName="yearsOfExperience"
            min="0"
            step="0.5"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="3">
          <div *ngIf="skillForm.get('yearsOfExperience')?.invalid && skillForm.get('yearsOfExperience')?.touched"
               class="mt-1 text-sm text-red-600">
            Years of experience is required
          </div>
        </div>

        <!-- Projects Count -->
        <div>
          <label for="projects" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Projects
          </label>
          <input
            type="number"
            id="projects"
            formControlName="projects"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="15">
        </div>
      </div>

      <!-- Certifications -->
      <div>
        <label for="certifications" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Certifications (comma separated)
        </label>
        <input
          type="text"
          id="certifications"
          formControlName="certifications"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="AWS Certified Developer, Google Cloud Professional">
        <small class="text-sm text-gray-500 dark:text-gray-400">
          Enter certifications separated by commas
        </small>
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
          [disabled]="skillForm.invalid"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {{isEditing ? 'Update Skill' : 'Add Skill'}}
        </button>
      </div>
    </form>
  `
})
export class SkillFormComponent implements OnInit {
  @Input() skill: Skill | null = null;
  @Input() isEditing = false;

  @Output() onSubmit = new EventEmitter<Skill>();
  @Output() onCancel = new EventEmitter<void>();

  skillForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    if (this.skill) {
      this.populateForm();
    }
  }

  private initializeForm() {
    this.skillForm = this.fb.group({
      name: ['', [Validators.required]],
      category: ['', [Validators.required]],
      proficiency: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      yearsOfExperience: [0, [Validators.required, Validators.min(0)]],
      projects: [0],
      certifications: ['']
    });
  }

  private populateForm() {
    if (this.skill) {
      this.skillForm.patchValue({
        name: this.skill.name,
        category: this.skill.category,
        proficiency: this.skill.proficiency,
        yearsOfExperience: this.skill.yearsOfExperience,
        projects: this.skill.projects,
        certifications: this.skill.certifications.join(', ')
      });
    }
  }

  onFormSubmit() {
    if (this.skillForm.valid) {
      const formData = this.skillForm.value;

      const skillData: Skill = {
        id: this.skill?.id || '',
        name: formData.name,
        category: formData.category,
        proficiency: formData.proficiency,
        yearsOfExperience: formData.yearsOfExperience,
        projects: formData.projects,
        certifications: formData.certifications ? formData.certifications.split(',').map((cert: string) => cert.trim()) : []
      };

      this.onSubmit.emit(skillData);
    }
  }
}
