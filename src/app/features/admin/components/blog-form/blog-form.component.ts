import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogPost } from '../../../../core/services/admin.service';
import { SanitizeHtmlPipe } from '../../../../shared/pipes';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SanitizeHtmlPipe],
  template: `
    <form [formGroup]="blogForm" (ngSubmit)="onFormSubmit()" class="space-y-6">
      <!-- Title -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          formControlName="title"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter blog post title">
        <div *ngIf="blogForm.get('title')?.invalid && blogForm.get('title')?.touched"
             class="mt-1 text-sm text-red-600">
          Title is required
        </div>
      </div>

      <!-- Excerpt -->
      <div>
        <label for="excerpt" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Excerpt *
        </label>
        <textarea
          id="excerpt"
          formControlName="excerpt"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Brief description of the blog post"></textarea>
        <div *ngIf="blogForm.get('excerpt')?.invalid && blogForm.get('excerpt')?.touched"
             class="mt-1 text-sm text-red-600">
          Excerpt is required
        </div>
      </div>

      <!-- Content with Rich Text Editor -->
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content *
        </label>
        <div id="content-editor" class="min-h-[300px] border border-gray-300 dark:border-gray-600 rounded-md focus-within:ring-blue-500 focus-within:border-blue-500 dark:bg-gray-700"></div>
        <input type="hidden" formControlName="content">
        <div *ngIf="blogForm.get('content')?.invalid && blogForm.get('content')?.touched"
             class="mt-1 text-sm text-red-600">
          Content is required
        </div>
      </div>

      <!-- Image Upload Section -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Featured Image
        </label>
        <div class="space-y-4">
          <!-- Image Preview -->
          <div *ngIf="selectedImage" class="relative">
            <img [src]="selectedImage" alt="Preview" class="w-full max-w-md h-48 object-cover rounded-md border border-gray-300 dark:border-gray-600">
            <button
              type="button"
              (click)="removeImage()"
              class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Upload Controls -->
          <div class="flex items-center space-x-4">
            <input
              type="file"
              #imageInput
              (change)="onImageSelected($event)"
              accept="image/*"
              class="hidden">
            <button
              type="button"
              (click)="imageInput.click()"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              {{selectedImage ? 'Change Image' : 'Upload Image'}}
            </button>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              JPG,PNG, GIF up to 15MB
            </span>
          </div>
        </div>
      </div>

      <!-- Category and Tags Row -->
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
            <option value="Development">Development</option>
            <option value="Tutorial">Tutorial</option>
            <option value="Technology">Technology</option>
            <option value="Career">Career</option>
            <option value="Personal">Personal</option>
          </select>
          <div *ngIf="blogForm.get('category')?.invalid && blogForm.get('category')?.touched"
               class="mt-1 text-sm text-red-600">
            Category is required
          </div>
        </div>

        <!-- Tags -->
        <div>
          <label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            formControlName="tags"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Angular, TypeScript, Tutorial">
        </div>
      </div>

      <!-- Status and Featured Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Status -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status *
          </label>
          <select
            id="status"
            formControlName="status"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <!-- Featured -->
        <div class="flex items-center">
          <input
            type="checkbox"
            id="featured"
            formControlName="featured"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
          <label for="featured" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Featured post
          </label>
        </div>
      </div>

      <!-- Read Time and Image URL Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Read Time -->
        <div>
          <label for="readTime" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Read Time (minutes) *
          </label>
          <input
            type="number"
            id="readTime"
            formControlName="readTime"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="5">
          <div *ngIf="blogForm.get('readTime')?.invalid && blogForm.get('readTime')?.touched"
               class="mt-1 text-sm text-red-600">
            Read time is required
          </div>
        </div>

        <!-- Image URL -->
        <div>
          <label for="imageUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Featured Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            formControlName="imageUrl"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://example.com/image.jpg">
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
          [disabled]="blogForm.invalid"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {{isEditing ? 'Update Post' : 'Create Post'}}
        </button>
      </div>
    </form>
  `
})
export class BlogFormComponent implements OnInit {
  @Input() blogPost: BlogPost | null = null;
  @Input() isEditing = false;

  @Output() onSubmit = new EventEmitter<BlogPost>();
  @Output() onCancel = new EventEmitter<void>();

  blogForm!: FormGroup;
  selectedImage: string | null = null;

  constructor(private fb: FormBuilder) {}

  private sanitizeContent(content: string): string {
    // Remove potentially dangerous tags and attributes
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
    const dangerousAttributes = ['onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout', 'onkeydown', 'onkeyup', 'onkeypress'];

    let sanitized = content;

    // Remove dangerous tags
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis');
      sanitized = sanitized.replace(regex, '');
    });

    // Remove dangerous attributes
    dangerousAttributes.forEach(attr => {
      const regex = new RegExp(`${attr}=["'][^"']*["']`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    // Remove javascript: and other dangerous protocols
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/vbscript:/gi, '');
    sanitized = sanitized.replace(/data:/gi, '');

    return sanitized;
  }

  ngOnInit() {
    this.initializeForm();
    if (this.blogPost) {
      this.populateForm();
    }
  }

  private initializeForm() {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required]],
      excerpt: ['', [Validators.required]],
      content: ['', [Validators.required]],
      category: ['', [Validators.required]],
      tags: [''],
      status: ['draft', [Validators.required]],
      featured: [false],
      readTime: [5, [Validators.required, Validators.min(1)]],
      imageUrl: ['']
    });
  }

  private populateForm() {
    if (this.blogPost) {
      this.blogForm.patchValue({
        title: this.blogPost.title,
        excerpt: this.blogPost.excerpt,
        content: this.blogPost.content,
        category: this.blogPost.category,
        tags: this.blogPost.tags.join(', '),
        status: this.blogPost.status,
        featured: this.blogPost.featured,
        readTime: this.blogPost.readTime,
        imageUrl: this.blogPost.imageUrl || ''
      });
    }
  }

  onFormSubmit() {
    if (this.blogForm.valid) {
      const formData = this.blogForm.value;

      // Sanitize content before saving
      const sanitizedContent = this.sanitizeContent(formData.content);
      const sanitizedExcerpt = this.sanitizeContent(formData.excerpt);

      const blogPostData: BlogPost = {
        id: this.blogPost?.id || '',
        title: formData.title,
        excerpt: sanitizedExcerpt,
        content: sanitizedContent,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
        status: formData.status,
        featured: formData.featured,
        readTime: formData.readTime,
        author: this.blogPost?.author || 'Bernard Zulu',
        publishDate: this.blogPost?.publishDate || new Date(),
        imageUrl: formData.imageUrl || undefined
      };

      this.onSubmit.emit(blogPostData);
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (15MB limit)
      if (file.size > 15 * 1024 * 1024) {
        alert('File size must be less than 15MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
        // Update the imageUrl form control with the base64 data
        this.blogForm.patchValue({
          imageUrl: this.selectedImage
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImage = null;
    this.blogForm.patchValue({
      imageUrl: ''
    });
  }
}
