import { Injectable, signal, computed } from '@angular/core';
import { Testimonial, Recommendation } from '../testimonials.component';

@Injectable({
  providedIn: 'root'
})
export class TestimonialsService {
  // Signals for reactive state management
  private testimonialsSignal = signal<Testimonial[]>([]);
  private recommendationsSignal = signal<Recommendation[]>([]);

  // Computed signals for derived state
  featuredTestimonials = computed(() =>
    this.testimonialsSignal().filter(t => t.featured)
  );

  verifiedTestimonials = computed(() =>
    this.testimonialsSignal().filter(t => t.verified)
  );

  recentTestimonials = computed(() => {
    const testimonials = this.testimonialsSignal();
    return testimonials
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  });

  constructor() {
    this.loadTestimonialsData();
  }

  // Signal-based getters
  getAllTestimonials(): Testimonial[] {
    return this.testimonialsSignal();
  }

  getFeaturedTestimonials(): Testimonial[] {
    return this.featuredTestimonials();
  }

  getRecommendations(): Recommendation[] {
    return this.recommendationsSignal();
  }

  // Signal-based setters
  setTestimonials(testimonials: Testimonial[]): void {
    this.testimonialsSignal.set(testimonials);
  }

  setRecommendations(recommendations: Recommendation[]): void {
    this.recommendationsSignal.set(recommendations);
  }

  // Load mock data
  loadTestimonialsData(): void {
    const mockTestimonials: Testimonial[] = [
      {
        id: '1',
        author: 'Grace Mwamba',
        position: 'IT Manager',
        company: 'Zambia Revenue Authority',
        content: 'Bernard has been instrumental in modernizing our tax collection systems. His expertise in implementing digital solutions has significantly improved our efficiency in processing taxpayer information. His knowledge of both legacy systems and modern cloud technologies made the transition seamless for our team.',
        rating: 5,
        date: new Date('2024-01-20'),
        avatar: '/assets/avatars/grace.jpg',
        companyLogo: '/assets/companies/zra-logo.png',
        linkedinUrl: 'https://linkedin.com/in/grace-mwamba',
        verified: true,
        featured: true,
        project: 'Digital Tax Collection System Implementation',
        skills: ['System Migration', 'Cloud Computing', 'Database Management', 'Tax Software']
      },
      {
        id: '2',
        author: 'Dr. Joseph Banda',
        position: 'Head of IT Department',
        company: 'University of Zambia',
        content: 'During his time supporting our e-learning platforms, Bernard demonstrated exceptional technical skills in managing Moodle LMS and related educational technologies. He helped us maintain 99.9% uptime during critical examination periods and trained over 200 lecturers on digital teaching tools.',
        rating: 5,
        date: new Date('2024-01-15'),
        avatar: '/assets/avatars/joseph.jpg',
        companyLogo: '/assets/companies/unza-logo.png',
        linkedinUrl: 'https://linkedin.com/in/joseph-banda',
        verified: true,
        featured: true,
        project: 'E-Learning Platform Support & Training',
        skills: ['LMS Administration', 'Educational Technology', 'Training Delivery', 'System Monitoring']
      },
      {
        id: '3',
        author: 'Mary Tembo',
        position: 'Operations Manager',
        company: 'Stanbic Bank Zambia',
        content: 'Bernard provided excellent technical support for our banking systems migration. His understanding of financial software and compliance requirements was crucial. He ensured minimal downtime during the transition and provided comprehensive documentation for our internal teams.',
        rating: 5,
        date: new Date('2024-01-10'),
        avatar: '/assets/avatars/mary.jpg',
        companyLogo: '/assets/companies/stanbic-logo.png',
        linkedinUrl: 'https://linkedin.com/in/mary-tembo',
        verified: true,
        featured: true,
        project: 'Banking Systems Migration & Compliance',
        skills: ['Financial Software', 'Compliance Management', 'Data Migration', 'Risk Assessment']
      },
      {
        id: '4',
        author: 'Peter Mulenga',
        position: 'Network Administrator',
        company: 'Airtel Zambia',
        content: 'Bernard\'s expertise in telecommunications infrastructure was evident during our network expansion project. He helped optimize our mobile network performance and implemented monitoring systems that reduced downtime by 40%. His knowledge of both copper and fiber optic technologies was impressive.',
        rating: 5,
        date: new Date('2023-12-25'),
        avatar: '/assets/avatars/peter.jpg',
        companyLogo: '/assets/companies/airtel-logo.png',
        linkedinUrl: 'https://linkedin.com/in/peter-mulenga',
        verified: true,
        featured: false,
        project: 'Telecom Network Expansion & Optimization',
        skills: ['Network Infrastructure', 'Telecommunications', 'Performance Monitoring', 'Fiber Optics']
      },
      {
        id: '5',
        author: 'Linda Phiri',
        position: 'Training Coordinator',
        company: 'Zambia Revenue Authority',
        content: 'Bernard conducted comprehensive cybersecurity training for our entire IT department. His sessions covered everything from basic security awareness to advanced threat detection. The practical examples he used, especially related to Zambian cyber threats, made the training highly relevant and effective.',
        rating: 5,
        date: new Date('2023-12-20'),
        avatar: '/assets/avatars/linda.jpg',
        companyLogo: '/assets/companies/zra-logo.png',
        linkedinUrl: 'https://linkedin.com/in/linda-phiri',
        verified: true,
        featured: false,
        project: 'Cybersecurity Training & Awareness Program',
        skills: ['Cybersecurity Training', 'Threat Analysis', 'Security Awareness', 'Risk Management']
      },
      {
        id: '6',
        author: 'Charles Mwewa',
        position: 'Systems Analyst',
        company: 'National Pensions Scheme Authority',
        content: 'Bernard played a key role in digitizing our pension management system. His analysis of our existing processes and recommendation for automation saved us countless hours of manual work. The new system has improved accuracy and reduced processing time by 60%.',
        rating: 5,
        date: new Date('2023-12-15'),
        avatar: '/assets/avatars/charles.jpg',
        companyLogo: '/assets/companies/napsa-logo.png',
        linkedinUrl: 'https://linkedin.com/in/charles-mwewa',
        verified: true,
        featured: false,
        project: 'Pension Management System Digitization',
        skills: ['Business Process Analysis', 'System Automation', 'Process Optimization', 'Requirements Gathering']
      },
      {
        id: '7',
        author: 'Sarah Zulu',
        position: 'IT Support Lead',
        company: 'Shoprite Zambia',
        content: 'Bernard provided exceptional support for our retail management systems across all our branches. His ability to troubleshoot issues remotely and provide quick resolutions minimized store downtime. He also trained our staff on the new POS systems, ensuring smooth operations during peak hours.',
        rating: 5,
        date: new Date('2023-12-10'),
        avatar: '/assets/avatars/sarah.jpg',
        companyLogo: '/assets/companies/shoprite-logo.png',
        linkedinUrl: 'https://linkedin.com/in/sarah-zulu',
        verified: true,
        featured: false,
        project: 'Retail Management System Support',
        skills: ['POS Systems', 'Remote Support', 'Staff Training', 'Retail Technology']
      },
      {
        id: '8',
        author: 'Michael Sinkala',
        position: 'Database Administrator',
        company: 'Zambia National Commercial Bank',
        content: 'Working with Bernard on our core banking system upgrade was a great experience. His deep knowledge of database optimization and backup strategies ensured data integrity throughout the migration. He also implemented monitoring tools that help us proactively identify and resolve issues.',
        rating: 4,
        date: new Date('2023-12-05'),
        avatar: '/assets/avatars/michael.jpg',
        companyLogo: '/assets/companies/zanaco-logo.png',
        linkedinUrl: 'https://linkedin.com/in/michael-sinkala',
        verified: false,
        featured: false,
        project: 'Core Banking System Upgrade',
        skills: ['Database Administration', 'Data Migration', 'Performance Tuning', 'Backup & Recovery']
      }
    ];

    const mockRecommendations: Recommendation[] = [
      {
        id: '1',
        author: 'Dr. Susan Zulu',
        position: 'Director of IT Services',
        company: 'University of Zambia',
        content: 'Bernard demonstrated exceptional technical skills and professionalism during his internship. His ability to quickly learn new technologies and apply them effectively was impressive. He would be a valuable addition to any IT support team.',
        date: new Date('2024-01-18'),
        avatar: '/assets/avatars/susan.jpg',
        companyLogo: '/assets/companies/unza-logo.png',
        linkedinUrl: 'https://linkedin.com/in/susan-zulu',
        verified: true,
        skills: ['Technical Learning', 'Professionalism', 'System Administration']
      },
      {
        id: '2',
        author: 'Thomas Sinkala',
        position: 'Senior IT Consultant',
        company: 'TechHub Solutions',
        content: 'I had the pleasure of mentoring Bernard during his time at TechHub. His enthusiasm for learning and natural aptitude for IT support work is remarkable. He consistently delivered high-quality work and showed great initiative in solving complex problems.',
        date: new Date('2024-01-12'),
        avatar: '/assets/avatars/thomas.jpg',
        companyLogo: '/assets/companies/techhub-logo.png',
        linkedinUrl: 'https://linkedin.com/in/thomas-sinkala',
        verified: true,
        skills: ['Initiative', 'Problem Solving', 'Technical Aptitude']
      },
      {
        id: '3',
        author: 'Grace Mwamba',
        position: 'IT Manager',
        company: 'Zambia Revenue Authority',
        content: 'Bernard has proven himself to be a reliable and skilled IT Support Specialist. His technical knowledge, combined with his excellent communication skills and dedication to service excellence, make him an outstanding professional in his field.',
        date: new Date('2024-01-08'),
        avatar: '/assets/avatars/grace.jpg',
        companyLogo: '/assets/companies/zra-logo.png',
        linkedinUrl: 'https://linkedin.com/in/grace-mwamba',
        verified: true,
        skills: ['Reliability', 'Communication', 'Service Excellence']
      }
    ];

    this.setTestimonials(mockTestimonials);
    this.setRecommendations(mockRecommendations);
  }

  // CRUD operations for testimonials
  addTestimonial(testimonial: Omit<Testimonial, 'id'>): void {
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: this.generateId()
    };
    const current = this.testimonialsSignal();
    this.testimonialsSignal.set([...current, newTestimonial]);
  }

  updateTestimonial(id: string, updates: Partial<Testimonial>): void {
    const current = this.testimonialsSignal();
    const updated = current.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    this.testimonialsSignal.set(updated);
  }

  deleteTestimonial(id: string): void {
    const current = this.testimonialsSignal();
    this.testimonialsSignal.set(current.filter(t => t.id !== id));
  }

  // CRUD operations for recommendations
  addRecommendation(recommendation: Omit<Recommendation, 'id'>): void {
    const newRecommendation: Recommendation = {
      ...recommendation,
      id: this.generateId()
    };
    const current = this.recommendationsSignal();
    this.recommendationsSignal.set([...current, newRecommendation]);
  }

  updateRecommendation(id: string, updates: Partial<Recommendation>): void {
    const current = this.recommendationsSignal();
    const updated = current.map(r =>
      r.id === id ? { ...r, ...updates } : r
    );
    this.recommendationsSignal.set(updated);
  }

  deleteRecommendation(id: string): void {
    const current = this.recommendationsSignal();
    this.recommendationsSignal.set(current.filter(r => r.id !== id));
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Search and filter methods
  searchTestimonials(query: string): Testimonial[] {
    const testimonials = this.testimonialsSignal();
    const lowerQuery = query.toLowerCase();

    return testimonials.filter(t =>
      t.author.toLowerCase().includes(lowerQuery) ||
      t.company.toLowerCase().includes(lowerQuery) ||
      t.content.toLowerCase().includes(lowerQuery) ||
      t.project?.toLowerCase().includes(lowerQuery) ||
      t.skills?.some(skill => skill.toLowerCase().includes(lowerQuery))
    );
  }

  searchRecommendations(query: string): Recommendation[] {
    const recommendations = this.recommendationsSignal();
    const lowerQuery = query.toLowerCase();

    return recommendations.filter(r =>
      r.author.toLowerCase().includes(lowerQuery) ||
      r.company.toLowerCase().includes(lowerQuery) ||
      r.content.toLowerCase().includes(lowerQuery) ||
      r.skills?.some(skill => skill.toLowerCase().includes(lowerQuery))
    );
  }

  // Get testimonials by rating
  getTestimonialsByRating(minRating: number): Testimonial[] {
    const testimonials = this.testimonialsSignal();
    return testimonials.filter(t => t.rating >= minRating);
  }

  // Get testimonials by company
  getTestimonialsByCompany(company: string): Testimonial[] {
    const testimonials = this.testimonialsSignal();
    return testimonials.filter(t =>
      t.company.toLowerCase() === company.toLowerCase()
    );
  }

  // Get testimonials by project
  getTestimonialsByProject(project: string): Testimonial[] {
    const testimonials = this.testimonialsSignal();
    return testimonials.filter(t =>
      t.project?.toLowerCase() === project.toLowerCase()
    );
  }

  // Get testimonials by skill
  getTestimonialsBySkill(skill: string): Testimonial[] {
    const testimonials = this.testimonialsSignal();
    return testimonials.filter(t =>
      t.skills?.some(s => s.toLowerCase() === skill.toLowerCase())
    );
  }

  // Calculate statistics
  getTestimonialsStatistics() {
    const testimonials = this.testimonialsSignal();
    const totalTestimonials = testimonials.length;

    if (totalTestimonials === 0) {
      return {
        total: 0,
        averageRating: 0,
        verifiedCount: 0,
        featuredCount: 0,
        ratingDistribution: [0, 0, 0, 0, 0]
      };
    }

    const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0);
    const averageRating = Math.round((totalRating / totalTestimonials) * 10) / 10;
    const verifiedCount = testimonials.filter(t => t.verified).length;
    const featuredCount = testimonials.filter(t => t.featured).length;

    const ratingDistribution = [5, 4, 3, 2, 1].map(rating =>
      testimonials.filter(t => t.rating === rating).length
    );

    return {
      total: totalTestimonials,
      averageRating,
      verifiedCount,
      featuredCount,
      ratingDistribution
    };
  }

  // Import from LinkedIn (mock implementation)
  async importFromLinkedIn(): Promise<void> {
    // Mock implementation - in real app, this would integrate with LinkedIn API
    console.log('Importing recommendations from LinkedIn...');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock additional recommendations from LinkedIn
    const linkedinRecommendations: Recommendation[] = [
      {
        id: '4',
        author: 'James Wilson',
        position: 'Senior Architect',
        company: 'Enterprise Solutions Ltd',
        content: 'Bernard demonstrates exceptional technical leadership and consistently delivers innovative solutions. His expertise in modern frameworks and best practices makes him an invaluable asset to any development team.',
        date: new Date('2024-01-20'),
        avatar: '/assets/avatars/james.jpg',
        companyLogo: '/assets/companies/enterprise-logo.png',
        linkedinUrl: 'https://linkedin.com/in/james-wilson',
        verified: true,
        skills: ['Technical Leadership', 'Innovation', 'Best Practices']
      }
    ];

    const current = this.recommendationsSignal();
    this.recommendationsSignal.set([...current, ...linkedinRecommendations]);
  }
}
