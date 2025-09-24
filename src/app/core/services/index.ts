// Core Services Index
// Export all services for easy importing

export { AnalyticsService } from './analytics.service';
export { PerformanceService } from './performance.service';
export { SearchService } from './search.service';
export { NotificationService } from './notification.service';
export { CacheService } from './cache.service';
export { ExportService } from './export.service';
export { PortfolioService } from './portfolio.service';
export { ThemeService } from './theme.service';

// Re-export interfaces for convenience
export type {
  AnalyticsEvent,
  PerformanceMetrics,
  CoreWebVitals,
  PerformanceEntry as PerformanceEntryInterface
} from './analytics.service';

export type {
  PerformanceEntry,
  PerformanceMetrics as PerformanceMetricsInterface
} from './performance.service';

export type {
  SearchResult,
  SearchFilters,
  SearchOptions
} from './search.service';

export type {
  Notification,
  NotificationConfig,
  NotificationType
} from './notification.service';

export type {
  CacheEntry,
  CacheOptions
} from './cache.service';

export type {
  ExportFormat,
  ExportOptions
} from './export.service';
