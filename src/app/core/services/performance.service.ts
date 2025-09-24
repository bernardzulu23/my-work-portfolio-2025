import { Injectable } from '@angular/core';

export interface CoreWebVitals {
  CLS?: number; // Cumulative Layout Shift
  FID?: number; // First Input Delay
  LCP?: number; // Largest Contentful Paint
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
}

export interface PerformanceEntry {
  name: string;
  value: number;
  timestamp: number;
  type: string;
}

export interface PerformanceMetrics {
  coreWebVitals: CoreWebVitals;
  navigationTiming: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
  };
  resourceTiming: Array<{
    name: string;
    duration: number;
    size: number;
  }>;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private observers: PerformanceObserver[] = [];
  private metricsHistory: PerformanceEntry[] = [];

  constructor() {
    this.initializePerformanceObservers();
  }

  private initializePerformanceObservers() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Observe Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.trackMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observation not supported');
      }

      // Observe First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.trackMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observation not supported');
      }

      // Observe Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.trackMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observation not supported');
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.trackResourceTiming(entry);
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource timing observation not supported');
      }
    }
  }

  private trackMetric(name: string, value: number) {
    const metric: PerformanceEntry = {
      name,
      value,
      timestamp: Date.now(),
      type: 'core-web-vital'
    };

    this.metricsHistory.push(metric);

    // Send to analytics service if available
    if (typeof window !== 'undefined' && (window as any).analyticsService) {
      (window as any).analyticsService.trackPerformanceMetrics({
        [name.toLowerCase()]: value
      });
    }

    // Keep only last 100 metrics
    if (this.metricsHistory.length > 100) {
      this.metricsHistory = this.metricsHistory.slice(-100);
    }
  }

  private trackResourceTiming(entry: any) {
    const resourceMetric: PerformanceEntry = {
      name: entry.name,
      value: entry.duration,
      timestamp: entry.startTime,
      type: 'resource'
    };

    this.metricsHistory.push(resourceMetric);
  }

  // Get Core Web Vitals
  getCoreWebVitals(): CoreWebVitals {
    const vitals: CoreWebVitals = {};

    // Get LCP from performance entries
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      if (navigation) {
        vitals.TTFB = navigation.responseStart - navigation.requestStart;
      }

      // Get paint timing
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry: any) => {
        if (entry.name === 'first-paint') {
          vitals.FCP = entry.startTime;
        }
      });
    }

    // Get latest values from our tracked metrics
    const latestMetrics = this.getLatestMetrics();
    if (latestMetrics['LCP'] !== undefined) vitals.LCP = latestMetrics['LCP'];
    if (latestMetrics['FID'] !== undefined) vitals.FID = latestMetrics['FID'];
    if (latestMetrics['CLS'] !== undefined) vitals.CLS = latestMetrics['CLS'];

    return vitals;
  }

  private getLatestMetrics(): { [key: string]: number } {
    const latest: { [key: string]: number } = {};

    this.metricsHistory.forEach(metric => {
      if (metric.type === 'core-web-vital') {
        latest[metric.name] = metric.value;
      }
    });

    return latest;
  }

  // Get comprehensive performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    const coreWebVitals = this.getCoreWebVitals();
    const navigationTiming = this.getNavigationTiming();
    const resourceTiming = this.getResourceTiming();
    const memoryUsage = this.getMemoryUsage();

    return {
      coreWebVitals,
      navigationTiming,
      resourceTiming,
      memoryUsage
    };
  }

  private getNavigationTiming() {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return {
        domContentLoaded: 0,
        loadComplete: 0
      };
    }

    const navigation = performance.getEntriesByType('navigation')[0] as any;
    if (!navigation) {
      return {
        domContentLoaded: 0,
        loadComplete: 0
      };
    }

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: navigation.firstPaint,
      firstContentfulPaint: navigation.firstContentfulPaint
    };
  }

  private getResourceTiming() {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return [];
    }

    const resources = performance.getEntriesByType('resource') as any[];
    return resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0
    }));
  }

  private getMemoryUsage() {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return undefined;
    }

    const memory = (performance as any).memory;
    if (!memory) {
      return undefined;
    }

    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    };
  }

  // Check if performance is within acceptable ranges
  isPerformanceGood(): { score: number; issues: string[] } {
    const vitals = this.getCoreWebVitals();
    const issues: string[] = [];
    let score = 100;

    // LCP should be < 2.5s
    if (vitals.LCP && vitals.LCP > 2500) {
      issues.push('LCP is too high');
      score -= 25;
    }

    // FID should be < 100ms
    if (vitals.FID && vitals.FID > 100) {
      issues.push('FID is too high');
      score -= 25;
    }

    // CLS should be < 0.1
    if (vitals.CLS && vitals.CLS > 0.1) {
      issues.push('CLS is too high');
      score -= 25;
    }

    // TTFB should be < 800ms
    if (vitals.TTFB && vitals.TTFB > 800) {
      issues.push('TTFB is too high');
      score -= 15;
    }

    return { score: Math.max(0, score), issues };
  }

  // Get performance recommendations
  getPerformanceRecommendations(): string[] {
    const performance = this.isPerformanceGood();
    const recommendations: string[] = [];

    if (performance.issues.includes('LCP is too high')) {
      recommendations.push('Optimize largest contentful paint by using image optimization, preloading critical resources, and reducing render-blocking resources');
    }

    if (performance.issues.includes('FID is too high')) {
      recommendations.push('Reduce first input delay by minimizing JavaScript execution time, using web workers for heavy tasks, and optimizing event handlers');
    }

    if (performance.issues.includes('CLS is too high')) {
      recommendations.push('Reduce cumulative layout shift by setting explicit dimensions for images and videos, avoiding content insertion above existing content');
    }

    if (performance.issues.includes('TTFB is too high')) {
      recommendations.push('Improve time to first byte by optimizing server response times, using CDN, and implementing proper caching strategies');
    }

    return recommendations;
  }

  // Cleanup observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metricsHistory = [];
  }
}
