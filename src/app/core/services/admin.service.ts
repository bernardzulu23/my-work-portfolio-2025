import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { firstValueFrom } from 'rxjs';

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

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
  read_status: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private dataLoaded = false;
  private loadPromise: Promise<void> | null = null;

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

  // Readonly signals for reactive public UI
  readonly projects = this.projectsSignal.asReadonly();
  readonly blogPosts = this.blogPostsSignal.asReadonly();
  readonly skills = this.skillsSignal.asReadonly();
  readonly certificates = this.certificatesSignal.asReadonly();
  readonly workExperience = this.workExperienceSignal.asReadonly();
  readonly education = this.educationSignal.asReadonly();
  readonly about = this.aboutSignal.asReadonly();
  readonly testimonials = this.testimonialsSignal.asReadonly();
  readonly recommendations = this.recommendationsSignal.asReadonly();

  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  /** Always fetch latest data from API (for visitors after admin changes). */
  async refreshData(): Promise<void> {
    this.dataLoaded = false;
    await this.loadInitialData(true);
  }

  /** Poll API so visitor pages stay in sync with admin changes. */
  startLiveSync(intervalMs = 30000): void {
    this.stopLiveSync();
    this.refreshIntervalId = setInterval(() => {
      this.refreshData().catch(err => console.error('Live sync failed:', err));
    }, intervalMs);
  }

  stopLiveSync(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  getActiveProjects(): Project[] {
    return this.projectsSignal().filter(project => project.status === 'active');
  }

  getPublishedBlogPosts(): BlogPost[] {
    return this.blogPostsSignal().filter(post => post.status === 'published');
  }

  getFeaturedActiveProjects(): Project[] {
    return this.getActiveProjects().filter(project => project.featured);
  }

  // Load initial data from API
  async loadInitialData(force = false): Promise<void> {
    if (this.dataLoaded && !force) {
      return;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.fetchAllData();
    try {
      await this.loadPromise;
      this.dataLoaded = true;
    } finally {
      this.loadPromise = null;
    }
  }

  private async fetchAllData(): Promise<void> {
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
        firstValueFrom(this.http.get<About>(`${environment.apiUrl}/about`)),
        firstValueFrom(this.http.get<Skill[]>(`${environment.apiUrl}/skills`)),
        firstValueFrom(this.http.get<WorkExperience[]>(`${environment.apiUrl}/work-experience`)),
        firstValueFrom(this.http.get<Education[]>(`${environment.apiUrl}/education`)),
        firstValueFrom(this.http.get<Project[]>(`${environment.apiUrl}/projects`)),
        firstValueFrom(this.http.get<Certificate[]>(`${environment.apiUrl}/certificates`)),
        firstValueFrom(this.http.get<Testimonial[]>(`${environment.apiUrl}/testimonials`)),
        firstValueFrom(this.http.get<Recommendation[]>(`${environment.apiUrl}/recommendations`)),
        firstValueFrom(this.http.get<BlogPost[]>(`${environment.apiUrl}/blog-posts`))
      ]);

      if (about && 'id' in about && about.id) {
        this.setAbout([about]);
      } else {
        this.setAbout([]);
      }
      if (skills) this.setSkills(skills);
      if (workExperience) this.setWorkExperience(workExperience.map((e: WorkExperience) => this.parseWorkExperience(e)));
      if (education) this.setEducation(education.map((e: Education) => this.parseEducation(e)));
      if (projects) this.setProjects(projects);
      if (certificates) this.setCertificates(certificates.map((c: Certificate) => this.parseCertificate(c)));
      if (testimonials) this.setTestimonials(testimonials.map((t: Testimonial) => this.parseTestimonial(t)));
      if (recommendations) this.setRecommendations(recommendations.map((r: Recommendation) => this.parseRecommendation(r)));
      if (blogPosts) this.setBlogPosts(blogPosts.map((p: BlogPost) => this.parseBlogPost(p)));
    } catch (error) {
      console.error('Error loading data from API:', error);
      throw error;
    }
  }

  private parseWorkExperience(e: WorkExperience): WorkExperience {
    return {
      ...e,
      startDate: new Date(e.startDate),
      endDate: e.endDate ? new Date(e.endDate) : undefined
    };
  }

  private parseEducation(e: Education): Education {
    return {
      ...e,
      startDate: new Date(e.startDate),
      endDate: e.endDate ? new Date(e.endDate) : undefined
    };
  }

  private parseCertificate(c: Certificate): Certificate {
    return {
      ...c,
      issueDate: new Date(c.issueDate),
      expiryDate: c.expiryDate ? new Date(c.expiryDate) : undefined
    };
  }

  private parseTestimonial(t: Testimonial): Testimonial {
    return { ...t, date: new Date(t.date) };
  }

  private parseRecommendation(r: Recommendation): Recommendation {
    return { ...r, date: new Date(r.date) };
  }

  private parseBlogPost(p: BlogPost): BlogPost {
    return { ...p, publishDate: new Date(p.publishDate) };
  }

  private serializeDates<T extends Record<string, unknown>>(data: T): T {
    const serialized = { ...data };
    for (const [key, value] of Object.entries(serialized)) {
      if (value instanceof Date) {
        (serialized as Record<string, unknown>)[key] = value.toISOString();
      }
    }
    return serialized;
  }

  // Blog Posts Management
  getBlogPosts() {
    return this.blogPostsSignal();
  }

  async addBlogPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    const id = this.generateId();
    const newPost = { ...post, id };
    
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/blog-posts`, this.serializeDates(newPost)));
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
      const currentPost = this.blogPostsSignal().find(post => post.id === id);
      if (!currentPost) throw new Error('Blog post not found');

      const updatedPost = { ...currentPost, ...updates };
      await firstValueFrom(this.http.put(`${environment.apiUrl}/blog-posts/${id}`, this.serializeDates(updatedPost)));
      const posts = this.blogPostsSignal().map(post =>
        post.id === id ? updatedPost : post
      );
      this.setBlogPosts(posts);
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  async deleteBlogPost(id: string) {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/blog-posts/${id}`));
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
      await firstValueFrom(this.http.post(`${environment.apiUrl}/skills`, newSkill));
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
      const currentSkill = this.skillsSignal().find(skill => skill.id === id);
      if (!currentSkill) throw new Error('Skill not found');

      const updatedSkill = { ...currentSkill, ...updates };
      await firstValueFrom(this.http.put(`${environment.apiUrl}/skills/${id}`, updatedSkill));
      const skills = this.skillsSignal().map(skill =>
        skill.id === id ? updatedSkill : skill
      );
      this.setSkills(skills);
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  }

  async deleteSkill(id: string) {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/skills/${id}`));
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
      await firstValueFrom(this.http.post(`${environment.apiUrl}/work-experience`, this.serializeDates(newExperience)));
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
      const currentExperience = this.workExperienceSignal().find(exp => exp.id === id);
      if (!currentExperience) throw new Error('Work experience not found');

      const updatedExperience = { ...currentExperience, ...updates };
      await firstValueFrom(this.http.put(`${environment.apiUrl}/work-experience/${id}`, this.serializeDates(updatedExperience)));
      const experiences = this.workExperienceSignal().map(exp =>
        exp.id === id ? updatedExperience : exp
      );
      this.setWorkExperience(experiences);
    } catch (error) {
      console.error('Error updating work experience:', error);
      throw error;
    }
  }

  async deleteWorkExperience(id: string) {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/work-experience/${id}`));
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
      await firstValueFrom(this.http.post(`${environment.apiUrl}/education`, this.serializeDates(newEducation)));
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
      const currentEducation = this.educationSignal().find(edu => edu.id === id);
      if (!currentEducation) throw new Error('Education not found');

      const updatedEducation = { ...currentEducation, ...updates };
      await firstValueFrom(this.http.put(`${environment.apiUrl}/education/${id}`, this.serializeDates(updatedEducation)));
      const educations = this.educationSignal().map(edu =>
        edu.id === id ? updatedEducation : edu
      );
      this.setEducation(educations);
    } catch (error) {
      console.error('Error updating education:', error);
      throw error;
    }
  }

  async deleteEducation(id: string) {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/education/${id}`));
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
      await firstValueFrom(this.http.post(`${environment.apiUrl}/projects`, newProject));
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
      const currentProject = this.projectsSignal().find(p => p.id === id);
      if (!currentProject) throw new Error('Project not found');

      const updatedProject = { ...currentProject, ...updates };
      await firstValueFrom(this.http.put(`${environment.apiUrl}/projects/${id}`, updatedProject));
      const projects = this.projectsSignal().map(project =>
        project.id === id ? updatedProject : project
      );
      this.setProjects(projects);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(id: string) {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/projects/${id}`));
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
      await firstValueFrom(this.http.post(`${environment.apiUrl}/certificates`, this.serializeDates(newCertificate)));
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
      const currentCertificate = this.certificatesSignal().find(cert => cert.id === id);
      if (!currentCertificate) throw new Error('Certificate not found');

      const updatedCertificate = { ...currentCertificate, ...updates };
      await firstValueFrom(this.http.put(`${environment.apiUrl}/certificates/${id}`, this.serializeDates(updatedCertificate)));
      const certificates = this.certificatesSignal().map(cert =>
        cert.id === id ? updatedCertificate : cert
      );
      this.setCertificates(certificates);
    } catch (error) {
      console.error('Error updating certificate:', error);
      throw error;
    }
  }

  async deleteCertificate(id: string) {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/certificates/${id}`));
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

  getAboutProfile(): About | null {
    return this.aboutSignal()[0] ?? null;
  }

  async addAbout(about: Omit<About, 'id'>): Promise<About> {
    const id = this.generateId();
    const newAbout = { ...about, id };
    
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/about`, newAbout));
      this.setAbout([newAbout]);
      return newAbout;
    } catch (error) {
      console.error('Error adding about:', error);
      throw error;
    }
  }

  async updateAbout(id: string, updates: Partial<About>) {
    try {
      const currentAbout = this.aboutSignal().find(a => a.id === id);
      if (!currentAbout) throw new Error('About profile not found');

      const updatedAbout = { ...currentAbout, ...updates };
      await firstValueFrom(this.http.put(`${environment.apiUrl}/about/${id}`, updatedAbout));
      
      const abouts = this.aboutSignal().map(about =>
        about.id === id ? updatedAbout : about
      );
      this.setAbout(abouts);
    } catch (error) {
      console.error('Error updating about:', error);
      throw error;
    }
  }

  async deleteAbout(id: string) {
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
      await firstValueFrom(this.http.post(`${environment.apiUrl}/testimonials`, this.serializeDates(newTestimonial)));
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
      const currentTestimonial = this.testimonialsSignal().find(testimonial => testimonial.id === id);
      if (!currentTestimonial) throw new Error('Testimonial not found');

      const updatedTestimonial = { ...currentTestimonial, ...updates };
      await firstValueFrom(this.http.put(`${environment.apiUrl}/testimonials/${id}`, this.serializeDates(updatedTestimonial)));
      const testimonials = this.testimonialsSignal().map(testimonial =>
        testimonial.id === id ? updatedTestimonial : testimonial
      );
      this.setTestimonials(testimonials);
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  }

  async deleteTestimonial(id: string) {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/testimonials/${id}`));
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
      await firstValueFrom(this.http.post(`${environment.apiUrl}/recommendations`, this.serializeDates(newRecommendation)));
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
      const currentRecommendation = this.recommendationsSignal().find(recommendation => recommendation.id === id);
      if (!currentRecommendation) throw new Error('Recommendation not found');

      const updatedRecommendation = { ...currentRecommendation, ...updates };
      await firstValueFrom(this.http.put(`${environment.apiUrl}/recommendations/${id}`, this.serializeDates(updatedRecommendation)));
      const recommendations = this.recommendationsSignal().map(recommendation =>
        recommendation.id === id ? updatedRecommendation : recommendation
      );
      this.setRecommendations(recommendations);
    } catch (error) {
      console.error('Error updating recommendation:', error);
      throw error;
    }
  }

  async deleteRecommendation(id: string) {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/recommendations/${id}`));
      const recommendations = this.recommendationsSignal().filter(recommendation => recommendation.id !== id);
      this.setRecommendations(recommendations);
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      throw error;
    }
  }

  // Contact Messages (admin only)
  async getContactMessages(): Promise<ContactMessage[]> {
    const messages = await firstValueFrom(
      this.http.get<ContactMessage[]>(`${environment.apiUrl}/contact`)
    );
    return messages.map(message => ({
      ...message,
      createdAt: new Date(message.createdAt)
    }));
  }

  async deleteContactMessage(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${environment.apiUrl}/contact/${id}`));
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
  // All data is now dynamic from API

}
