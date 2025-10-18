import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  // Blog Posts
  async getAllBlogPosts() {
    const { data, error } = await this.client
      .from('blog_posts')
      .select('*')
      .order('publish_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addBlogPost(post: any) {
    const { data, error } = await this.client
      .from('blog_posts')
      .insert([post])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBlogPost(id: string, updates: any) {
    const { data, error } = await this.client
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBlogPost(id: string) {
    const { error } = await this.client
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Skills
  async getSkills() {
    const { data, error } = await this.client
      .from('skills')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async addSkill(skill: any) {
    const { data, error } = await this.client
      .from('skills')
      .insert([skill])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSkill(id: string, updates: any) {
    const { data, error } = await this.client
      .from('skills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSkill(id: string) {
    const { error } = await this.client
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Work Experience
  async getWorkExperience() {
    const { data, error } = await this.client
      .from('work_experience')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addWorkExperience(experience: any) {
    const { data, error } = await this.client
      .from('work_experience')
      .insert([experience])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWorkExperience(id: string, updates: any) {
    const { data, error } = await this.client
      .from('work_experience')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWorkExperience(id: string) {
    const { error } = await this.client
      .from('work_experience')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Education
  async getEducation() {
    const { data, error } = await this.client
      .from('education')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addEducation(education: any) {
    const { data, error } = await this.client
      .from('education')
      .insert([education])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEducation(id: string, updates: any) {
    const { data, error } = await this.client
      .from('education')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEducation(id: string) {
    const { error } = await this.client
      .from('education')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Projects
  async getProjects() {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addProject(project: any) {
    const { data, error } = await this.client
      .from('projects')
      .insert([project])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProject(id: string, updates: any) {
    const { data, error } = await this.client
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProject(id: string) {
    const { error } = await this.client
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Certificates
  async getCertificates() {
    const { data, error } = await this.client
      .from('certificates')
      .select('*')
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addCertificate(certificate: any) {
    const { data, error } = await this.client
      .from('certificates')
      .insert([certificate])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCertificate(id: string, updates: any) {
    const { data, error } = await this.client
      .from('certificates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCertificate(id: string) {
    const { error } = await this.client
      .from('certificates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // About
  async getAbout() {
    const { data, error } = await this.client
      .from('about')
      .select(`
        *,
        about_values (*),
        about_experience (*)
      `)
      .single();

    if (error) throw error;
    return data || {};
  }

  async updateAbout(id: string, updates: any) {
    const { data, error } = await this.client
      .from('about')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Testimonials
  async getTestimonials() {
    const { data, error } = await this.client
      .from('testimonials')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addTestimonial(testimonial: any) {
    const { data, error } = await this.client
      .from('testimonials')
      .insert([testimonial])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTestimonial(id: string, updates: any) {
    const { data, error } = await this.client
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTestimonial(id: string) {
    const { error } = await this.client
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Recommendations
  async getRecommendations() {
    const { data, error } = await this.client
      .from('recommendations')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addRecommendation(recommendation: any) {
    const { data, error } = await this.client
      .from('recommendations')
      .insert([recommendation])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRecommendation(id: string, updates: any) {
    const { data, error } = await this.client
      .from('recommendations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRecommendation(id: string) {
    const { error } = await this.client
      .from('recommendations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
