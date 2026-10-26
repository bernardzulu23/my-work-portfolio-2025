import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, type Education, type Skill, type WorkExperience } from '../../../../core/services/admin.service';

interface ParsedCv {
  personal: {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    summary: string;
  };
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
}

interface Selectable<T> {
  selected: boolean;
  item: T;
}

@Component({
  selector: 'app-cv-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">CV import</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Upload a PDF or paste your CV. Review the extracted jobs, education, and skills before saving.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <label class="block">
          <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PDF (max 4MB)</span>
          <input type="file" accept="application/pdf" (change)="onFile($event)"
                 class="block w-full text-sm text-gray-600 dark:text-gray-300">
        </label>
        <label class="flex items-center gap-2 mt-6">
          <input type="checkbox" [(ngModel)]="patchAbout" class="rounded border-gray-300">
          <span class="text-sm text-gray-700 dark:text-gray-300">Fill empty About personal fields</span>
        </label>
      </div>

      <label class="block">
        <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Or paste CV text</span>
        <textarea [(ngModel)]="pastedText" rows="6"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="Paste resume text here..."></textarea>
      </label>

      <p *ngIf="error()" class="text-sm text-red-600">{{ error() }}</p>
      <p *ngIf="status()" class="text-sm text-green-700 dark:text-green-400">{{ status() }}</p>

      <button type="button" (click)="parseCv()" [disabled]="busy()"
              class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-md">
        {{ busy() ? 'Parsing…' : 'Extract from CV' }}
      </button>

      <div *ngIf="preview()" class="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div *ngIf="preview()!.personal.name || preview()!.personal.title" class="text-sm text-gray-700 dark:text-gray-300">
          Detected:
          <strong>{{ preview()!.personal.name }}</strong>
          <span *ngIf="preview()!.personal.title"> — {{ preview()!.personal.title }}</span>
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-semibold">Experience ({{ selectedCount(jobs()) }})</h4>
            <button type="button" class="text-sm text-blue-600" (click)="toggleAll('jobs')">Toggle all</button>
          </div>
          <label *ngFor="let row of jobs(); let i = index" class="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <input type="checkbox" [ngModel]="row.selected" (ngModelChange)="setSelected('jobs', i, $event)" class="mt-1">
            <span>
              <span class="font-medium">{{ row.item.position }}</span>
              at {{ row.item.company }}
              <span class="block text-xs text-gray-500">{{ row.item.startDate | date:'MMM yyyy' }}</span>
            </span>
          </label>
          <p *ngIf="jobs().length === 0" class="text-sm text-gray-500">No jobs found.</p>
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-semibold">Education ({{ selectedCount(schools()) }})</h4>
            <button type="button" class="text-sm text-blue-600" (click)="toggleAll('schools')">Toggle all</button>
          </div>
          <label *ngFor="let row of schools(); let i = index" class="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <input type="checkbox" [ngModel]="row.selected" (ngModelChange)="setSelected('schools', i, $event)" class="mt-1">
            <span>
              <span class="font-medium">{{ row.item.degree }}</span>
              — {{ row.item.institution }}
            </span>
          </label>
          <p *ngIf="schools().length === 0" class="text-sm text-gray-500">No education found.</p>
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-semibold">Skills ({{ selectedCount(skillRows()) }})</h4>
            <button type="button" class="text-sm text-blue-600" (click)="toggleAll('skillRows')">Toggle all</button>
          </div>
          <div class="flex flex-wrap gap-2">
            <label *ngFor="let row of skillRows(); let i = index" class="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
              <input type="checkbox" [ngModel]="row.selected" (ngModelChange)="setSelected('skillRows', i, $event)">
              {{ row.item.name }}
            </label>
          </div>
          <p *ngIf="skillRows().length === 0" class="text-sm text-gray-500">No skills found.</p>
        </div>

        <button type="button" (click)="applySelected()" [disabled]="busy()"
                class="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md">
          {{ busy() ? 'Saving…' : 'Apply selected items' }}
        </button>
      </div>
    </section>
  `
})
export class CvImportComponent {
  private adminService = inject(AdminService);

  @Output() applied = new EventEmitter<void>();

  pastedText = '';
  patchAbout = true;
  private pdfBase64 = '';

  protected busy = signal(false);
  protected error = signal('');
  protected status = signal('');
  protected preview = signal<ParsedCv | null>(null);
  protected jobs = signal<Selectable<WorkExperience>[]>([]);
  protected schools = signal<Selectable<Education>[]>([]);
  protected skillRows = signal<Selectable<Skill>[]>([]);

  onFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.error.set('');
    if (!file) {
      this.pdfBase64 = '';
      return;
    }
    if (file.type !== 'application/pdf') {
      this.error.set('Please choose a PDF file.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      this.error.set('PDF must be 4MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.pdfBase64 = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }

  selectedCount<T>(rows: Selectable<T>[]): number {
    return rows.filter((row) => row.selected).length;
  }

  setSelected(list: 'jobs' | 'schools' | 'skillRows', index: number, selected: boolean): void {
    const target = this[list];
    target.update((rows: any[]) => rows.map((row, i) => i === index ? { ...row, selected } : row));
  }

  toggleAll(list: 'jobs' | 'schools' | 'skillRows'): void {
    const target = this[list];
    const rows = target();
    const allOn = rows.every((row) => row.selected);
    target.set(rows.map((row) => ({ ...row, selected: !allOn })) as any);
  }

  async parseCv() {
    this.error.set('');
    this.status.set('');
    if (!this.pastedText.trim() && !this.pdfBase64) {
      this.error.set('Upload a PDF or paste CV text first.');
      return;
    }

    this.busy.set(true);
    try {
      const data = await this.adminService.parseCv({
        text: this.pastedText.trim() || undefined,
        pdfBase64: this.pdfBase64 || undefined
      });
      this.preview.set(data);
      this.jobs.set((data.experience || []).map((item) => ({ selected: true, item })));
      this.schools.set((data.education || []).map((item) => ({ selected: true, item })));
      this.skillRows.set((data.skills || []).map((item) => ({ selected: true, item })));
      this.status.set('Review the extracted items, then apply.');
    } catch (err: any) {
      this.error.set(err?.error?.error || err?.message || 'Could not parse the CV.');
    } finally {
      this.busy.set(false);
    }
  }

  async applySelected() {
    const preview = this.preview();
    if (!preview) return;

    this.busy.set(true);
    this.error.set('');
    this.status.set('');
    try {
      const result = await this.adminService.applyCv({
        personal: preview.personal,
        experience: this.jobs().filter((row) => row.selected).map((row) => row.item),
        education: this.schools().filter((row) => row.selected).map((row) => row.item),
        skills: this.skillRows().filter((row) => row.selected).map((row) => row.item),
        patchAbout: this.patchAbout
      });
      this.status.set(
        `Saved ${result.inserted.experience} jobs, ${result.inserted.education} education rows, ${result.inserted.skills} skills` +
        (result.inserted.skipped ? ` (${result.inserted.skipped} duplicates skipped)` : '') + '.'
      );
      this.applied.emit();
    } catch (err: any) {
      this.error.set(err?.error?.error || err?.message || 'Could not save CV data.');
    } finally {
      this.busy.set(false);
    }
  }
}
