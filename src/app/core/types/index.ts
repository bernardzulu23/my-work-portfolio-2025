export interface Testimonial {
  id: string;
  author: string;
  position: string;
  company: string;
  content: string;
  rating: number;
  date: Date;
  avatar?: string;
  companyLogo?: string;
  linkedinUrl?: string;
  verified: boolean;
  featured: boolean;
  project?: string;
  skills?: string[];
}

export interface Recommendation {
  id: string;
  author: string;
  position: string;
  company: string;
  content: string;
  date: Date;
  avatar?: string;
  companyLogo?: string;
  linkedinUrl?: string;
  verified: boolean;
  skills?: string[];
}

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
