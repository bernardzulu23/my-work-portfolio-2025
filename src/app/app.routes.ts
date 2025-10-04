import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard, LoginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'skills',
    loadComponent: () => import('./features/skills/skills.component').then(m => m.SkillsComponent)
  },
  {
    path: 'certificates',
    loadComponent: () => import('./features/certificates/certificates.component').then(m => m.CertificatesComponent)
  },
  {
    path: 'projects',
    loadComponent: () => import('./features/projects/projects.component').then(m => m.ProjectsComponent)
  },
  {
    path: 'blog',
    loadComponent: () => import('./features/blog/blog.component').then(m => m.BlogComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'admin-setup',
    loadComponent: () => import('./features/admin/admin-setup.component').then(m => m.AdminSetupComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'experience',
    loadComponent: () => import('./features/experience/experience.component').then(m => m.ExperienceComponent)
  },
  {
    path: 'testimonials',
    loadComponent: () => import('./features/testimonials/testimonials.component').then(m => m.TestimonialsComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [LoginGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
