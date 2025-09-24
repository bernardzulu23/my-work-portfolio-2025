import { Injectable, computed, signal } from '@angular/core';
import { PortfolioService, Skill, Certificate, Project, BlogPost } from './portfolio.service';

export interface SearchResult {
  type: 'skill' | 'certificate' | 'project' | 'blog';
  item: Skill | Certificate | Project | BlogPost;
  relevanceScore: number;
  matchedFields: string[];
}

export interface SearchFilters {
  categories?: string[];
  tags?: string[];
  technologies?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  featured?: boolean;
}

export interface SearchOptions {
  query?: string;
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'date' | 'name' | 'category';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchHistory = signal<string[]>([]);
  private recentSearches = computed(() => this.searchHistory().slice(0, 10));

  constructor(private portfolioService: PortfolioService) {}

  // Main search method
  search(options: SearchOptions = {}): SearchResult[] {
    const { query = '', filters = {}, sortBy = 'relevance', sortOrder = 'desc', limit, offset = 0 } = options;

    let results: SearchResult[] = [];

    // Search across all content types
    results = [
      ...this.searchSkills(query, filters).map(item => ({ ...item, type: 'skill' as const })),
      ...this.searchCertificates(query, filters).map(item => ({ ...item, type: 'certificate' as const })),
      ...this.searchProjects(query, filters).map(item => ({ ...item, type: 'project' as const })),
      ...this.searchBlogPosts(query, filters).map(item => ({ ...item, type: 'blog' as const }))
    ];

    // Sort results
    results = this.sortResults(results, sortBy, sortOrder);

    // Apply pagination
    if (limit) {
      results = results.slice(offset, offset + limit);
    }

    // Store search query in history
    if (query.trim()) {
      this.addToSearchHistory(query.trim());
    }

    return results;
  }

  // Individual search methods
  private searchSkills(query: string, filters: SearchFilters): Array<Omit<SearchResult, 'type'>> {
    const skills = this.portfolioService.getSkills();
    const results: Array<Omit<SearchResult, 'type'>> = [];

    skills.forEach(skill => {
      const relevanceScore = this.calculateRelevanceScore(query, [
        skill.name,
        skill.category,
        ...(skill.certifications || [])
      ]);

      if (relevanceScore > 0 && this.matchesFilters(skill, filters, 'skill')) {
        results.push({
          item: skill,
          relevanceScore,
          matchedFields: this.getMatchedFields(query, skill)
        });
      }
    });

    return results;
  }

  private searchCertificates(query: string, filters: SearchFilters): Array<Omit<SearchResult, 'type'>> {
    const certificates = this.portfolioService.getCertificates();
    const results: Array<Omit<SearchResult, 'type'>> = [];

    certificates.forEach(cert => {
      const relevanceScore = this.calculateRelevanceScore(query, [
        cert.title,
        cert.issuer,
        cert.category,
        cert.credentialId || ''
      ]);

      if (relevanceScore > 0 && this.matchesFilters(cert, filters, 'certificate')) {
        results.push({
          item: cert,
          relevanceScore,
          matchedFields: this.getMatchedFields(query, cert)
        });
      }
    });

    return results;
  }

  private searchProjects(query: string, filters: SearchFilters): Array<Omit<SearchResult, 'type'>> {
    const projects = this.portfolioService.getProjects();
    const results: Array<Omit<SearchResult, 'type'>> = [];

    projects.forEach(project => {
      const relevanceScore = this.calculateRelevanceScore(query, [
        project.title,
        project.description,
        ...(project.technologies || [])
      ]);

      if (relevanceScore > 0 && this.matchesFilters(project, filters, 'project')) {
        results.push({
          item: project,
          relevanceScore,
          matchedFields: this.getMatchedFields(query, project)
        });
      }
    });

    return results;
  }

  private searchBlogPosts(query: string, filters: SearchFilters): Array<Omit<SearchResult, 'type'>> {
    const posts = this.portfolioService.getBlogPosts();
    const results: Array<Omit<SearchResult, 'type'>> = [];

    posts.forEach(post => {
      const relevanceScore = this.calculateRelevanceScore(query, [
        post.title,
        post.content,
        post.excerpt,
        post.author,
        ...(post.tags || [])
      ]);

      if (relevanceScore > 0 && this.matchesFilters(post, filters, 'blog')) {
        results.push({
          item: post,
          relevanceScore,
          matchedFields: this.getMatchedFields(query, post)
        });
      }
    });

    return results;
  }

  // Calculate relevance score
  private calculateRelevanceScore(query: string, fields: string[]): number {
    if (!query.trim()) return 1; // No query means show all

    const queryLower = query.toLowerCase();
    let score = 0;
    const matchedFields: string[] = [];

    fields.forEach(field => {
      const fieldLower = field.toLowerCase();

      // Exact match gets highest score
      if (fieldLower === queryLower) {
        score += 100;
        matchedFields.push(field);
      }
      // Starts with query
      else if (fieldLower.startsWith(queryLower)) {
        score += 50;
        matchedFields.push(field);
      }
      // Contains query
      else if (fieldLower.includes(queryLower)) {
        score += 25;
        matchedFields.push(field);
      }
      // Word boundary match
      else if (new RegExp(`\\b${queryLower}`).test(fieldLower)) {
        score += 15;
        matchedFields.push(field);
      }
    });

    return score;
  }

  // Get matched fields for highlighting
  private getMatchedFields(query: string, item: any): string[] {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();
    const matchedFields: string[] = [];

    Object.keys(item).forEach(key => {
      const value = item[key];
      if (typeof value === 'string' && value.toLowerCase().includes(queryLower)) {
        matchedFields.push(key);
      } else if (Array.isArray(value)) {
        if (value.some(v => typeof v === 'string' && v.toLowerCase().includes(queryLower))) {
          matchedFields.push(key);
        }
      }
    });

    return matchedFields;
  }

  // Check if item matches filters
  private matchesFilters(item: any, filters: SearchFilters, type: string): boolean {
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(item.category)) {
        return false;
      }
    }

    // Featured filter
    if (filters.featured !== undefined && item.featured !== filters.featured) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const itemDate = this.getItemDate(item, type);
      if (itemDate) {
        if (filters.dateRange.start && itemDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && itemDate > filters.dateRange.end) {
          return false;
        }
      }
    }

    // Technology filter (for projects)
    if (filters.technologies && filters.technologies.length > 0 && type === 'project') {
      const projectTechnologies = item.technologies || [];
      if (!filters.technologies.some(tech => projectTechnologies.includes(tech))) {
        return false;
      }
    }

    // Tags filter (for blog posts)
    if (filters.tags && filters.tags.length > 0 && type === 'blog') {
      const postTags = item.tags || [];
      if (!filters.tags.some(tag => postTags.includes(tag))) {
        return false;
      }
    }

    return true;
  }

  private getItemDate(item: any, type: string): Date | null {
    switch (type) {
      case 'certificate':
        return item.issueDate ? new Date(item.issueDate) : null;
      case 'blog':
        return item.publishDate ? new Date(item.publishDate) : null;
      default:
        return null;
    }
  }

  // Sort results
  private sortResults(results: SearchResult[], sortBy: string, sortOrder: 'asc' | 'desc'): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = b.relevanceScore - a.relevanceScore;
          break;
        case 'date':
          const dateA = this.getItemDate(a.item, a.type);
          const dateB = this.getItemDate(b.item, b.type);
          comparison = dateA && dateB ? dateB.getTime() - dateA.getTime() : 0;
          break;
        case 'name':
          const nameA = this.getItemName(a.item);
          const nameB = this.getItemName(b.item);
          comparison = nameA.localeCompare(nameB);
          break;
        case 'category':
          const categoryA = (a.item as any).category || '';
          const categoryB = (b.item as any).category || '';
          comparison = categoryA.localeCompare(categoryB);
          break;
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }

  private getItemName(item: any): string {
    if ('name' in item) return item.name;
    if ('title' in item) return item.title;
    return '';
  }

  // Search suggestions
  getSearchSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) return [];

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Get suggestions from all content
    const allContent = [
      ...this.portfolioService.getSkills(),
      ...this.portfolioService.getCertificates(),
      ...this.portfolioService.getProjects(),
      ...this.portfolioService.getBlogPosts()
    ];

    allContent.forEach(item => {
      const searchableFields = this.getSearchableFields(item);
      searchableFields.forEach(field => {
        const fieldLower = field.toLowerCase();
        if (fieldLower.includes(queryLower) && fieldLower !== queryLower) {
          // Add partial matches as suggestions
          const words = fieldLower.split(' ');
          words.forEach(word => {
            if (word.startsWith(queryLower) && word.length > queryLower.length) {
              suggestions.add(word);
            }
          });
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  private getSearchableFields(item: any): string[] {
    const fields: string[] = [];

    if (item.name) fields.push(item.name);
    if (item.title) fields.push(item.title);
    if (item.description) fields.push(item.description);
    if (item.content) fields.push(item.content);
    if (item.excerpt) fields.push(item.excerpt);
    if (item.issuer) fields.push(item.issuer);
    if (item.author) fields.push(item.author);
    if (item.category) fields.push(item.category);

    if (item.technologies) fields.push(...item.technologies);
    if (item.tags) fields.push(...item.tags);
    if (item.certifications) fields.push(...item.certifications);

    return fields;
  }

  // Search history management
  private addToSearchHistory(query: string) {
    const history = this.searchHistory();
    const filteredHistory = history.filter(q => q !== query);
    filteredHistory.unshift(query);
    this.searchHistory.set(filteredHistory.slice(0, 20)); // Keep last 20 searches
  }

  getRecentSearches(): string[] {
    return this.recentSearches();
  }

  clearSearchHistory() {
    this.searchHistory.set([]);
  }

  removeFromSearchHistory(query: string) {
    const history = this.searchHistory();
    this.searchHistory.set(history.filter(q => q !== query));
  }

  // Advanced search with multiple queries
  advancedSearch(queries: string[], options: SearchOptions = {}): SearchResult[] {
    const allResults = new Map<string, SearchResult>();

    queries.forEach(query => {
      const results = this.search({ ...options, query });
      results.forEach(result => {
        const key = `${result.type}-${(result.item as any).id}`;
        if (allResults.has(key)) {
          // Boost score for items matching multiple queries
          const existing = allResults.get(key)!;
          existing.relevanceScore += result.relevanceScore * 0.5;
        } else {
          allResults.set(key, result);
        }
      });
    });

    return Array.from(allResults.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}
