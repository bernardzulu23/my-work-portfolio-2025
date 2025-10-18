# Admin Dashboard CRUD Implementation Plan

## Overview
Implement full CRUD functionality for the admin dashboard to manage blog posts, skills, experiences, testimonials, certificates, projects, and about section. Changes should save to Supabase and reflect immediately on the frontend.

## Steps

### 1. Database Setup (Supabase Tables)
- [ ] Create SQL script for all required tables (blog_posts, skills, work_experience, education, projects, certificates, testimonials, recommendations, about).
- [ ] Include RLS policies for admin-only write access.
- [ ] Instruct user to run the script in Supabase SQL editor.

### 2. Install Dependencies
- [ ] Install Quill.js and ngx-quill for rich text editor in blog form: `npm install quill ngx-quill @types/quill`
- [ ] Update angular.json if needed for Quill assets.

### 3. Update Blog Form (Rich Text Editor)
- [ ] Read src/app/features/admin/components/blog-form/blog-form.component.ts
- [ ] Integrate ngx-quill for editable content field.
- [ ] Update form to handle HTML content with SanitizeHtmlPipe on frontend display.
- [ ] Ensure form emits onSubmit with full post data including content.

### 4. Update Admin Component (Event Handling)
- [ ] Read src/app/features/admin/admin.component.ts
- [ ] Add handlers for form submissions (create, update, delete) from all admin forms.
- [ ] Call AdminService methods to perform CRUD operations via SupabaseService.
- [ ] Use NotificationService for success/error feedback.

### 5. Enhance AdminService
- [ ] Read src/app/core/services/admin.service.ts
- [ ] Ensure loadInitialData() fetches all data types and updates signals.
- [ ] Add create/update/delete methods for each entity, wrapping SupabaseService calls.
- [ ] Add error handling with console logs and fallbacks to empty data.

### 6. Verify Other Admin Forms
- [ ] Check skill-form, experience-form, testimonial-form, certificate-form, project-form, about-form.
- [ ] Ensure they emit proper events and forms are complete (e.g., date pickers for experience).
- [ ] Add any missing fields or validations.

### 7. Frontend Updates (If Needed)
- [ ] Verify blog.component.ts, skills.component.ts, experience.component.ts, testimonials.component.ts, certificates.component.ts, projects.component.ts, about.component.ts use AdminService signals correctly.
- [ ] Add loading states if missing.
- [ ] Ensure content (e.g., blog posts) uses SanitizeHtmlPipe for safe HTML rendering.

### 8. Testing
- [ ] Run `npm run dev` and test admin login (if auth implemented).
- [ ] Create sample data for each entity in admin dashboard.
- [ ] Verify data appears on frontend pages immediately.
- [ ] Test delete/update operations.
- [ ] Check console for errors; fix Supabase connection issues.

### 9. Finalization
- [ ] Update TODO.md as steps complete.
- [ ] Commit changes with descriptive messages.
- [ ] Deploy to Vercel if needed.

Progress: Starting with Step 1 - Database Setup.
