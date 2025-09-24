import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Certificate } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-certificate-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="certificateForm" (ngSubmit)="onFormSubmit()" class="space-y-6">
      <!-- Title and Issuer Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Certificate Title *
          </label>
          <input
            type="text"
            id="title"
            formControlName="title"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., AWS Certified Developer">
          <div *ngIf="certificateForm.get('title')?.invalid && certificateForm.get('title')?.touched"
               class="mt-1 text-sm text-red-600">
            Certificate title is required
          </div>
        </div>

        <!-- Issuer -->
        <div>
          <label for="issuer" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Issuing Organization *
          </label>
          <input
            type="text"
            id="issuer"
            formControlName="issuer"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Amazon Web Services">
          <div *ngIf="certificateForm.get('issuer')?.invalid && certificateForm.get('issuer')?.touched"
               class="mt-1 text-sm text-red-600">
            Issuer is required
          </div>
        </div>
      </div>

      <!-- Category and Issue Date Row -->
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
            <option value="Cloud">Cloud</option>
            <option value="Programming">Programming</option>
            <option value="Database">Database</option>
            <option value="Security">Security</option>
            <option value="DevOps">DevOps</option>
            <option value="Project Management">Project Management</option>
            <option value="Design">Design</option>
            <option value="Other">Other</option>
          </select>
          <div *ngIf="certificateForm.get('category')?.invalid && certificateForm.get('category')?.touched"
               class="mt-1 text-sm text-red-600">
            Category is required
          </div>
        </div>

        <!-- Issue Date -->
        <div>
          <label for="issueDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Issue Date *
          </label>
          <input
            type="date"
            id="issueDate"
            formControlName="issueDate"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
          <div *ngIf="certificateForm.get('issueDate')?.invalid && certificateForm.get('issueDate')?.touched"
               class="mt-1 text-sm text-red-600">
            Issue date is required
          </div>
        </div>
      </div>

      <!-- Expiry Date and Credential ID Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Expiry Date -->
        <div>
          <label for="expiryDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Expiry Date (optional)
          </label>
          <input
            type="date"
            id="expiryDate"
            formControlName="expiryDate"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
        </div>

        <!-- Credential ID -->
        <div>
          <label for="credentialId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Credential ID
          </label>
          <input
            type="text"
            id="credentialId"
            formControlName="credentialId"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="AWS-DEV-12345">
        </div>
      </div>

      <!-- File Upload Section -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Certificate File *
        </label>
        <div class="space-y-4">
          <!-- File Preview -->
          <div *ngIf="selectedFile" class="relative">
            <div *ngIf="isImageFile(selectedFile)" class="relative">
              <img [src]="selectedFile" alt="Preview" class="w-full max-w-md h-48 object-cover rounded-md border border-gray-300 dark:border-gray-600">
            </div>
            <div *ngIf="!isImageFile(selectedFile)" class="w-full max-w-md h-48 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{getFileName()}}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500">{{getFileSize()}}</p>
              </div>
            </div>
            <button
              type="button"
              (click)="removeFile()"
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
              #fileInput
              (change)="onFileSelected($event)"
              accept=".pdf,.jpg,.jpeg,.gif,.png,.mpeg,.mp4"
              class="hidden">
            <button
              type="button"
              (click)="fileInput.click()"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              {{selectedFile ? 'Change File' : 'Upload Certificate'}}
            </button>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              PDF, JPG, MPEG, GIF, PNG up to 20MB
            </span>
          </div>
        </div>
        <div *ngIf="certificateForm.get('pdfUrl')?.invalid && certificateForm.get('pdfUrl')?.touched"
             class="mt-1 text-sm text-red-600">
          Certificate file is required
        </div>
      </div>

      <!-- Thumbnail URL (Optional) -->
      <div>
        <label for="thumbnailUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Thumbnail Image URL (optional)
        </label>
        <input
          type="url"
          id="thumbnailUrl"
          formControlName="thumbnailUrl"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="https://example.com/certificate-thumb.jpg">
      </div>

      <!-- Verification Badge and Issuer Verification Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Verification Badge -->
        <div class="flex items-center">
          <input
            type="checkbox"
            id="verificationBadge"
            formControlName="verificationBadge"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
          <label for="verificationBadge" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Verified certificate
          </label>
        </div>

        <!-- Issuer Verification URL -->
        <div>
          <label for="issuerVerification" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Issuer Verification URL
          </label>
          <input
            type="url"
            id="issuerVerification"
            formControlName="issuerVerification"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://verify.issuer.com/credentials/123">
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
          [disabled]="certificateForm.invalid"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {{isEditing ? 'Update Certificate' : 'Add Certificate'}}
        </button>
      </div>
    </form>
  `
})
export class CertificateFormComponent implements OnInit {
  @Input() certificate: Certificate | null = null;
  @Input() isEditing = false;

  @Output() onSubmit = new EventEmitter<Certificate>();
  @Output() onCancel = new EventEmitter<void>();

  certificateForm!: FormGroup;
  selectedFile: string | null = null;
  selectedFileName: string = '';
  selectedFileSize: string = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    if (this.certificate) {
      this.populateForm();
    }
  }

  private initializeForm() {
    this.certificateForm = this.fb.group({
      title: ['', [Validators.required]],
      issuer: ['', [Validators.required]],
      category: ['', [Validators.required]],
      issueDate: ['', [Validators.required]],
      expiryDate: [''],
      credentialId: [''],
      pdfUrl: ['', [Validators.required]],
      thumbnailUrl: ['', [Validators.required]],
      verificationBadge: [false],
      issuerVerification: ['']
    });
  }

  private populateForm() {
    if (this.certificate) {
      this.certificateForm.patchValue({
        title: this.certificate.title,
        issuer: this.certificate.issuer,
        category: this.certificate.category,
        issueDate: this.formatDateForInput(this.certificate.issueDate),
        expiryDate: this.certificate.expiryDate ? this.formatDateForInput(this.certificate.expiryDate) : '',
        credentialId: this.certificate.credentialId || '',
        pdfUrl: this.certificate.pdfUrl,
        thumbnailUrl: this.certificate.thumbnailUrl,
        verificationBadge: this.certificate.verificationBadge,
        issuerVerification: this.certificate.issuerVerification || ''
      });
    }
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onFormSubmit() {
    if (this.certificateForm.valid) {
      const formData = this.certificateForm.value;

      const certificateData: Certificate = {
        id: this.certificate?.id || '',
        title: formData.title,
        issuer: formData.issuer,
        category: formData.category,
        issueDate: new Date(formData.issueDate),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        credentialId: formData.credentialId || undefined,
        pdfUrl: formData.pdfUrl,
        thumbnailUrl: formData.thumbnailUrl,
        verificationBadge: formData.verificationBadge,
        issuerVerification: formData.issuerVerification || undefined
      };

      this.onSubmit.emit(certificateData);
    }
  }

  isImageFile(fileName: string): boolean {
    if (!fileName) return false;
    return fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ||
           fileName.endsWith('.png') || fileName.endsWith('.gif');
  }

  getFileName(): string {
    return this.selectedFileName;
  }

  getFileSize(): string {
    return this.selectedFileSize;
  }

  removeFile() {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.certificateForm.patchValue({
      pdfUrl: ''
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        alert('File size must be less than 20MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'video/mpeg', 'video/mp4'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file (PDF, JPG, GIF, PNG, MPEG, MP4)');
        return;
      }

      this.selectedFileName = file.name;
      this.selectedFileSize = this.formatFileSize(file.size);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedFile = e.target?.result as string;
        // Update the pdfUrl form control with the base64 data
        this.certificateForm.patchValue({
          pdfUrl: this.selectedFile
        });
      };
      reader.readAsDataURL(file);
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
