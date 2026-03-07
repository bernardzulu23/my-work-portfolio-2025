import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Testimonial, Recommendation } from '../types';

export interface About {
  id: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  phone?: string;
  avatar?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  values: AboutValue[];
  experience: AboutExperience[];
  availability: 'available' | 'busy' | 'unavailable';
  tagline: string;
}

export interface AboutValue {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface AboutExperience {
  id: string;
  year: string;
  title: string;
  company: string;
  description: string;
  technologies?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishDate: Date;
  tags: string[];
  category: string;
  readTime: number;
  featured: boolean;
  status: 'draft' | 'published';
  imageUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  yearsOfExperience: number;
  certifications: string[];
  projects: number;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  companyLogo?: string;
  location: string;
  employmentType: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  gpa?: number;
  honors?: string[];
  description: string;
  institutionLogo?: string;
  location: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl: string;
  featured: boolean;
  category: string;
  status: 'active' | 'archived';
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  category: string;
  pdfUrl: string;
  thumbnailUrl: string;
  verificationBadge: boolean;
  issuerVerification?: string;
  credentialId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'api/admin';
  private storageKey = 'portfolio_data';

  // Signals for reactive state management
  private blogPostsSignal = signal<BlogPost[]>([]);
  private skillsSignal = signal<Skill[]>([]);
  private workExperienceSignal = signal<WorkExperience[]>([]);
  private educationSignal = signal<Education[]>([]);
  private projectsSignal = signal<Project[]>([]);
  private certificatesSignal = signal<Certificate[]>([]);
  private aboutSignal = signal<About[]>([]);
  private testimonialsSignal = signal<Testimonial[]>([]);
  private recommendationsSignal = signal<Recommendation[]>([]);

  // BehaviorSubjects for backward compatibility
  private blogPostsSubject = new BehaviorSubject<BlogPost[]>([]);
  private skillsSubject = new BehaviorSubject<Skill[]>([]);
  private workExperienceSubject = new BehaviorSubject<WorkExperience[]>([]);
  private educationSubject = new BehaviorSubject<Education[]>([]);
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  private certificatesSubject = new BehaviorSubject<Certificate[]>([]);
  private aboutSubject = new BehaviorSubject<About[]>([]);
  private testimonialsSubject = new BehaviorSubject<Testimonial[]>([]);
  private recommendationsSubject = new BehaviorSubject<Recommendation[]>([]);

  // Observable streams
  blogPosts$ = this.blogPostsSubject.asObservable();
  skills$ = this.skillsSubject.asObservable();
  workExperience$ = this.workExperienceSubject.asObservable();
  education$ = this.educationSubject.asObservable();
  projects$ = this.projectsSubject.asObservable();
  certificates$ = this.certificatesSubject.asObservable();
  about$ = this.aboutSubject.asObservable();
  testimonials$ = this.testimonialsSubject.asObservable();
  recommendations$ = this.recommendationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  // Load initial data from API
  async loadInitialData() {
    try {
      const [
        about,
        skills,
        workExperience,
        education,
        projects,
        certificates,
        testimonials,
        recommendations,
        blogPosts
      ] = await Promise.all([
        this.http.get<About>(`${environment.apiUrl}/about`).toPromise(),
        this.http.get<Skill[]>(`${environment.apiUrl}/skills`).toPromise(),
        this.http.get<WorkExperience[]>(`${environment.apiUrl}/work-experience`).toPromise(),
        this.http.get<Education[]>(`${environment.apiUrl}/education`).toPromise(),
        this.http.get<Project[]>(`${environment.apiUrl}/projects`).toPromise(),
        this.http.get<Certificate[]>(`${environment.apiUrl}/certificates`).toPromise(),
        this.http.get<Testimonial[]>(`${environment.apiUrl}/testimonials`).toPromise(),
        this.http.get<Recommendation[]>(`${environment.apiUrl}/recommendations`).toPromise(),
        this.http.get<BlogPost[]>(`${environment.apiUrl}/blog-posts`).toPromise()
      ]);

      if (about) this.setAbout([about]);
      if (skills) this.setSkills(skills);
      if (workExperience) this.setWorkExperience(workExperience.map((e: any) => ({ ...e, startDate: new Date(e.startDate), endDate: e.endDate ? new Date(e.endDate) : undefined })));
      if (education) this.setEducation(education.map((e: any) => ({ ...e, startDate: new Date(e.startDate), endDate: e.endDate ? new Date(e.endDate) : undefined })));
      if (projects) this.setProjects(projects);
      if (certificates) this.setCertificates(certificates.map((c: any) => ({ ...c, issueDate: new Date(c.issueDate), expiryDate: c.expiryDate ? new Date(c.expiryDate) : undefined })));
      if (testimonials) this.setTestimonials(testimonials.map((t: any) => ({ ...t, date: new Date(t.date) })));
      if (recommendations) this.setRecommendations(recommendations.map((r: any) => ({ ...r, date: new Date(r.date) })));
      if (blogPosts) this.setBlogPosts(blogPosts.map((p: any) => ({ ...p, publishDate: new Date(p.publishDate) })));

      console.log('Data loaded from API');
    } catch (error) {
      console.error('Error loading data from API:', error);
    }
  }

  // Blog Posts Management
  getBlogPosts() {
    return this.blogPostsSignal();
  }

  async addBlogPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    const id = this.generateId();
    const newPost = { ...post, id };
    
    try {
      await this.http.post(`${environment.apiUrl}/blog-posts`, newPost).toPromise();
      const posts = [...this.blogPostsSignal(), newPost];
      this.setBlogPosts(posts);
      return newPost;
    } catch (error) {
      console.error('Error adding blog post:', error);
      throw error;
    }
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>) {
    try {
      await this.http.put(`${environment.apiUrl}/blog-posts/${id}`, updates).toPromise();
      const posts = this.blogPostsSignal().map(post =>
        post.id === id ? { ...post, ...updates } : post
      );
      this.setBlogPosts(posts);
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  async deleteBlogPost(id: string) {
    try {
      await this.http.delete(`${environment.apiUrl}/blog-posts/${id}`).toPromise();
      const posts = this.blogPostsSignal().filter(post => post.id !== id);
      this.setBlogPosts(posts);
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }

  // Skills Management
  getSkills() {
    return this.skillsSignal();
  }

  async addSkill(skill: Omit<Skill, 'id'>): Promise<Skill> {
    const id = this.generateId();
    const newSkill = { ...skill, id };
    
    try {
      await this.http.post(`${environment.apiUrl}/skills`, newSkill).toPromise();
      const skills = [...this.skillsSignal(), newSkill];
      this.setSkills(skills);
      return newSkill;
    } catch (error) {
      console.error('Error adding skill:', error);
      throw error;
    }
  }

  async updateSkill(id: string, updates: Partial<Skill>) {
    try {
      await this.http.put(`${environment.apiUrl}/skills/${id}`, updates).toPromise();
      const skills = this.skillsSignal().map(skill =>
        skill.id === id ? { ...skill, ...updates } : skill
      );
      this.setSkills(skills);
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  }

  async deleteSkill(id: string) {
    try {
      await this.http.delete(`${environment.apiUrl}/skills/${id}`).toPromise();
      const skills = this.skillsSignal().filter(skill => skill.id !== id);
      this.setSkills(skills);
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  }

  // Work Experience Management
  getWorkExperience() {
    return this.workExperienceSignal();
  }

  async addWorkExperience(experience: Omit<WorkExperience, 'id'>): Promise<WorkExperience> {
    const id = this.generateId();
    const newExperience = { ...experience, id };
    
    try {
      await this.http.post(`${environment.apiUrl}/work-experience`, newExperience).toPromise();
      const experiences = [...this.workExperienceSignal(), newExperience];
      this.setWorkExperience(experiences);
      return newExperience;
    } catch (error) {
      console.error('Error adding work experience:', error);
      throw error;
    }
  }

  async updateWorkExperience(id: string, updates: Partial<WorkExperience>) {
    try {
      await this.http.put(`${environment.apiUrl}/work-experience/${id}`, updates).toPromise();
      const experiences = this.workExperienceSignal().map(exp =>
        exp.id === id ? { ...exp, ...updates } : exp
      );
      this.setWorkExperience(experiences);
    } catch (error) {
      console.error('Error updating work experience:', error);
      throw error;
    }
  }

  async deleteWorkExperience(id: string) {
    try {
      await this.http.delete(`${environment.apiUrl}/work-experience/${id}`).toPromise();
      const experiences = this.workExperienceSignal().filter(exp => exp.id !== id);
      this.setWorkExperience(experiences);
    } catch (error) {
      console.error('Error deleting work experience:', error);
      throw error;
    }
  }

  // Education Management
  getEducation() {
    return this.educationSignal();
  }

  async addEducation(education: Omit<Education, 'id'>): Promise<Education> {
    const id = this.generateId();
    const newEducation = { ...education, id };
    
    try {
      await this.http.post(`${environment.apiUrl}/education`, newEducation).toPromise();
      const educations = [...this.educationSignal(), newEducation];
      this.setEducation(educations);
      return newEducation;
    } catch (error) {
      console.error('Error adding education:', error);
      throw error;
    }
  }

  async updateEducation(id: string, updates: Partial<Education>) {
    try {
      await this.http.put(`${environment.apiUrl}/education/${id}`, updates).toPromise();
      const educations = this.educationSignal().map(edu =>
        edu.id === id ? { ...edu, ...updates } : edu
      );
      this.setEducation(educations);
    } catch (error) {
      console.error('Error updating education:', error);
      throw error;
    }
  }

  async deleteEducation(id: string) {
    try {
      await this.http.delete(`${environment.apiUrl}/education/${id}`).toPromise();
      const educations = this.educationSignal().filter(edu => edu.id !== id);
      this.setEducation(educations);
    } catch (error) {
      console.error('Error deleting education:', error);
      throw error;
    }
  }

  // Projects Management
  getProjects() {
    return this.projectsSignal();
  }

  async addProject(project: Omit<Project, 'id'>): Promise<Project> {
    const id = this.generateId();
    const newProject = { ...project, id };
    
    try {
      await this.http.post(`${environment.apiUrl}/projects`, newProject).toPromise();
      const projects = [...this.projectsSignal(), newProject];
      this.setProjects(projects);
      return newProject;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }

  async updateProject(id: string, updates: Partial<Project>) {
    try {
      await this.http.put(`${environment.apiUrl}/projects/${id}`, updates).toPromise();
      const projects = this.projectsSignal().map(project =>
        project.id === id ? { ...project, ...updates } : project
      );
      this.setProjects(projects);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(id: string) {
    try {
      await this.http.delete(`${environment.apiUrl}/projects/${id}`).toPromise();
      const projects = this.projectsSignal().filter(project => project.id !== id);
      this.setProjects(projects);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Certificates Management
  getCertificates() {
    return this.certificatesSignal();
  }

  async addCertificate(certificate: Omit<Certificate, 'id'>): Promise<Certificate> {
    const id = this.generateId();
    const newCertificate = { ...certificate, id };
    
    try {
      await this.http.post(`${environment.apiUrl}/certificates`, newCertificate).toPromise();
      const certificates = [...this.certificatesSignal(), newCertificate];
      this.setCertificates(certificates);
      return newCertificate;
    } catch (error) {
      console.error('Error adding certificate:', error);
      throw error;
    }
  }

  async updateCertificate(id: string, updates: Partial<Certificate>) {
    try {
      await this.http.put(`${environment.apiUrl}/certificates/${id}`, updates).toPromise();
      const certificates = this.certificatesSignal().map(cert =>
        cert.id === id ? { ...cert, ...updates } : cert
      );
      this.setCertificates(certificates);
    } catch (error) {
      console.error('Error updating certificate:', error);
      throw error;
    }
  }

  async deleteCertificate(id: string) {
    try {
      await this.http.delete(`${environment.apiUrl}/certificates/${id}`).toPromise();
      const certificates = this.certificatesSignal().filter(cert => cert.id !== id);
      this.setCertificates(certificates);
    } catch (error) {
      console.error('Error deleting certificate:', error);
      throw error;
    }
  }

  // About Management
  getAbout() {
    return this.aboutSignal();
  }

  async addAbout(about: Omit<About, 'id'>): Promise<About> {
    const id = this.generateId();
    const newAbout = { ...about, id };
    
    // For about, we usually have a singleton, but if we add, we assume update logic on backend or single row
    try {
      await this.http.put(`${environment.apiUrl}/about/${id}`, newAbout).toPromise(); // Using PUT for about generally
      this.setAbout([newAbout]);
      return newAbout;
    } catch (error) {
       console.error('Error adding about:', error);
       throw error;
    }
  }

  async updateAbout(id: string, updates: Partial<About>) {
    try {
      // Merge current about with updates to send full object if needed, or partial
      const currentAbout = this.aboutSignal().find(a => a.id === id);
      const updatedAbout = { ...currentAbout, ...updates };

      await this.http.put(`${environment.apiUrl}/about/${id}`, updatedAbout).toPromise();
      
      const abouts = this.aboutSignal().map(about =>
        about.id === id ? { ...about, ...updates } : about
      );
      this.setAbout(abouts);
    } catch (error) {
      console.error('Error updating about:', error);
      throw error;
    }
  }

  async deleteAbout(id: string) {
     // About usually isn't deleted, but for consistency
     const abouts = this.aboutSignal().filter(about => about.id !== id);
     this.setAbout(abouts);
  }

  // Testimonials Management
  getTestimonials() {
    return this.testimonialsSignal();
  }

  async addTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
    const id = this.generateId();
    const newTestimonial = { ...testimonial, id };
    
    try {
      await this.http.post(`${environment.apiUrl}/testimonials`, newTestimonial).toPromise();
      const testimonials = [...this.testimonialsSignal(), newTestimonial];
      this.setTestimonials(testimonials);
      return newTestimonial;
    } catch (error) {
      console.error('Error adding testimonial:', error);
      throw error;
    }
  }

  async updateTestimonial(id: string, updates: Partial<Testimonial>) {
    try {
      await this.http.put(`${environment.apiUrl}/testimonials/${id}`, updates).toPromise();
      const testimonials = this.testimonialsSignal().map(testimonial =>
        testimonial.id === id ? { ...testimonial, ...updates } : testimonial
      );
      this.setTestimonials(testimonials);
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  }

  async deleteTestimonial(id: string) {
    try {
      await this.http.delete(`${environment.apiUrl}/testimonials/${id}`).toPromise();
      const testimonials = this.testimonialsSignal().filter(testimonial => testimonial.id !== id);
      this.setTestimonials(testimonials);
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }

  // Recommendations Management
  getRecommendations() {
    return this.recommendationsSignal();
  }

  async addRecommendation(recommendation: Omit<Recommendation, 'id'>): Promise<Recommendation> {
    const id = this.generateId();
    const newRecommendation = { ...recommendation, id };
    
    try {
      await this.http.post(`${environment.apiUrl}/recommendations`, newRecommendation).toPromise();
      const recommendations = [...this.recommendationsSignal(), newRecommendation];
      this.setRecommendations(recommendations);
      return newRecommendation;
    } catch (error) {
      console.error('Error adding recommendation:', error);
      throw error;
    }
  }

  async updateRecommendation(id: string, updates: Partial<Recommendation>) {
    try {
      await this.http.put(`${environment.apiUrl}/recommendations/${id}`, updates).toPromise();
      const recommendations = this.recommendationsSignal().map(recommendation =>
        recommendation.id === id ? { ...recommendation, ...updates } : recommendation
      );
      this.setRecommendations(recommendations);
    } catch (error) {
      console.error('Error updating recommendation:', error);
      throw error;
    }
  }

  async deleteRecommendation(id: string) {
    try {
      await this.http.delete(`${environment.apiUrl}/recommendations/${id}`).toPromise();
      const recommendations = this.recommendationsSignal().filter(recommendation => recommendation.id !== id);
      this.setRecommendations(recommendations);
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      throw error;
    }
  }

  // Utility methods
  private setBlogPosts(posts: BlogPost[]) {
    this.blogPostsSignal.set(posts);
    this.blogPostsSubject.next(posts);
  }

  private setSkills(skills: Skill[]) {
    this.skillsSignal.set(skills);
    this.skillsSubject.next(skills);
  }

  private setWorkExperience(experiences: WorkExperience[]) {
    this.workExperienceSignal.set(experiences);
    this.workExperienceSubject.next(experiences);
  }

  private setEducation(educations: Education[]) {
    this.educationSignal.set(educations);
    this.educationSubject.next(educations);
  }

  private setProjects(projects: Project[]) {
    this.projectsSignal.set(projects);
    this.projectsSubject.next(projects);
  }

  private setCertificates(certificates: Certificate[]) {
    this.certificatesSignal.set(certificates);
    this.certificatesSubject.next(certificates);
  }

  private setAbout(abouts: About[]) {
    this.aboutSignal.set(abouts);
    this.aboutSubject.next(abouts);
  }

  private setTestimonials(testimonials: Testimonial[]) {
    this.testimonialsSignal.set(testimonials);
    this.testimonialsSubject.next(testimonials);
  }

  private setRecommendations(recommendations: Recommendation[]) {
    this.recommendationsSignal.set(recommendations);
    this.recommendationsSubject.next(recommendations);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Statistics
  getStats() {
    return {
      blogPosts: this.blogPostsSignal().length,
      skills: this.skillsSignal().length,
      workExperience: this.workExperienceSignal().length,
      education: this.educationSignal().length,
      projects: this.projectsSignal().length,
      certificates: this.certificatesSignal().length
    };
  }

  // Clear all data (reset to mock data)
  clearAllData() {
    // localStorage.removeItem(this.storageKey); // Not using localStorage anymore
    // this.loadMockData(); // Not using mock data
    // this.saveToStorage(); // Not using localStorage
    console.warn('clearAllData not implemented for API backend yet');
  }

  // Export data as JSON
  exportData(): string {
    const data = {
      blogPosts: this.blogPostsSignal(),
      skills: this.skillsSignal(),
      workExperience: this.workExperienceSignal(),
      education: this.educationSignal(),
      projects: this.projectsSignal(),
      certificates: this.certificatesSignal(),
      about: this.aboutSignal(),
      testimonials: this.testimonialsSignal(),
      recommendations: this.recommendationsSignal()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import data from JSON
  importData(jsonString: string) {
    try {
      // const data = JSON.parse(jsonString);
      // this.restoreData(data); // Not using localStorage
      // this.saveToStorage(); // Not using localStorage
      console.warn('importData not implemented for API backend yet');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Helper methods placeholders to fix build errors if referenced elsewhere
  private loadMockData() { console.warn('loadMockData is deprecated'); }
  private saveToStorage() { console.warn('saveToStorage is deprecated'); }
  private restoreData(data: any) { console.warn('restoreData is deprecated'); }
}
