import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export interface About {
  id: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  phone?: string;
  avatar?: string;
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  availability: 'available' | 'busy' | 'unavailable';
  tagline: string;
  created_at: string;
  updated_at: string;
}

export interface AboutValue {
  id: string;
  about_id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface AboutExperience {
  id: string;
  about_id: string;
  year: string;
  title: string;
  company: string;
  description: string;
  technologies?: string[];
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  years_of_experience: number;
  certifications: string[];
  projects: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github_url?: string;
  live_url?: string;
  image_url: string;
  featured: boolean;
  category: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  category: string;
  pdf_url: string;
  thumbnail_url: string;
  verification_badge: boolean;
  issuer_verification?: string;
  credential_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publish_date: string;
  tags: string[];
  category: string;
  read_time: number;
  featured: boolean;
  status: 'draft' | 'published';
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  author: string;
  position: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
  date: string;
  featured: boolean;
  verified: boolean;
  created_at: string;
}

export interface Recommendation {
  id: string;
  author: string;
  position: string;
  company: string;
  content: string;
  date: string;
  avatar?: string;
  linkedin_url?: string;
  verified: boolean;
  created_at: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  company_logo?: string;
  location: string;
  employment_type: string;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  gpa?: number;
  honors?: string[];
  description: string;
  institution_logo?: string;
  location: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  get client() {
    return this.supabase;
  }

  // About operations
  async getAbout() {
    const { data, error } = await this.supabase
      .from('about')
      .select(`
        *,
        about_values (*),
        about_experience (*)
      `)
      .single();

    if (error) throw error;
    return data as About & { about_values: AboutValue[]; about_experience: AboutExperience[] };
  }

  async updateAbout(id: string, updates: Partial<About>) {
    const { data, error } = await this.supabase
      .from('about')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as About;
  }

  // About Values operations
  async addAboutValue(aboutValue: Omit<AboutValue, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('about_values')
      .insert(aboutValue)
      .select()
      .single();

    if (error) throw error;
    return data as AboutValue;
  }

  async updateAboutValue(id: string, updates: Partial<AboutValue>) {
    const { data, error } = await this.supabase
      .from('about_values')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AboutValue;
  }

  async deleteAboutValue(id: string) {
    const { error } = await this.supabase
      .from('about_values')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // About Experience operations
  async addAboutExperience(experience: Omit<AboutExperience, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('about_experience')
      .insert(experience)
      .select()
      .single();

    if (error) throw error;
    return data as AboutExperience;
  }

  async updateAboutExperience(id: string, updates: Partial<AboutExperience>) {
    const { data, error } = await this.supabase
      .from('about_experience')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AboutExperience;
  }

  async deleteAboutExperience(id: string) {
    const { error } = await this.supabase
      .from('about_experience')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Skills operations
  async getSkills() {
    const { data, error } = await this.supabase
      .from('skills')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Skill[];
  }

  async addSkill(skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('skills')
      .insert(skill)
      .select()
      .single();

    if (error) throw error;
    return data as Skill;
  }

  async updateSkill(id: string, updates: Partial<Skill>) {
    const { data, error } = await this.supabase
      .from('skills')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Skill;
  }

  async deleteSkill(id: string) {
    const { error } = await this.supabase
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Projects operations
  async getProjects() {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Project[];
  }

  async addProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async updateProject(id: string, updates: Partial<Project>) {
    const { data, error } = await this.supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async deleteProject(id: string) {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Certificates operations
  async getCertificates() {
    const { data, error } = await this.supabase
      .from('certificates')
      .select('*')
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data as Certificate[];
  }

  async addCertificate(certificate: Omit<Certificate, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('certificates')
      .insert(certificate)
      .select()
      .single();

    if (error) throw error;
    return data as Certificate;
  }

  async updateCertificate(id: string, updates: Partial<Certificate>) {
    const { data, error } = await this.supabase
      .from('certificates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Certificate;
  }

  async deleteCertificate(id: string) {
    const { error } = await this.supabase
      .from('certificates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Blog Posts operations
  async getBlogPosts() {
    const { data, error } = await this.supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('publish_date', { ascending: false });

    if (error) throw error;
    return data as BlogPost[];
  }

  async getAllBlogPosts() {
    const { data, error } = await this.supabase
      .from('blog_posts')
      .select('*')
      .order('publish_date', { ascending: false });

    if (error) throw error;
    return data as BlogPost[];
  }

  async addBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('blog_posts')
      .insert(post)
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>) {
    const { data, error } = await this.supabase
      .from('blog_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  }

  async deleteBlogPost(id: string) {
    const { error } = await this.supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Testimonials operations
  async getTestimonials() {
    const { data, error } = await this.supabase
      .from('testimonials')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Testimonial[];
  }

  async addTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('testimonials')
      .insert(testimonial)
      .select()
      .single();

    if (error) throw error;
    return data as Testimonial;
  }

  async updateTestimonial(id: string, updates: Partial<Testimonial>) {
    const { data, error } = await this.supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Testimonial;
  }

  async deleteTestimonial(id: string) {
    const { error } = await this.supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Recommendations operations
  async getRecommendations() {
    const { data, error } = await this.supabase
      .from('recommendations')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Recommendation[];
  }

  async addRecommendation(recommendation: Omit<Recommendation, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('recommendations')
      .insert(recommendation)
      .select()
      .single();

    if (error) throw error;
    return data as Recommendation;
  }

  async updateRecommendation(id: string, updates: Partial<Recommendation>) {
    const { data, error } = await this.supabase
      .from('recommendations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Recommendation;
  }

  async deleteRecommendation(id: string) {
    const { error } = await this.supabase
      .from('recommendations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Work Experience operations
  async getWorkExperience() {
    const { data, error } = await this.supabase
      .from('work_experience')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data as WorkExperience[];
  }

  async addWorkExperience(experience: Omit<WorkExperience, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('work_experience')
      .insert(experience)
      .select()
      .single();

    if (error) throw error;
    return data as WorkExperience;
  }

  async updateWorkExperience(id: string, updates: Partial<WorkExperience>) {
    const { data, error } = await this.supabase
      .from('work_experience')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkExperience;
  }

  async deleteWorkExperience(id: string) {
    const { error } = await this.supabase
      .from('work_experience')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Education operations
  async getEducation() {
    const { data, error } = await this.supabase
      .from('education')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data as Education[];
  }

  async addEducation(education: Omit<Education, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('education')
      .insert(education)
      .select()
      .single();

    if (error) throw error;
    return data as Education;
  }

  async updateEducation(id: string, updates: Partial<Education>) {
    const { data, error } = await this.supabase
      .from('education')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Education;
  }

  async deleteEducation(id: string) {
    const { error } = await this.supabase
      .from('education')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Utility methods
  generateId(): string {
    return crypto.randomUUID();
  }

  // Real-time subscriptions
  subscribeToTable(table: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();
  }

  unsubscribeFromTable(channelName: string) {
    this.supabase.channel(channelName).unsubscribe();
  }
}
