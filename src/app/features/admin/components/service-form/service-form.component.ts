import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceOffering } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="serviceForm" (ngSubmit)="onFormSubmit()" class="space-y-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
        <input id="title" type="text" formControlName="title"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          placeholder="Web Application Development">
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
        <textarea id="description" formControlName="description" rows="3"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          placeholder="What this service includes..."></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
          <input id="category" type="text" formControlName="category"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="Development">
        </div>
        <div>
          <label for="icon" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
          <select id="icon" formControlName="icon"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="code">Code</option>
            <option value="design">Design</option>
            <option value="consulting">Consulting</option>
            <option value="support">Support</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="duration" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration</label>
          <input id="duration" type="text" formControlName="duration"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="4-8 weeks">
        </div>
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
          <input id="price" type="number" formControlName="price"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
        </div>
        <div>
          <label for="originalPrice" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original price</label>
          <input id="originalPrice" type="number" formControlName="originalPrice"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
        </div>
      </div>

      <div>
        <label for="features" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features (comma separated)</label>
        <input id="features" type="text" formControlName="features"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          placeholder="Responsive UI, API integration">
      </div>

      <div>
        <label for="deliverables" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deliverables (comma separated)</label>
        <input id="deliverables" type="text" formControlName="deliverables"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          placeholder="Source code, Documentation">
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="ctaLabel" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CTA label</label>
          <input id="ctaLabel" type="text" formControlName="ctaLabel"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="Get Started">
        </div>
        <div>
          <label for="ctaUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CTA URL (optional)</label>
          <input id="ctaUrl" type="url" formControlName="ctaUrl"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="Leave blank to use the contact form">
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <select id="status" formControlName="status"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label for="sortOrder" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort order</label>
          <input id="sortOrder" type="number" formControlName="sortOrder"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
        </div>
      </div>

      <div>
        <label for="badge" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Badge</label>
        <input id="badge" type="text" formControlName="badge"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          placeholder="Most Popular">
      </div>

      <div class="flex items-center space-x-6">
        <label class="inline-flex items-center">
          <input type="checkbox" formControlName="featured" class="h-4 w-4 text-blue-600 rounded">
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured on home</span>
        </label>
        <label class="inline-flex items-center">
          <input type="checkbox" formControlName="popular" class="h-4 w-4 text-blue-600 rounded">
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Popular</span>
        </label>
      </div>

      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button type="button" (click)="onCancel.emit()"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300">
          Cancel
        </button>
        <button type="submit" [disabled]="serviceForm.invalid"
          class="px-4 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
          {{ isEditing ? 'Update Service' : 'Add Service' }}
        </button>
      </div>
    </form>
  `
})
export class ServiceFormComponent implements OnInit {
  @Input() service: ServiceOffering | null = null;
  @Input() isEditing = false;
  @Output() onSubmit = new EventEmitter<ServiceOffering>();
  @Output() onCancel = new EventEmitter<void>();

  serviceForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.serviceForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      icon: ['web'],
      duration: [''],
      price: [null],
      originalPrice: [null],
      features: [''],
      deliverables: [''],
      ctaLabel: ['Get Started'],
      ctaUrl: [''],
      status: ['active'],
      sortOrder: [0],
      badge: [''],
      featured: [false],
      popular: [false]
    });

    if (this.service) {
      this.serviceForm.patchValue({
        ...this.service,
        features: (this.service.features || []).join(', '),
        deliverables: (this.service.deliverables || []).join(', ')
      });
    }
  }

  onFormSubmit() {
    if (this.serviceForm.invalid) return;

    const formData = this.serviceForm.value;
    const slug = this.service?.slug || this.toSlug(formData.title);

    this.onSubmit.emit({
      id: this.service?.id || '',
      title: formData.title,
      slug,
      description: formData.description,
      icon: formData.icon,
      category: formData.category,
      features: this.splitList(formData.features),
      deliverables: this.splitList(formData.deliverables),
      duration: formData.duration || undefined,
      price: formData.price != null && formData.price !== '' ? Number(formData.price) : undefined,
      originalPrice: formData.originalPrice != null && formData.originalPrice !== '' ? Number(formData.originalPrice) : undefined,
      popular: !!formData.popular,
      badge: formData.badge || undefined,
      ctaLabel: formData.ctaLabel || 'Get Started',
      ctaUrl: formData.ctaUrl || undefined,
      featured: !!formData.featured,
      status: formData.status,
      sortOrder: Number(formData.sortOrder || 0)
    });
  }

  private splitList(value: string): string[] {
    return String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private toSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}
