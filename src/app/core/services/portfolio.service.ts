import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  yearsOfExperience: number;
  certifications: string[];
  projects: number;
}

export interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  createdAt: Date;
  approved: boolean;
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

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl: string;
  featured: boolean;
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
}

import { environment } from '../../../environments/environment';

// ... (previous imports)

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = environment.apiUrl;

  // Signals for reactive state management
  private skillsSignal = signal<Skill[]>([]);
  private certificatesSignal = signal<Certificate[]>([]);
  private projectsSignal = signal<Project[]>([]);
  private blogPostsSignal = signal<BlogPost[]>([]);

  // Computed signals for derived state
  featuredProjects = computed(() =>
    this.projectsSignal().filter(project => project.featured)
  );

  featuredBlogPosts = computed(() =>
    this.blogPostsSignal().filter(post => post.featured)
  );

  // BehaviorSubjects for backward compatibility
  private skillsSubject = new BehaviorSubject<Skill[]>([]);
  private certificatesSubject = new BehaviorSubject<Certificate[]>([]);
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  private blogPostsSubject = new BehaviorSubject<BlogPost[]>([]);

  // Observable streams
  skills$ = this.skillsSubject.asObservable();
  certificates$ = this.certificatesSubject.asObservable();
  projects$ = this.projectsSubject.asObservable();
  blogPosts$ = this.blogPostsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  // Signal-based getters
  getSkills() {
    return this.skillsSignal();
  }

  getCertificates() {
    return this.certificatesSignal();
  }

  getProjects() {
    return this.projectsSignal();
  }

  getBlogPosts() {
    return this.blogPostsSignal();
  }

  // Signal-based setters
  setSkills(skills: Skill[]) {
    this.skillsSignal.set(skills);
    this.skillsSubject.next(skills);
  }

  setCertificates(certificates: Certificate[]) {
    this.certificatesSignal.set(certificates);
    this.certificatesSubject.next(certificates);
  }

  setProjects(projects: Project[]) {
    this.projectsSignal.set(projects);
    this.projectsSubject.next(projects);
  }

  setBlogPosts(posts: BlogPost[]) {
    this.blogPostsSignal.set(posts);
    this.blogPostsSubject.next(posts);
  }

  // API methods
  async loadInitialData() {
    try {
      const [skills, certificates, projects, blogPosts] = await Promise.all([
        this.http.get<Skill[]>(`${this.apiUrl}/skills`).toPromise(),
        this.http.get<Certificate[]>(`${this.apiUrl}/certificates`).toPromise(),
        this.http.get<Project[]>(`${this.apiUrl}/projects`).toPromise(),
        this.http.get<BlogPost[]>(`${this.apiUrl}/blog-posts`).toPromise()
      ]);

      if (skills) this.setSkills(skills);
      if (certificates) this.setCertificates(certificates.map((c: any) => ({
        ...c,
        issueDate: new Date(c.issueDate),
        expiryDate: c.expiryDate ? new Date(c.expiryDate) : undefined
      })));
      if (projects) this.setProjects(projects);
      if (blogPosts) this.setBlogPosts(blogPosts.map((p: any) => ({
        ...p,
        publishDate: new Date(p.publishDate)
      })));

      console.log('Portfolio data loaded from API');
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    }
  }

  // ... (rest of the service)

  // Search and filter methods
  searchSkills(query: string): Skill[] {
    const skills = this.skillsSignal();
    return skills.filter((skill: Skill) =>
      skill.name.toLowerCase().includes(query.toLowerCase()) ||
      skill.category.toLowerCase().includes(query.toLowerCase())
    );
  }

  searchCertificates(query: string): Certificate[] {
    const certificates = this.certificatesSignal();
    return certificates.filter((cert: Certificate) =>
      cert.title.toLowerCase().includes(query.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(query.toLowerCase())
    );
  }

  searchProjects(query: string): Project[] {
    const projects = this.projectsSignal();
    return projects.filter((project: Project) =>
      project.title.toLowerCase().includes(query.toLowerCase()) ||
      project.description.toLowerCase().includes(query.toLowerCase()) ||
      project.technologies.some((tech: string) => tech.toLowerCase().includes(query.toLowerCase()))
    );
  }

  searchBlogPosts(query: string): BlogPost[] {
    const posts = this.blogPostsSignal();
    return posts.filter((post: BlogPost) =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // Category filtering
  getSkillsByCategory(category: string): Skill[] {
    const skills = this.skillsSignal();
    return skills.filter((skill: Skill) => skill.category === category);
  }

  getCertificatesByCategory(category: string): Certificate[] {
    const certificates = this.certificatesSignal();
    return certificates.filter((cert: Certificate) => cert.category === category);
  }

  getBlogPostsByCategory(category: string): BlogPost[] {
    const posts = this.blogPostsSignal();
    return posts.filter((post: BlogPost) => post.category === category);
  }

  // New enhanced methods
  getExpiringCertificates(days: number = 30): Certificate[] {
    const certificates = this.certificatesSignal();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return certificates.filter((cert: Certificate) =>
      cert.expiryDate && cert.expiryDate <= futureDate
    );
  }

  getRelatedPosts(postId: string, limit: number = 3): BlogPost[] {
    const posts = this.blogPostsSignal();
    const currentPost = posts.find((p: BlogPost) => p.id === postId);

    if (!currentPost) return [];

    return posts
      .filter((p: BlogPost) => p.id !== postId)
      .sort((a: BlogPost, b: BlogPost) => {
        // Sort by common tags and category
        const aScore = a.tags.filter((tag: string) => currentPost.tags.includes(tag)).length +
                      (a.category === currentPost.category ? 1 : 0);
        const bScore = b.tags.filter((tag: string) => currentPost.tags.includes(tag)).length +
                      (b.category === currentPost.category ? 1 : 0);

        return bScore - aScore;
      })
      .slice(0, limit);
  }

  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  // Bulk operations for admin
  bulkUpdateCertificates(updates: Array<{ id: string; updates: Partial<Certificate> }>): void {
    const certificates = this.certificatesSignal();
    const updatedCertificates = certificates.map((cert: Certificate) => {
      const update = updates.find((u: { id: string; updates: Partial<Certificate> }) => u.id === cert.id);
      return update ? { ...cert, ...update.updates } : cert;
    });
    this.setCertificates(updatedCertificates);
    this.saveToStorage();
  }

  bulkUpdateBlogPosts(updates: Array<{ id: string; updates: Partial<BlogPost> }>): void {
    const posts = this.blogPostsSignal();
    const updatedPosts = posts.map((post: BlogPost) => {
      const update = updates.find((u: { id: string; updates: Partial<BlogPost> }) => u.id === post.id);
      return update ? { ...post, ...update.updates } : post;
    });
    this.setBlogPosts(updatedPosts);
    this.saveToStorage();
  }

  // Helper methods placeholders to fix build errors if referenced elsewhere
  private loadMockData() { console.warn('loadMockData is deprecated'); }
  private saveToStorage() { console.warn('saveToStorage is deprecated'); }
  private restoreData(data: any) { console.warn('restoreData is deprecated'); }
  private loadSkills() { console.warn('loadSkills is deprecated'); }
  private loadCertificates() { console.warn('loadCertificates is deprecated'); }
  private loadProjects() { console.warn('loadProjects is deprecated'); }
  private loadBlogPosts() { console.warn('loadBlogPosts is deprecated'); }
}
