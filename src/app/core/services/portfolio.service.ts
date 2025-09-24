import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';

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

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
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

  constructor(private http: HttpClient, private supabaseService: SupabaseService) {
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
      await Promise.all([
        this.loadSkillsFromSupabase(),
        this.loadCertificatesFromSupabase(),
        this.loadProjectsFromSupabase(),
        this.loadBlogPostsFromSupabase()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Fallback to mock data if Supabase fails
      this.loadSkills();
      this.loadCertificates();
      this.loadProjects();
      this.loadBlogPosts();
    }
  }

  private loadSkills() {
    const mockSkills: Skill[] = [
      {
        id: '1',
        name: 'Angular',
        category: 'Frontend',
        proficiency: 85,
        yearsOfExperience: 2,
        certifications: ['Angular Fundamentals'],
        projects: 5
      },
      {
        id: '2',
        name: 'TypeScript',
        category: 'Language',
        proficiency: 80,
        yearsOfExperience: 2,
        certifications: ['TypeScript Basics'],
        projects: 8
      },
      {
        id: '3',
        name: 'Node.js',
        category: 'Backend',
        proficiency: 75,
        yearsOfExperience: 1,
        certifications: ['Node.js Fundamentals'],
        projects: 3
      },
      {
        id: '4',
        name: 'HTML/CSS',
        category: 'Frontend',
        proficiency: 90,
        yearsOfExperience: 3,
        certifications: ['Web Development Fundamentals'],
        projects: 12
      },
      {
        id: '5',
        name: 'JavaScript',
        category: 'Language',
        proficiency: 85,
        yearsOfExperience: 3,
        certifications: ['JavaScript Essentials'],
        projects: 10
      },
      {
        id: '6',
        name: 'Python',
        category: 'Backend',
        proficiency: 70,
        yearsOfExperience: 1,
        certifications: ['Python Programming'],
        projects: 2
      },
      {
        id: '7',
        name: 'MySQL',
        category: 'Database',
        proficiency: 75,
        yearsOfExperience: 2,
        certifications: ['Database Management'],
        projects: 4
      },
      {
        id: '8',
        name: 'MongoDB',
        category: 'Database',
        proficiency: 65,
        yearsOfExperience: 1,
        certifications: ['NoSQL Databases'],
        projects: 2
      },
      {
        id: '9',
        name: 'Git',
        category: 'Tools',
        proficiency: 80,
        yearsOfExperience: 2,
        certifications: ['Version Control'],
        projects: 15
      },
      {
        id: '10',
        name: 'Linux',
        category: 'System',
        proficiency: 75,
        yearsOfExperience: 2,
        certifications: ['Linux Administration'],
        projects: 8
      },
      {
        id: '11',
        name: 'Windows Server',
        category: 'System',
        proficiency: 80,
        yearsOfExperience: 3,
        certifications: ['Windows Server Administration'],
        projects: 10
      },
      {
        id: '12',
        name: 'Network Administration',
        category: 'Networking',
        proficiency: 85,
        yearsOfExperience: 3,
        certifications: ['Network Fundamentals', 'Cisco Networking'],
        projects: 12
      }
    ];
    this.setSkills(mockSkills);
  }

  private loadCertificates() {
    const mockCertificates: Certificate[] = [
      {
        id: '1',
        title: 'CompTIA A+ Certification',
        issuer: 'CompTIA',
        issueDate: new Date('2023-03-15'),
        expiryDate: new Date('2026-03-15'),
        category: 'Technical',
        pdfUrl: '/assets/certificates/comptia-a-plus.pdf',
        thumbnailUrl: '/assets/certificates/comptia-thumb.png',
        verificationBadge: true,
        issuerVerification: 'https://verify.comptia.org',
        credentialId: 'COMP-2023-001'
      },
      {
        id: '2',
        title: 'CompTIA Network+ Certification',
        issuer: 'CompTIA',
        issueDate: new Date('2023-08-20'),
        expiryDate: new Date('2026-08-20'),
        category: 'Networking',
        pdfUrl: '/assets/certificates/comptia-network-plus.pdf',
        thumbnailUrl: '/assets/certificates/network-thumb.png',
        verificationBadge: true,
        issuerVerification: 'https://verify.comptia.org',
        credentialId: 'NET-2023-002'
      },
      {
        id: '3',
        title: 'Cisco Certified Network Associate (CCNA)',
        issuer: 'Cisco Systems',
        issueDate: new Date('2024-01-10'),
        expiryDate: new Date('2027-01-10'),
        category: 'Networking',
        pdfUrl: '/assets/certificates/cisco-ccna.pdf',
        thumbnailUrl: '/assets/certificates/cisco-thumb.png',
        verificationBadge: true,
        issuerVerification: 'https://cisco.com/verify',
        credentialId: 'CCNA-2024-003'
      },
      {
        id: '4',
        title: 'Microsoft Certified: Azure Fundamentals',
        issuer: 'Microsoft',
        issueDate: new Date('2023-11-05'),
        expiryDate: new Date('2025-11-05'),
        category: 'Cloud',
        pdfUrl: '/assets/certificates/azure-fundamentals.pdf',
        thumbnailUrl: '/assets/certificates/azure-thumb.png',
        verificationBadge: true,
        issuerVerification: 'https://learn.microsoft.com/credentials',
        credentialId: 'AZ-900-2023-004'
      },
      {
        id: '5',
        title: 'ITIL Foundation Certificate',
        issuer: 'AXELOS',
        issueDate: new Date('2023-05-12'),
        expiryDate: new Date('2026-05-12'),
        category: 'IT Service Management',
        pdfUrl: '/assets/certificates/itil-foundation.pdf',
        thumbnailUrl: '/assets/certificates/itil-thumb.png',
        verificationBadge: true,
        issuerVerification: 'https://axelos.com/certifications',
        credentialId: 'ITIL-2023-005'
      }
    ];
    this.setCertificates(mockCertificates);
  }

  private loadProjects() {
    const mockProjects: Project[] = [
      {
        id: '1',
        title: 'Network Monitoring Dashboard',
        description: 'Real-time network monitoring system built with Angular and Node.js for tracking network performance, device status, and alerting system administrators about potential issues.',
        technologies: ['Angular', 'TypeScript', 'Node.js', 'Chart.js', 'WebSocket'],
        githubUrl: 'https://github.com/bernardzulu/network-monitor',
        liveUrl: 'https://network-monitor-demo.herokuapp.com',
        imageUrl: '/assets/projects/network-monitor.png',
        featured: true
      },
      {
        id: '2',
        title: 'IT Support Ticketing System',
        description: 'Comprehensive ticketing system for IT support teams with role-based access, priority management, and automated email notifications.',
        technologies: ['Angular', 'Node.js', 'MySQL', 'Express', 'JWT'],
        githubUrl: 'https://github.com/bernardzulu/it-ticketing',
        liveUrl: 'https://it-support-tickets.herokuapp.com',
        imageUrl: '/assets/projects/ticketing-system.png',
        featured: true
      },
      {
        id: '3',
        title: 'System Health Checker',
        description: 'Automated system health monitoring tool that checks server status, disk usage, memory utilization, and sends alerts when thresholds are exceeded.',
        technologies: ['Python', 'Flask', 'SQLite', 'Bootstrap', 'Cron Jobs'],
        githubUrl: 'https://github.com/bernardzulu/system-health',
        liveUrl: 'https://system-health-monitor.herokuapp.com',
        imageUrl: '/assets/projects/health-checker.png',
        featured: true
      },
      {
        id: '4',
        title: 'Employee Directory Portal',
        description: 'Internal employee directory with search functionality, department filtering, and contact information management.',
        technologies: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
        githubUrl: 'https://github.com/bernardzulu/employee-directory',
        liveUrl: 'https://employee-directory-demo.herokuapp.com',
        imageUrl: '/assets/projects/employee-directory.png',
        featured: false
      },
      {
        id: '5',
        title: 'Network Configuration Tool',
        description: 'Web-based tool for network administrators to configure routers, switches, and manage IP addressing schemes.',
        technologies: ['Angular', 'Python', 'Flask', 'REST API', 'Docker'],
        githubUrl: 'https://github.com/bernardzulu/network-config',
        liveUrl: 'https://network-config-tool.herokuapp.com',
        imageUrl: '/assets/projects/network-config.png',
        featured: false
      },
      {
        id: '6',
        title: 'Asset Management System',
        description: 'IT asset tracking system for managing hardware inventory, software licenses, and maintenance schedules.',
        technologies: ['Angular', 'Node.js', 'MongoDB', 'Express', 'JWT'],
        githubUrl: 'https://github.com/bernardzulu/asset-management',
        liveUrl: 'https://asset-management-demo.herokuapp.com',
        imageUrl: '/assets/projects/asset-management.png',
        featured: false
      },
      {
        id: '7',
        title: 'Remote Desktop Manager',
        description: 'Web-based remote desktop management solution with multi-user support and session recording capabilities.',
        technologies: ['HTML', 'CSS', 'JavaScript', 'WebRTC', 'Socket.io'],
        githubUrl: 'https://github.com/bernardzulu/remote-desktop',
        liveUrl: 'https://remote-desktop-manager.herokuapp.com',
        imageUrl: '/assets/projects/remote-desktop.png',
        featured: false
      },
      {
        id: '8',
        title: 'Backup Management System',
        description: 'Automated backup system with scheduling, monitoring, and restore capabilities for critical business data.',
        technologies: ['Python', 'Django', 'PostgreSQL', 'Celery', 'Redis'],
        githubUrl: 'https://github.com/bernardzulu/backup-system',
        liveUrl: 'https://backup-management.herokuapp.com',
        imageUrl: '/assets/projects/backup-system.png',
        featured: false
      }
    ];
    this.setProjects(mockProjects);
  }

  private loadBlogPosts() {
    const mockPosts: BlogPost[] = [
      {
        id: '1',
        title: 'Troubleshooting Common Network Issues: A Step-by-Step Guide',
        content: 'Network connectivity problems can be frustrating and time-consuming to resolve. In this comprehensive guide, I\'ll walk you through the most common network issues that IT support specialists encounter and provide practical solutions for each. From IP conflicts to DNS resolution problems, you\'ll learn systematic troubleshooting techniques that will help you resolve issues quickly and efficiently.',
        excerpt: 'Learn how to systematically troubleshoot and resolve common network connectivity issues that IT support specialists face daily.',
        author: 'Bernard Zulu',
        publishDate: new Date('2024-01-20'),
        tags: ['Network Troubleshooting', 'IT Support', 'Networking', 'Problem Solving'],
        category: 'Tutorial',
        readTime: 8,
        featured: true
      },
      {
        id: '2',
        title: 'Setting Up a Secure Home Network: Best Practices',
        content: 'With the increasing number of IoT devices and remote work requirements, securing your home network has never been more important. This guide covers essential security measures including firewall configuration, Wi-Fi security settings, guest network setup, and monitoring tools to keep your network safe from threats.',
        excerpt: 'Essential security practices for setting up and maintaining a secure home network environment.',
        author: 'Bernard Zulu',
        publishDate: new Date('2024-01-15'),
        tags: ['Network Security', 'Home Networking', 'Wi-Fi', 'Cybersecurity'],
        category: 'Guide',
        readTime: 6,
        featured: true
      },
      {
        id: '3',
        title: 'Building Your First Angular Application: A Beginner\'s Journey',
        content: 'Angular is a powerful framework for building modern web applications. In this post, I share my experience building my first Angular application from scratch. We\'ll cover project setup, component creation, routing, and deployment - perfect for developers new to Angular or looking to refresh their knowledge.',
        excerpt: 'Step-by-step guide to building your first Angular application with practical examples and best practices.',
        author: 'Bernard Zulu',
        publishDate: new Date('2024-01-10'),
        tags: ['Angular', 'Web Development', 'Frontend', 'Tutorial'],
        category: 'Tutorial',
        readTime: 10,
        featured: true
      },
      {
        id: '4',
        title: 'Essential IT Certifications for Career Growth in 2024',
        content: 'The IT industry is constantly evolving, and staying current with certifications is crucial for career advancement. Based on my experience as an IT Support Specialist, I\'ll discuss the most valuable certifications for IT professionals in 2024, including CompTIA A+, Network+, Cisco CCNA, and cloud certifications.',
        excerpt: 'A comprehensive overview of the most valuable IT certifications for career growth and professional development.',
        author: 'Bernard Zulu',
        publishDate: new Date('2024-01-05'),
        tags: ['IT Certifications', 'Career Development', 'CompTIA', 'Cisco', 'Professional Growth'],
        category: 'Career',
        readTime: 7,
        featured: false
      },
      {
        id: '5',
        title: 'Automating System Health Checks with Python Scripts',
        content: 'Monitoring system health manually can be time-consuming and error-prone. Learn how to create automated Python scripts that check disk usage, memory utilization, CPU performance, and service status. I\'ll show you how to set up email alerts and schedule these checks to run automatically.',
        excerpt: 'Learn to automate system health monitoring using Python scripts with practical examples and implementation details.',
        author: 'Bernard Zulu',
        publishDate: new Date('2023-12-28'),
        tags: ['Python', 'System Monitoring', 'Automation', 'DevOps', 'Scripting'],
        category: 'Tutorial',
        readTime: 9,
        featured: false
      },
      {
        id: '6',
        title: 'The Future of IT Support: AI and Automation Trends',
        content: 'Artificial Intelligence and automation are transforming the IT support landscape. From chatbots handling basic troubleshooting to predictive maintenance systems, these technologies are changing how IT support is delivered. I explore current trends and what they mean for IT professionals.',
        excerpt: 'Exploring how AI and automation are reshaping the future of IT support and what it means for IT professionals.',
        author: 'Bernard Zulu',
        publishDate: new Date('2023-12-20'),
        tags: ['AI', 'Automation', 'IT Support', 'Future Trends', 'Technology'],
        category: 'Industry Insights',
        readTime: 6,
        featured: false
      }
    ];
    this.setBlogPosts(mockPosts);
  }

  // Supabase data loading methods
  private async loadSkillsFromSupabase() {
    try {
      const { data, error } = await this.supabaseService.client
        .from('skills')
        .select('*')
        .order('name');

      if (error) throw error;

      const skills: Skill[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        proficiency: item.proficiency,
        yearsOfExperience: item.years_of_experience || 0,
        certifications: item.certifications || [],
        projects: item.projects || 0
      }));

      this.setSkills(skills);
    } catch (error) {
      console.error('Error loading skills from Supabase:', error);
      throw error;
    }
  }

  private async loadCertificatesFromSupabase() {
    try {
      const { data, error } = await this.supabaseService.client
        .from('certificates')
        .select('*')
        .order('issue_date', { ascending: false });

      if (error) throw error;

      const certificates: Certificate[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        issuer: item.issuer,
        issueDate: new Date(item.issue_date),
        expiryDate: item.expiry_date ? new Date(item.expiry_date) : undefined,
        category: item.category,
        pdfUrl: item.pdf_url || '',
        thumbnailUrl: item.thumbnail_url || '',
        verificationBadge: item.verification_badge || false,
        issuerVerification: item.issuer_verification,
        credentialId: item.credential_id
      }));

      this.setCertificates(certificates);
    } catch (error) {
      console.error('Error loading certificates from Supabase:', error);
      throw error;
    }
  }

  private async loadProjectsFromSupabase() {
    try {
      const { data, error } = await this.supabaseService.client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projects: Project[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        technologies: item.technologies || [],
        githubUrl: item.github_url,
        liveUrl: item.live_url,
        imageUrl: item.image_url || '/assets/projects/default.jpg',
        featured: item.featured || false
      }));

      this.setProjects(projects);
    } catch (error) {
      console.error('Error loading projects from Supabase:', error);
      throw error;
    }
  }

  private async loadBlogPostsFromSupabase() {
    try {
      const { data, error } = await this.supabaseService.client
        .from('blog_posts')
        .select('*')
        .order('publish_date', { ascending: false });

      if (error) throw error;

      const blogPosts: BlogPost[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        excerpt: item.excerpt || '',
        author: item.author,
        publishDate: new Date(item.publish_date),
        tags: item.tags || [],
        category: item.category,
        readTime: item.read_time || 5,
        featured: item.featured || false
      }));

      this.setBlogPosts(blogPosts);
    } catch (error) {
      console.error('Error loading blog posts from Supabase:', error);
      throw error;
    }
  }

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
  }

  bulkUpdateBlogPosts(updates: Array<{ id: string; updates: Partial<BlogPost> }>): void {
    const posts = this.blogPostsSignal();
    const updatedPosts = posts.map((post: BlogPost) => {
      const update = updates.find((u: { id: string; updates: Partial<BlogPost> }) => u.id === post.id);
      return update ? { ...post, ...update.updates } : post;
    });
    this.setBlogPosts(updatedPosts);
  }
}
