import { Injectable, signal, computed } from '@angular/core';
import { WorkExperience, Education } from '../experience.component';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  // Signals for reactive state management
  private workExperienceSignal = signal<WorkExperience[]>([]);
  private educationSignal = signal<Education[]>([]);

  // Computed signals for derived state
  currentWorkExperience = computed(() =>
    this.workExperienceSignal().filter(exp => exp.current)
  );

  pastWorkExperience = computed(() =>
    this.workExperienceSignal().filter(exp => !exp.current)
  );

  constructor() {
    this.loadExperienceData();
  }

  // Signal-based getters
  getWorkExperience(): WorkExperience[] {
    return this.workExperienceSignal();
  }

  getEducation(): Education[] {
    return this.educationSignal();
  }

  // Signal-based setters
  setWorkExperience(experience: WorkExperience[]): void {
    this.workExperienceSignal.set(experience);
  }

  setEducation(education: Education[]): void {
    this.educationSignal.set(education);
  }

  // Load mock data
  loadExperienceData(): void {
    const mockWorkExperience: WorkExperience[] = [
      {
        id: '1',
        company: 'Zambia Revenue Authority',
        position: 'IT Support Specialist',
        startDate: new Date('2022-03-01'),
        current: true,
        description: 'Providing comprehensive IT support for government operations, managing network infrastructure, troubleshooting hardware and software issues, and ensuring system reliability for critical revenue collection systems.',
        achievements: [
          'Reduced system downtime by 45% through proactive monitoring and maintenance',
          'Successfully migrated 200+ users to new Windows 11 environment',
          'Implemented automated backup system for critical databases',
          'Resolved 95% of support tickets within SLA timeframes',
          'Trained 50+ staff members on IT security best practices'
        ],
        technologies: ['Windows Server', 'Active Directory', 'Network Administration', 'SQL Server', 'PowerShell', 'Cisco Networking'],
        companyLogo: '/assets/companies/zra-logo.png',
        location: 'Lusaka, Zambia',
        employmentType: 'Full-time'
      },
      {
        id: '2',
        company: 'TechHub Solutions',
        position: 'Junior IT Support Technician',
        startDate: new Date('2020-08-01'),
        endDate: new Date('2022-02-28'),
        current: false,
        description: 'Provided technical support for small to medium businesses, handling hardware repairs, software installations, network setup, and user training. Specialized in troubleshooting and system optimization.',
        achievements: [
          'Maintained 99.5% uptime for 15 client networks',
          'Completed 500+ successful hardware repairs and upgrades',
          'Developed custom monitoring scripts for client systems',
          'Achieved 98% customer satisfaction rating',
          'Reduced average ticket resolution time by 30%'
        ],
        technologies: ['Windows 10/11', 'Linux', 'Hardware Troubleshooting', 'Network Configuration', 'Python', 'Bash Scripting'],
        companyLogo: '/assets/companies/techhub-logo.png',
        location: 'Lusaka, Zambia',
        employmentType: 'Full-time'
      },
      {
        id: '3',
        company: 'University of Zambia - IT Department',
        position: 'IT Intern',
        startDate: new Date('2019-06-01'),
        endDate: new Date('2019-12-31'),
        current: false,
        description: 'Assisted in managing university computer labs, providing technical support to students and faculty, and helping with network maintenance and software deployment across campus.',
        achievements: [
          'Set up and maintained 5 computer labs with 200+ workstations',
          'Assisted in campus-wide software deployment project',
          'Provided technical support for 1000+ students during exam periods',
          'Implemented user access control system for lab computers',
          'Created documentation for common IT procedures'
        ],
        technologies: ['Windows Administration', 'Network Management', 'Software Deployment', 'User Support', 'Documentation'],
        companyLogo: '/assets/companies/unza-logo.png',
        location: 'Lusaka, Zambia',
        employmentType: 'Internship'
      }
    ];

    const mockEducation: Education[] = [
      {
        id: '1',
        institution: 'University of Zambia',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2016-09-01'),
        endDate: new Date('2020-05-15'),
        current: false,
        gpa: 3.2,
        honors: ['Dean\'s List (2018)', 'Computer Science Project Award'],
        description: 'Comprehensive computer science program covering software development, database management, network administration, and system analysis. Completed final year project on network monitoring systems.',
        institutionLogo: '/assets/institutions/unza-logo.png',
        location: 'Lusaka, Zambia'
      },
      {
        id: '2',
        institution: 'National Institute of Public Administration',
        degree: 'Diploma',
        field: 'Information Technology',
        startDate: new Date('2014-01-01'),
        endDate: new Date('2015-12-31'),
        current: false,
        honors: ['Best Student Award', 'IT Excellence Certificate'],
        description: 'Foundation program in information technology covering computer hardware, software, networking fundamentals, and basic programming. Graduated with distinction.',
        institutionLogo: '/assets/institutions/nipa-logo.png',
        location: 'Lusaka, Zambia'
      },
      {
        id: '3',
        institution: 'CompTIA Authorized Training Center',
        degree: 'Professional Certification',
        field: 'IT Support and Network Administration',
        startDate: new Date('2019-03-01'),
        endDate: new Date('2019-05-31'),
        current: false,
        honors: ['CompTIA A+ Certified', 'CompTIA Network+ Certified'],
        description: 'Intensive professional training program focusing on practical IT support skills, hardware troubleshooting, operating systems, and network fundamentals.',
        institutionLogo: '/assets/institutions/comptia-logo.png',
        location: 'Lusaka, Zambia'
      }
    ];

    this.setWorkExperience(mockWorkExperience);
    this.setEducation(mockEducation);
  }

  // CRUD operations for work experience
  addWorkExperience(experience: Omit<WorkExperience, 'id'>): void {
    const newExperience: WorkExperience = {
      ...experience,
      id: this.generateId()
    };
    const current = this.workExperienceSignal();
    this.workExperienceSignal.set([...current, newExperience]);
  }

  updateWorkExperience(id: string, updates: Partial<WorkExperience>): void {
    const current = this.workExperienceSignal();
    const updated = current.map(exp =>
      exp.id === id ? { ...exp, ...updates } : exp
    );
    this.workExperienceSignal.set(updated);
  }

  deleteWorkExperience(id: string): void {
    const current = this.workExperienceSignal();
    this.workExperienceSignal.set(current.filter(exp => exp.id !== id));
  }

  // CRUD operations for education
  addEducation(education: Omit<Education, 'id'>): void {
    const newEducation: Education = {
      ...education,
      id: this.generateId()
    };
    const current = this.educationSignal();
    this.educationSignal.set([...current, newEducation]);
  }

  updateEducation(id: string, updates: Partial<Education>): void {
    const current = this.educationSignal();
    const updated = current.map(edu =>
      edu.id === id ? { ...edu, ...updates } : edu
    );
    this.educationSignal.set(updated);
  }

  deleteEducation(id: string): void {
    const current = this.educationSignal();
    this.educationSignal.set(current.filter(edu => edu.id !== id));
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Search and filter methods
  searchWorkExperience(query: string): WorkExperience[] {
    const experiences = this.workExperienceSignal();
    const lowerQuery = query.toLowerCase();

    return experiences.filter(exp =>
      exp.company.toLowerCase().includes(lowerQuery) ||
      exp.position.toLowerCase().includes(lowerQuery) ||
      exp.description.toLowerCase().includes(lowerQuery) ||
      exp.technologies.some(tech => tech.toLowerCase().includes(lowerQuery))
    );
  }

  searchEducation(query: string): Education[] {
    const education = this.educationSignal();
    const lowerQuery = query.toLowerCase();

    return education.filter(edu =>
      edu.institution.toLowerCase().includes(lowerQuery) ||
      edu.degree.toLowerCase().includes(lowerQuery) ||
      edu.field.toLowerCase().includes(lowerQuery) ||
      edu.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Get experiences by technology
  getWorkExperienceByTechnology(technology: string): WorkExperience[] {
    const experiences = this.workExperienceSignal();
    return experiences.filter(exp =>
      exp.technologies.some(tech => tech.toLowerCase() === technology.toLowerCase())
    );
  }

  // Get experiences by year
  getWorkExperienceByYear(year: number): WorkExperience[] {
    const experiences = this.workExperienceSignal();
    return experiences.filter(exp => {
      const startYear = new Date(exp.startDate).getFullYear();
      const endYear = exp.current ? new Date().getFullYear() : new Date(exp.endDate!).getFullYear();
      return year >= startYear && year <= endYear;
    });
  }

  // Calculate career statistics
  getCareerStatistics() {
    const experiences = this.workExperienceSignal();
    const technologies = new Set<string>();
    let totalAchievements = 0;

    experiences.forEach(exp => {
      exp.technologies.forEach(tech => technologies.add(tech));
      totalAchievements += exp.achievements.length;
    });

    return {
      totalCompanies: experiences.length,
      totalTechnologies: technologies.size,
      totalAchievements,
      averageTechnologiesPerRole: Math.round((technologies.size / experiences.length) * 10) / 10
    };
  }
}
