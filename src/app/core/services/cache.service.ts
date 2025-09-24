import { Injectable } from '@angular/core';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  size: number;
  tags?: string[];
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[]; // Tags for grouping cached items
  maxSize?: number; // Maximum size in bytes
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private maxMemorySize = 50 * 1024 * 1024; // 50MB default limit
  private currentMemorySize = 0;

  constructor() {
    // Load cache from localStorage on initialization
    this.loadFromStorage();

    // Clean up expired entries periodically
    setInterval(() => {
      this.cleanup();
    }, 60000); // Clean up every minute
  }

  // Set cache entry
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = 300000, tags = [], maxSize } = options; // Default 5 minutes TTL
    const timestamp = Date.now();
    const expiry = timestamp + ttl;

    // Calculate size of the data
    const size = this.calculateSize(data);

    // Check if adding this entry would exceed memory limit
    if (maxSize && size > maxSize) {
      console.warn(`Cache entry too large: ${size} bytes exceeds maxSize ${maxSize}`);
      return;
    }

    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      this.currentMemorySize -= existing.size;
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp,
      expiry,
      size,
      tags
    };

    this.cache.set(key, entry);
    this.currentMemorySize += size;

    // Check if we need to evict entries due to memory pressure
    this.enforceMemoryLimit();

    // Save to localStorage
    this.saveToStorage();
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiry) {
      this.delete(key);
      return false;
    }

    return true;
  }

  // Delete specific entry
  delete(key: string): boolean {
    const entry = this.cache.get(key);

    if (entry) {
      this.currentMemorySize -= entry.size;
      this.cache.delete(key);
      this.saveToStorage();
      return true;
    }

    return false;
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear();
    this.currentMemorySize = 0;
    this.saveToStorage();
  }

  // Get cache entry with metadata
  getEntry<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.delete(key);
      return null;
    }

    return entry as CacheEntry<T>;
  }

  // Get all cache keys
  keys(): string[] {
    return Array.from(this.cache.keys()).filter(key => {
      const entry = this.cache.get(key);
      return entry && Date.now() <= entry.expiry;
    });
  }

  // Get cache size (number of entries)
  size(): number {
    return this.cache.size;
  }

  // Get memory usage
  getMemoryUsage(): { used: number; limit: number; percentage: number } {
    return {
      used: this.currentMemorySize,
      limit: this.maxMemorySize,
      percentage: (this.currentMemorySize / this.maxMemorySize) * 100
    };
  }

  // Set memory limit
  setMemoryLimit(bytes: number): void {
    this.maxMemorySize = bytes;
    this.enforceMemoryLimit();
  }

  // Clear entries by tag
  clearByTag(tag: string): number {
    let clearedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.currentMemorySize -= entry.size;
        this.cache.delete(key);
        clearedCount++;
      }
    }

    if (clearedCount > 0) {
      this.saveToStorage();
    }

    return clearedCount;
  }

  // Clear expired entries
  clearExpired(): number {
    let clearedCount = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.currentMemorySize -= entry.size;
        this.cache.delete(key);
        clearedCount++;
      }
    }

    if (clearedCount > 0) {
      this.saveToStorage();
    }

    return clearedCount;
  }

  // Get entries by tag
  getByTag(tag: string): Array<{ key: string; entry: CacheEntry }> {
    const results: Array<{ key: string; entry: CacheEntry }> = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag) && Date.now() <= entry.expiry) {
        results.push({ key, entry });
      }
    }

    return results;
  }

  // Get cache statistics
  getStats(): {
    totalEntries: number;
    memoryUsage: number;
    memoryLimit: number;
    hitRate: number;
    averageEntrySize: number;
    oldestEntry?: number;
    newestEntry?: number;
  } {
    const entries = Array.from(this.cache.values()).filter(entry => Date.now() <= entry.expiry);
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const averageSize = entries.length > 0 ? totalSize / entries.length : 0;

    let oldestEntry: number | undefined;
    let newestEntry: number | undefined;

    entries.forEach(entry => {
      if (!oldestEntry || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (!newestEntry || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    });

    return {
      totalEntries: entries.length,
      memoryUsage: this.currentMemorySize,
      memoryLimit: this.maxMemorySize,
      hitRate: this.calculateHitRate(),
      averageEntrySize: averageSize,
      oldestEntry,
      newestEntry
    };
  }

  // Cache with TTL convenience method
  setWithTTL<T>(key: string, data: T, ttlMinutes: number): void {
    this.set(key, data, { ttl: ttlMinutes * 60 * 1000 });
  }

  // Get or set pattern (common caching pattern)
  getOrSet<T>(key: string, factory: () => T, options: CacheOptions = {}): T {
    let data = this.get<T>(key);

    if (data === null) {
      data = factory();
      this.set(key, data, options);
    }

    return data;
  }

  // Async version of getOrSet
  async getOrSetAsync<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    let data = this.get<T>(key);

    if (data === null) {
      data = await factory();
      this.set(key, data, options);
    }

    return data;
  }

  // Batch operations
  setMultiple(entries: Array<{ key: string; data: any; options?: CacheOptions }>): void {
    entries.forEach(({ key, data, options = {} }) => {
      this.set(key, data, options);
    });
  }

  getMultiple<T>(keys: string[]): Map<string, T | null> {
    const results = new Map<string, T | null>();

    keys.forEach(key => {
      results.set(key, this.get<T>(key));
    });

    return results;
  }

  deleteMultiple(keys: string[]): number {
    let deletedCount = 0;

    keys.forEach(key => {
      if (this.delete(key)) {
        deletedCount++;
      }
    });

    return deletedCount;
  }

  private calculateSize(data: any): number {
    try {
      const str = JSON.stringify(data);
      return new Blob([str]).size;
    } catch {
      // Fallback for non-serializable data
      return 1024; // Assume 1KB for non-serializable data
    }
  }

  private enforceMemoryLimit(): void {
    if (this.currentMemorySize <= this.maxMemorySize) {
      return;
    }

    // Sort entries by timestamp (oldest first)
    const entries = Array.from(this.cache.entries())
      .filter(([, entry]) => Date.now() <= entry.expiry)
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    // Remove oldest entries until we're under the limit
    while (this.currentMemorySize > this.maxMemorySize && entries.length > 0) {
      const [key, entry] = entries.shift()!;
      this.currentMemorySize -= entry.size;
      this.cache.delete(key);
    }

    this.saveToStorage();
  }

  private cleanup(): void {
    this.clearExpired();

    // If still over memory limit after cleanup, enforce it
    if (this.currentMemorySize > this.maxMemorySize) {
      this.enforceMemoryLimit();
    }
  }

  private calculateHitRate(): number {
    // This is a simplified hit rate calculation
    // In a real implementation, you'd track actual hits/misses
    const totalEntries = this.cache.size;
    const expiredEntries = Array.from(this.cache.values())
      .filter(entry => Date.now() > entry.expiry).length;

    return totalEntries > 0 ? ((totalEntries - expiredEntries) / totalEntries) * 100 : 0;
  }

  private saveToStorage(): void {
    try {
      const cacheData = {
        entries: Array.from(this.cache.entries()),
        currentMemorySize: this.currentMemorySize,
        timestamp: Date.now()
      };
      localStorage.setItem('portfolio_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('portfolio_cache');
      if (stored) {
        const cacheData = JSON.parse(stored);

        // Check if cache is not too old (24 hours)
        if (Date.now() - cacheData.timestamp < 24 * 60 * 60 * 1000) {
          this.cache = new Map(cacheData.entries);
          this.currentMemorySize = cacheData.currentMemorySize || 0;
        } else {
          localStorage.removeItem('portfolio_cache');
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      localStorage.removeItem('portfolio_cache');
    }
  }

  // Export cache for debugging
  exportCache(): Array<{ key: string; entry: CacheEntry }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      entry
    }));
  }

  // Import cache (for testing or migration)
  importCache(entries: Array<{ key: string; entry: CacheEntry }>): void {
    this.clear();
    entries.forEach(({ key, entry }) => {
      this.cache.set(key, entry);
      this.currentMemorySize += entry.size;
    });
    this.saveToStorage();
  }
}
