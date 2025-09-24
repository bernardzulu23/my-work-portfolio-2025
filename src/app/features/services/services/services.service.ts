import { Injectable, signal, computed } from '@angular/core';
import { ServicePackage, ConsultationBooking, ServiceComparison } from '../services.component';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private servicePackagesSignal = signal<ServicePackage[]>([]);
  private serviceComparisonsSignal = signal<ServiceComparison[]>([]);
  private consultationBookingsSignal = signal<ConsultationBooking[]>([]);

  // Computed signals for reactive data
  servicePackages = computed(() => this.servicePackagesSignal());
  serviceComparisons = computed(() => this.serviceComparisonsSignal());
  consultationBookings = computed(() => this.consultationBookingsSignal());

  constructor() {
    this.loadServicesData();
  }

  loadServicesData(): void {
    // Mock data for service packages
    const mockServicePackages: ServicePackage[] = [
      {
        id: 'basic-web',
        name: 'Basic Website',
        description: 'Perfect for small businesses and personal websites that need a professional online presence.',
        category: 'web-development',
        features: [
          'Responsive design',
          '5 pages maximum',
          'Basic SEO setup',
          'Contact form',
          'Mobile optimization',
          '1 year hosting included'
        ],
        deliverables: [
          'Complete website',
          'Domain setup',
          'Basic analytics',
          'SSL certificate'
        ],
        duration: '2-3 weeks',
        revisions: 2,
        price: 999,
        originalPrice: 1299,
        icon: 'web'
      },
      {
        id: 'premium-web',
        name: 'Premium Website',
        description: 'Advanced websites with custom functionality, e-commerce capabilities, and enhanced user experience.',
        category: 'web-development',
        features: [
          'Everything in Basic',
          'Custom functionality',
          'E-commerce integration',
          'Advanced SEO',
          'Performance optimization',
          '3 months support',
          'Analytics dashboard'
        ],
        deliverables: [
          'Custom website',
          'E-commerce setup',
          'Advanced analytics',
          'Performance report',
          'Training documentation'
        ],
        duration: '4-6 weeks',
        revisions: 5,
        price: 2999,
        originalPrice: 3999,
        popular: true,
        badge: 'Most Popular',
        icon: 'code'
      },
      {
        id: 'enterprise-web',
        name: 'Enterprise Solution',
        description: 'Full-scale enterprise applications with complex requirements, multiple integrations, and advanced security.',
        category: 'web-development',
        features: [
          'Everything in Premium',
          'Complex integrations',
          'Advanced security',
          'Scalable architecture',
          'API development',
          '6 months support',
          '24/7 monitoring'
        ],
        deliverables: [
          'Enterprise application',
          'API documentation',
          'Security audit',
          'Performance optimization',
          'Staff training'
        ],
        duration: '8-12 weeks',
        revisions: 10,
        price: 7999,
        icon: 'design'
      },
      {
        id: 'mobile-app',
        name: 'Mobile App Development',
        description: 'Native and cross-platform mobile applications for iOS and Android with modern UI/UX design.',
        category: 'mobile-development',
        features: [
          'Cross-platform development',
          'Native iOS & Android',
          'App Store deployment',
          'Push notifications',
          'Offline functionality',
          '3 months maintenance'
        ],
        deliverables: [
          'Mobile application',
          'App Store listings',
          'Source code',
          'Documentation',
          'Maintenance guide'
        ],
        duration: '6-8 weeks',
        revisions: 3,
        price: 4999,
        icon: 'mobile'
      },
      {
        id: 'consulting',
        name: 'Technical Consulting',
        description: 'Expert consultation on architecture, technology choices, and development strategies for your projects.',
        category: 'consulting',
        features: [
          'Architecture review',
          'Technology recommendations',
          'Code review',
          'Performance analysis',
          'Security assessment',
          'Scalability planning'
        ],
        deliverables: [
          'Technical report',
          'Architecture diagrams',
          'Implementation roadmap',
          'Best practices guide'
        ],
        duration: '1 week',
        revisions: 1,
        price: 499,
        icon: 'consulting'
      },
      {
        id: 'support',
        name: 'Ongoing Support',
        description: 'Continuous maintenance, updates, and technical support to keep your applications running smoothly.',
        category: 'support',
        features: [
          'Bug fixes',
          'Security updates',
          'Performance monitoring',
          'Regular backups',
          'Technical support',
          'Monthly reports'
        ],
        deliverables: [
          'Monthly maintenance',
          'Performance reports',
          'Security updates',
          '24/7 monitoring'
        ],
        duration: 'Monthly',
        revisions: 0,
        price: 299,
        icon: 'support'
      }
    ];

    // Mock data for service comparisons
    const mockServiceComparisons: ServiceComparison[] = [
      {
        id: 'pages',
        feature: 'Number of Pages',
        basic: '5',
        standard: '15',
        premium: 'Unlimited',
        enterprise: 'Unlimited'
      },
      {
        id: 'responsive',
        feature: 'Responsive Design',
        basic: true,
        standard: true,
        premium: true,
        enterprise: true
      },
      {
        id: 'ecommerce',
        feature: 'E-commerce',
        basic: false,
        standard: true,
        premium: true,
        enterprise: true
      },
      {
        id: 'custom-functionality',
        feature: 'Custom Functionality',
        basic: false,
        standard: true,
        premium: true,
        enterprise: true
      },
      {
        id: 'seo',
        feature: 'Advanced SEO',
        basic: false,
        standard: true,
        premium: true,
        enterprise: true
      },
      {
        id: 'support',
        feature: 'Support Duration',
        basic: '1 month',
        standard: '3 months',
        premium: '6 months',
        enterprise: '12 months'
      },
      {
        id: 'revisions',
        feature: 'Revisions',
        basic: '2',
        standard: '5',
        premium: '10',
        enterprise: 'Unlimited'
      },
      {
        id: 'performance',
        feature: 'Performance Optimization',
        basic: false,
        standard: true,
        premium: true,
        enterprise: true
      },
      {
        id: 'security',
        feature: 'Security Audit',
        basic: false,
        standard: false,
        premium: true,
        enterprise: true
      },
      {
        id: 'training',
        feature: 'Staff Training',
        basic: false,
        standard: false,
        premium: true,
        enterprise: true
      }
    ];

    // Mock data for consultation bookings
    const mockConsultationBookings: ConsultationBooking[] = [
      {
        id: 'initial-consultation',
        title: 'Initial Consultation',
        description: 'A comprehensive discussion about your project requirements, goals, and technical specifications to determine the best approach.',
        duration: 60,
        price: 99,
        availability: ['Monday', 'Wednesday', 'Friday'],
        requirements: [
          'Project brief or description',
          'Current challenges',
          'Desired outcomes',
          'Budget range'
        ],
        outcomes: [
          'Clear project roadmap',
          'Technology recommendations',
          'Timeline estimate',
          'Cost breakdown'
        ]
      },
      {
        id: 'technical-review',
        title: 'Technical Architecture Review',
        description: 'Deep dive into your current or planned technical architecture with expert recommendations for improvements and optimizations.',
        duration: 90,
        price: 199,
        availability: ['Tuesday', 'Thursday'],
        requirements: [
          'Current architecture diagrams',
          'Technology stack details',
          'Performance metrics',
          'Scalability requirements'
        ],
        outcomes: [
          'Architecture assessment report',
          'Performance recommendations',
          'Security evaluation',
          'Scalability roadmap'
        ]
      },
      {
        id: 'code-review',
        title: 'Code Review & Optimization',
        description: 'Comprehensive code review with focus on best practices, performance optimization, and maintainability improvements.',
        duration: 120,
        price: 299,
        availability: ['Monday', 'Tuesday', 'Wednesday'],
        requirements: [
          'Source code access',
          'Current issues list',
          'Performance concerns',
          'Code standards'
        ],
        outcomes: [
          'Detailed code review report',
          'Performance optimization suggestions',
          'Security recommendations',
          'Best practices guide'
        ]
      }
    ];

    this.servicePackagesSignal.set(mockServicePackages);
    this.serviceComparisonsSignal.set(mockServiceComparisons);
    this.consultationBookingsSignal.set(mockConsultationBookings);
  }

  getServicePackages(): ServicePackage[] {
    return this.servicePackagesSignal();
  }

  getServicePackageById(id: string): ServicePackage | undefined {
    return this.servicePackagesSignal().find(pkg => pkg.id === id);
  }

  getServicePackagesByCategory(category: string): ServicePackage[] {
    return this.servicePackagesSignal().filter(pkg => pkg.category === category);
  }

  getServiceComparisons(): ServiceComparison[] {
    return this.serviceComparisonsSignal();
  }

  getConsultationBookings(): ConsultationBooking[] {
    return this.consultationBookingsSignal();
  }

  getConsultationBookingById(id: string): ConsultationBooking | undefined {
    return this.consultationBookingsSignal().find(booking => booking.id === id);
  }

  // Methods for admin functionality
  addServicePackage(servicePackage: ServicePackage): void {
    const current = this.servicePackagesSignal();
    this.servicePackagesSignal.set([...current, servicePackage]);
  }

  updateServicePackage(id: string, updates: Partial<ServicePackage>): void {
    const current = this.servicePackagesSignal();
    const updated = current.map(pkg =>
      pkg.id === id ? { ...pkg, ...updates } : pkg
    );
    this.servicePackagesSignal.set(updated);
  }

  deleteServicePackage(id: string): void {
    const current = this.servicePackagesSignal();
    this.servicePackagesSignal.set(current.filter(pkg => pkg.id !== id));
  }

  addConsultationBooking(booking: ConsultationBooking): void {
    const current = this.consultationBookingsSignal();
    this.consultationBookingsSignal.set([...current, booking]);
  }

  updateConsultationBooking(id: string, updates: Partial<ConsultationBooking>): void {
    const current = this.consultationBookingsSignal();
    const updated = current.map(booking =>
      booking.id === id ? { ...booking, ...updates } : booking
    );
    this.consultationBookingsSignal.set(updated);
  }

  deleteConsultationBooking(id: string): void {
    const current = this.consultationBookingsSignal();
    this.consultationBookingsSignal.set(current.filter(booking => booking.id !== id));
  }
}
