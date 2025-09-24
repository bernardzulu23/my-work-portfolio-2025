import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp: Date;
}

export interface PerformanceMetrics {
  pageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ path: string; views: number }>;
}

export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

export interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private isInitialized = false;
  private sessionStartTime = Date.now();
  private pageViews: string[] = [];

  constructor(private router: Router) {
    this.initializeGoogleAnalytics();
    this.trackRouteChanges();
  }

  private initializeGoogleAnalytics() {
    // Initialize Google Analytics 4
    if (typeof window !== 'undefined') {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      document.head.appendChild(script);

      const configScript = document.createElement('script');
      configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID', {
          page_title: document.title,
          page_location: window.location.href
        });
      `;
      document.head.appendChild(configScript);

      this.isInitialized = true;
    }
  }

  private trackRouteChanges() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
        this.pageViews.push(event.urlAfterRedirects);
      });
  }

  // Track page views
  trackPageView(pagePath: string, pageTitle?: string) {
    if (this.isInitialized && typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pagePath,
        page_title: pageTitle || document.title
      });
    }

    // Store locally for performance metrics
    this.storePageView(pagePath);
  }

  // Track custom events
  trackEvent(eventName: string, parameters?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      parameters: parameters || {},
      timestamp: new Date()
    };

    if (this.isInitialized && typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        ...parameters,
        timestamp: event.timestamp.toISOString()
      });
    }

    // Store locally for analytics dashboard
    this.storeEvent(event);
  }

  // Track user engagement
  trackUserEngagement(action: string, element: string, duration?: number) {
    this.trackEvent('user_engagement', {
      action,
      element,
      duration,
      session_duration: Date.now() - this.sessionStartTime
    });
  }

  // Track performance metrics
  trackPerformanceMetrics(metrics: Partial<PerformanceMetrics>) {
    this.trackEvent('performance_metrics', metrics);
  }

  // Track errors
  trackError(error: Error, context?: string) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href
    });
  }

  // Get session analytics
  getSessionAnalytics() {
    return {
      sessionStartTime: this.sessionStartTime,
      pageViews: this.pageViews.length,
      sessionDuration: Date.now() - this.sessionStartTime,
      pagesViewed: [...new Set(this.pageViews)]
    };
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    const storedViews = this.getStoredPageViews();
    const uniquePages = [...new Set(storedViews.map(v => v.path))];

    return {
      pageViews: storedViews.length,
      uniqueVisitors: this.estimateUniqueVisitors(),
      averageSessionDuration: this.calculateAverageSessionDuration(),
      bounceRate: this.calculateBounceRate(),
      topPages: this.getTopPages()
    };
  }

  private storePageView(pagePath: string) {
    const views = this.getStoredPageViews();
    views.push({
      path: pagePath,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    });

    // Keep only last 1000 views to prevent localStorage bloat
    if (views.length > 1000) {
      views.splice(0, views.length - 1000);
    }

    localStorage.setItem('portfolio_page_views', JSON.stringify(views));
  }

  private storeEvent(event: AnalyticsEvent) {
    const events = this.getStoredEvents();
    events.push(event);

    // Keep only last 500 events
    if (events.length > 500) {
      events.splice(0, events.length - 500);
    }

    localStorage.setItem('portfolio_events', JSON.stringify(events));
  }

  private getStoredPageViews(): Array<{ path: string; timestamp: number; sessionId: string }> {
    try {
      const stored = localStorage.getItem('portfolio_page_views');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getStoredEvents() {
    try {
      const stored = localStorage.getItem('portfolio_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('portfolio_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('portfolio_session_id', sessionId);
    }
    return sessionId;
  }

  private estimateUniqueVisitors(): number {
    const views = this.getStoredPageViews();
    const sessions = [...new Set(views.map(v => v.sessionId))];
    return sessions.length;
  }

  private calculateAverageSessionDuration(): number {
    const views = this.getStoredPageViews();
    const sessions = new Map<string, number[]>();

    views.forEach(view => {
      if (!sessions.has(view.sessionId)) {
        sessions.set(view.sessionId, []);
      }
      sessions.get(view.sessionId)!.push(view.timestamp);
    });

    let totalDuration = 0;
    sessions.forEach(timestamps => {
      if (timestamps.length > 1) {
        totalDuration += timestamps[timestamps.length - 1] - timestamps[0];
      }
    });

    return sessions.size > 0 ? totalDuration / sessions.size : 0;
  }

  private calculateBounceRate(): number {
    const views = this.getStoredPageViews();
    const sessions = new Map<string, number>();

    views.forEach(view => {
      sessions.set(view.sessionId, (sessions.get(view.sessionId) || 0) + 1);
    });

    const singlePageSessions = Array.from(sessions.values()).filter(count => count === 1).length;
    return sessions.size > 0 ? (singlePageSessions / sessions.size) * 100 : 0;
  }

  private getTopPages(): Array<{ path: string; views: number }> {
    const views = this.getStoredPageViews();
    const pageCounts = new Map<string, number>();

    views.forEach(view => {
      pageCounts.set(view.path, (pageCounts.get(view.path) || 0) + 1);
    });

    return Array.from(pageCounts.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }
}
