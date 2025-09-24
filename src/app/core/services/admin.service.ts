import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Testimonial, Recommendation } from '../../features/testimonials/testimonials.component';
import { SupabaseService } from './supabase.service';

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
  private apiUrl = 'api/admin'; // This would be your actual API endpoint

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

  constructor(private http: HttpClient, private supabaseService: SupabaseService) {
    this.loadInitialData();
  }

  // Load initial data
  async loadInitialData() {
    try {
      await this.loadDataFromSupabase();
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
      // Fallback to mock data if Supabase fails
      this.loadMockData();
    }
  }

  private async loadDataFromSupabase() {
    try {
      // Load all data from Supabase
      const [
        blogPosts,
        skills,
        workExperience,
        education,
        projects,
        certificates,
        testimonials,
        recommendations
      ] = await Promise.all([
        this.supabaseService.getAllBlogPosts(),
        this.supabaseService.getSkills(),
        this.supabaseService.getWorkExperience(),
        this.supabaseService.getEducation(),
        this.supabaseService.getProjects(),
        this.supabaseService.getCertificates(),
        this.supabaseService.getTestimonials(),
        this.supabaseService.getRecommendations()
      ]);

      // Transform data to match Admin service interfaces
      const transformedBlogPosts = blogPosts.map(post => ({
        ...post,
        publishDate: new Date(post.publish_date),
        readTime: post.read_time || 5
      }));

      const transformedSkills = skills.map(skill => ({
        ...skill,
        yearsOfExperience: skill.years_of_experience || 0
      }));

      const transformedWorkExperience = workExperience.map(exp => ({
        ...exp,
        startDate: new Date(exp.start_date),
        endDate: exp.end_date ? new Date(exp.end_date) : undefined,
        employmentType: exp.employment_type || 'Full-time'
      }));

      const transformedEducation = education.map(edu => ({
        ...edu,
        startDate: new Date(edu.start_date),
        endDate: edu.end_date ? new Date(edu.end_date) : undefined
      }));

      const transformedProjects = projects.map(project => ({
        ...project,
        imageUrl: project.image_url || '/assets/projects/default.jpg'
      }));

      const transformedCertificates = certificates.map(cert => ({
        ...cert,
        issueDate: new Date(cert.issue_date),
        expiryDate: cert.expiry_date ? new Date(cert.expiry_date) : undefined,
        pdfUrl: cert.pdf_url || '',
        thumbnailUrl: cert.thumbnail_url || '',
        verificationBadge: cert.verification_badge || false
      }));

      const transformedTestimonials = testimonials.map(testimonial => ({
        ...testimonial,
        date: new Date(testimonial.date)
      }));

      const transformedRecommendations = recommendations.map(recommendation => ({
        ...recommendation,
        date: new Date(recommendation.date)
      }));

      this.setBlogPosts(transformedBlogPosts);
      this.setSkills(transformedSkills);
      this.setWorkExperience(transformedWorkExperience);
      this.setEducation(transformedEducation);
      this.setProjects(transformedProjects);
      this.setCertificates(transformedCertificates);
      this.setTestimonials(transformedTestimonials);
      this.setRecommendations(transformedRecommendations);

      // Load about data with related tables
      const aboutData = await this.supabaseService.getAbout();
      const transformedAbout = {
        ...aboutData,
        values: aboutData.about_values || [],
        experience: aboutData.about_experience || []
      };
      this.setAbout([transformedAbout]);

    } catch (error) {
      console.error('Error loading data from Supabase:', error);
      throw error;
    }
  }

  private loadMockData() {
    // Mock blog posts
    const mockBlogPosts: BlogPost[] = [
      {
        id: '1',
        title: 'Getting Started with Angular 19',
        content: 'Angular 19 brings many new features...',
        excerpt: 'Learn about the latest features in Angular 19',
        author: 'Bernard Zulu',
        publishDate: new Date('2024-01-15'),
        tags: ['Angular', 'Frontend', 'Tutorial'],
        category: 'Development',
        readTime: 5,
        featured: true,
        status: 'published'
      }
    ];

    // Mock skills
    const mockSkills: Skill[] = [
      {
        id: '1',
        name: 'Angular',
        category: 'Frontend',
        proficiency: 90,
        yearsOfExperience: 3,
        certifications: ['Angular Developer'],
        projects: 15
      },
      {
        id: '2',
        name: 'TypeScript',
        category: 'Language',
        proficiency: 85,
        yearsOfExperience: 3,
        certifications: [],
        projects: 20
      }
    ];

    // Mock work experience
    const mockWorkExperience: WorkExperience[] = [
      {
        id: '1',
        company: 'Tech Solutions Inc',
        position: 'Full Stack Developer',
        startDate: new Date('2022-01-01'),
        current: true,
        description: 'Developing modern web applications using Angular and Node.js',
        achievements: ['Led 5 major projects', 'Improved performance by 40%'],
        technologies: ['Angular', 'TypeScript', 'Node.js', 'MongoDB'],
        location: 'Lusaka, Zambia',
        employmentType: 'Full-time'
      }
    ];

    // Mock education
    const mockEducation: Education[] = [
      {
        id: '1',
        institution: 'University of Zambia',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2022-06-30'),
        current: false,
        gpa: 3.8,
        honors: ['Dean\'s List', 'Best Final Year Project'],
        description: 'Focused on software engineering and web development',
        institutionLogo: '',
        location: 'Lusaka, Zambia'
      }
    ];

    // Mock projects
    const mockProjects: Project[] = [
      {
        id: '1',
        title: 'E-Commerce Platform',
        description: 'Modern e-commerce solution with payment integration',
        technologies: ['Angular', 'Node.js', 'Stripe', 'MongoDB'],
        githubUrl: 'https://github.com/bernardzulu23/ecommerce',
        liveUrl: 'https://ecommerce-demo.com',
        imageUrl: '/assets/projects/ecommerce.jpg',
        featured: true,
        category: 'Web Application',
        status: 'active'
      }
    ];

    // Mock certificates
    const mockCertificates: Certificate[] = [
      {
        id: '1',
        title: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2023-06-15'),
        expiryDate: new Date('2026-06-15'),
        category: 'Cloud',
        pdfUrl: '/assets/certificates/aws-developer.pdf',
        thumbnailUrl: '/assets/certificates/aws-thumb.jpg',
        verificationBadge: true,
        issuerVerification: 'https://aws.amazon.com/verification',
        credentialId: 'AWS-DEV-12345'
      }
    ];

    // Mock about data
    const mockAbout: About[] = [
      {
        id: '1',
        name: 'Bernard Zulu',
        title: 'Full Stack Developer & IT Support Specialist',
        bio: 'I\'m a dedicated IT Support Specialist, Junior Network Technician, and Full-Stack Developer with expertise in providing technical support, network administration, and developing web applications. I specialize in troubleshooting complex IT issues, managing network infrastructure, and creating efficient software solutions.',
        location: 'Lusaka, Zambia',
        email: 'bernard.zulu@example.com',
        phone: '+260 123 456 789',
        tagline: 'Building the future, one line of code at a time',
        availability: 'available',
        values: [
          {
            id: '1',
            title: 'Innovation',
            description: 'Always exploring new technologies and creative solutions to complex problems.',
            icon: 'lightning-bolt',
            color: 'blue'
          },
          {
            id: '2',
            title: 'Quality',
            description: 'Committed to writing clean, maintainable code and delivering exceptional user experiences.',
            icon: 'heart',
            color: 'purple'
          },
          {
            id: '3',
            title: 'Collaboration',
            description: 'Believe in the power of teamwork and open communication to achieve great results.',
            icon: 'users',
            color: 'green'
          }
        ],
        experience: [
          {
            id: '1',
            year: '2024',
            title: 'IT Support Specialist',
            company: 'Technology Solutions Zambia',
            description: 'Providing comprehensive IT support and network administration services. Managing network infrastructure, troubleshooting hardware/software issues, and implementing system optimizations for improved performance.',
            technologies: ['Network Administration', 'System Optimization', 'Technical Support']
          },
          {
            id: '2',
            year: '2023',
            title: 'Junior Network Technician',
            company: 'Zambia IT Services',
            description: 'Maintaining and monitoring network systems, configuring routers and switches, and providing technical support to end-users. Implemented network security measures and conducted regular system maintenance.',
            technologies: ['Network Security', 'Router Configuration', 'System Maintenance']
          },
          {
            id: '3',
            year: '2022',
            title: 'Full-Stack Developer',
            company: 'Freelance / Personal Projects',
            description: 'Developed web applications using Angular, Node.js, and modern frameworks. Built responsive user interfaces and implemented backend services. Created portfolio website and various client projects.',
            technologies: ['Angular', 'Node.js', 'TypeScript', 'MongoDB']
          }
        ]
      }
    ];

    // Mock testimonials
    const mockTestimonials: Testimonial[] = [
      {
        id: '1',
        author: 'Sarah Johnson',
        position: 'Project Manager',
        company: 'Tech Solutions Inc',
        content: 'Bernard is an exceptional developer who consistently delivers high-quality work. His attention to detail and problem-solving skills are outstanding.',
        avatar: '/assets/testimonials/sarah.jpg',
        rating: 5,
        date: new Date('2024-01-15'),
        featured: true,
        verified: true
      },
      {
        id: '2',
        author: 'Michael Chen',
        position: 'CTO',
        company: 'Digital Innovations',
        content: 'Working with Bernard has been a pleasure. He brings both technical expertise and creative thinking to every project.',
        avatar: '/assets/testimonials/michael.jpg',
        rating: 5,
        date: new Date('2024-01-10'),
        featured: false,
        verified: true
      }
    ];

    // Mock recommendations
    const mockRecommendations: Recommendation[] = [
      {
        id: '1',
        author: 'David Wilson',
        position: 'Senior Developer',
        company: 'CloudTech Solutions',
        content: 'I highly recommend Bernard for any development project. His skills and professionalism are top-notch.',
        date: new Date('2024-01-20'),
        avatar: '/assets/recommendations/david.jpg',
        linkedinUrl: 'https://linkedin.com/in/davidwilson',
        verified: true
      }
    ];

    this.setBlogPosts(mockBlogPosts);
    this.setSkills(mockSkills);
    this.setWorkExperience(mockWorkExperience);
    this.setEducation(mockEducation);
    this.setProjects(mockProjects);
    this.setCertificates(mockCertificates);
    this.setAbout(mockAbout);
    this.setTestimonials(mockTestimonials);
    this.setRecommendations(mockRecommendations);
  }

  // Blog Posts Management
  getBlogPosts() {
    return this.blogPostsSignal();
  }

  addBlogPost(post: Omit<BlogPost, 'id'>) {
    const newPost: BlogPost = {
      ...post,
      id: this.generateId()
    };
    const posts = [...this.blogPostsSignal(), newPost];
    this.setBlogPosts(posts);
    return newPost;
  }

  updateBlogPost(id: string, updates: Partial<BlogPost>) {
    const posts = this.blogPostsSignal().map(post =>
      post.id === id ? { ...post, ...updates } : post
    );
    this.setBlogPosts(posts);
  }

  deleteBlogPost(id: string) {
    const posts = this.blogPostsSignal().filter(post => post.id !== id);
    this.setBlogPosts(posts);
  }

  // Skills Management
  getSkills() {
    return this.skillsSignal();
  }

  addSkill(skill: Omit<Skill, 'id'>) {
    const newSkill: Skill = {
      ...skill,
      id: this.generateId()
    };
    const skills = [...this.skillsSignal(), newSkill];
    this.setSkills(skills);
    return newSkill;
  }

  updateSkill(id: string, updates: Partial<Skill>) {
    const skills = this.skillsSignal().map(skill =>
      skill.id === id ? { ...skill, ...updates } : skill
    );
    this.setSkills(skills);
  }

  deleteSkill(id: string) {
    const skills = this.skillsSignal().filter(skill => skill.id !== id);
    this.setSkills(skills);
  }

  // Work Experience Management
  getWorkExperience() {
    return this.workExperienceSignal();
  }

  addWorkExperience(experience: Omit<WorkExperience, 'id'>) {
    const newExperience: WorkExperience = {
      ...experience,
      id: this.generateId()
    };
    const experiences = [...this.workExperienceSignal(), newExperience];
    this.setWorkExperience(experiences);
    return newExperience;
  }

  updateWorkExperience(id: string, updates: Partial<WorkExperience>) {
    const experiences = this.workExperienceSignal().map(exp =>
      exp.id === id ? { ...exp, ...updates } : exp
    );
    this.setWorkExperience(experiences);
  }

  deleteWorkExperience(id: string) {
    const experiences = this.workExperienceSignal().filter(exp => exp.id !== id);
    this.setWorkExperience(experiences);
  }

  // Education Management
  getEducation() {
    return this.educationSignal();
  }

  addEducation(education: Omit<Education, 'id'>) {
    const newEducation: Education = {
      ...education,
      id: this.generateId()
    };
    const educations = [...this.educationSignal(), newEducation];
    this.setEducation(educations);
    return newEducation;
  }

  updateEducation(id: string, updates: Partial<Education>) {
    const educations = this.educationSignal().map(edu =>
      edu.id === id ? { ...edu, ...updates } : edu
    );
    this.setEducation(educations);
  }

  deleteEducation(id: string) {
    const educations = this.educationSignal().filter(edu => edu.id !== id);
    this.setEducation(educations);
  }

  // Projects Management
  getProjects() {
    return this.projectsSignal();
  }

  addProject(project: Omit<Project, 'id'>) {
    const newProject: Project = {
      ...project,
      id: this.generateId()
    };
    const projects = [...this.projectsSignal(), newProject];
    this.setProjects(projects);
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>) {
    const projects = this.projectsSignal().map(project =>
      project.id === id ? { ...project, ...updates } : project
    );
    this.setProjects(projects);
  }

  deleteProject(id: string) {
    const projects = this.projectsSignal().filter(project => project.id !== id);
    this.setProjects(projects);
  }

  // Certificates Management
  getCertificates() {
    return this.certificatesSignal();
  }

  addCertificate(certificate: Omit<Certificate, 'id'>) {
    const newCertificate: Certificate = {
      ...certificate,
      id: this.generateId()
    };
    const certificates = [...this.certificatesSignal(), newCertificate];
    this.setCertificates(certificates);
    return newCertificate;
  }

  updateCertificate(id: string, updates: Partial<Certificate>) {
    const certificates = this.certificatesSignal().map(cert =>
      cert.id === id ? { ...cert, ...updates } : cert
    );
    this.setCertificates(certificates);
  }

  deleteCertificate(id: string) {
    const certificates = this.certificatesSignal().filter(cert => cert.id !== id);
    this.setCertificates(certificates);
  }

  // About Management
  getAbout() {
    return this.aboutSignal();
  }

  addAbout(about: Omit<About, 'id'>) {
    const newAbout: About = {
      ...about,
      id: this.generateId()
    };
    const abouts = [...this.aboutSignal(), newAbout];
    this.setAbout(abouts);
    return newAbout;
  }

  updateAbout(id: string, updates: Partial<About>) {
    const abouts = this.aboutSignal().map(about =>
      about.id === id ? { ...about, ...updates } : about
    );
    this.setAbout(abouts);
  }

  deleteAbout(id: string) {
    const abouts = this.aboutSignal().filter(about => about.id !== id);
    this.setAbout(abouts);
  }

  // Testimonials Management
  getTestimonials() {
    return this.testimonialsSignal();
  }

  addTestimonial(testimonial: Omit<Testimonial, 'id'>) {
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: this.generateId()
    };
    const testimonials = [...this.testimonialsSignal(), newTestimonial];
    this.setTestimonials(testimonials);
    return newTestimonial;
  }

  updateTestimonial(id: string, updates: Partial<Testimonial>) {
    const testimonials = this.testimonialsSignal().map(testimonial =>
      testimonial.id === id ? { ...testimonial, ...updates } : testimonial
    );
    this.setTestimonials(testimonials);
  }

  deleteTestimonial(id: string) {
    const testimonials = this.testimonialsSignal().filter(testimonial => testimonial.id !== id);
    this.setTestimonials(testimonials);
  }

  // Recommendations Management
  getRecommendations() {
    return this.recommendationsSignal();
  }

  addRecommendation(recommendation: Omit<Recommendation, 'id'>) {
    const newRecommendation: Recommendation = {
      ...recommendation,
      id: this.generateId()
    };
    const recommendations = [...this.recommendationsSignal(), newRecommendation];
    this.setRecommendations(recommendations);
    return newRecommendation;
  }

  updateRecommendation(id: string, updates: Partial<Recommendation>) {
    const recommendations = this.recommendationsSignal().map(recommendation =>
      recommendation.id === id ? { ...recommendation, ...updates } : recommendation
    );
    this.setRecommendations(recommendations);
  }

  deleteRecommendation(id: string) {
    const recommendations = this.recommendationsSignal().filter(recommendation => recommendation.id !== id);
    this.setRecommendations(recommendations);
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
}
