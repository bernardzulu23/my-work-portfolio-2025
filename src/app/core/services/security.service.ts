import { Injectable } from '@angular/core';

export interface PasswordValidation {
  valid: boolean;
  isValid: boolean;  // For backward compatibility
  errors: string[];
  score: number;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

export interface RateLimitStatus {
  isLimited: boolean;
  isBlocked: boolean;
  remainingAttempts: number;
  resetTime?: Date;
  blockedUntil?: Date;
  timeRemaining?: number;
}

export interface SecurityEvent {
  type: 'login_attempt' | 'xss_attempt' | 'rate_limit' | 'admin_access' | 'security_violation' | 'rate_limit_exceeded' | 'suspicious_activity';
  timestamp: Date;
  details: string;
  clientId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface LoginAttempt {
  clientId: string;
  timestamp: Date;
  success: boolean;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private rateLimitMap = new Map<string, {
    attempts: number;
    lastAttempt: Date;
    blockUntil?: Date;
    successfulAttempts: number;
  }>();

  private securityEvents: SecurityEvent[] = [];
  private loginAttempts: LoginAttempt[] = [];

  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_EVENTS = 1000; // Limit stored events

  constructor() {
    this.cleanupExpiredEntries();
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data URLs
      .replace(/vbscript:/gi, '') // Remove vbscript
      .trim();
  }

  // XSS Detection
  detectXSSAttempt(input: string): boolean {
    if (!input || typeof input !== 'string') return false;

    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]+src[^>]*=[\s]*javascript:/gi,
      /<[^>]*\s*on\w+\s*=.*?>/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:\s*text\/html/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Email validation
  validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Password strength validation
  validatePasswordStrength(password: string): PasswordValidation {
    const errors: string[] = [];
    let score = 0;

    if (!password) {
      return {
        valid: false,
        isValid: false,
        errors: ['Password is required'],
        score: 0,
        strength: 'weak'
      };
    }

    // Length check (minimum 8 characters)
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      score += 1;
      if (password.length >= 12) score += 1; // Bonus for longer passwords
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    // Number check
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    // No common patterns
    if (this.hasCommonPatterns(password)) {
      errors.push('Password contains common patterns');
      score = Math.max(0, score - 1);
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
    if (score >= 6) strength = 'very-strong';
    else if (score >= 5) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    const isValid = errors.length === 0;

    return {
      valid: isValid,
      isValid: isValid, // For backward compatibility
      errors,
      score,
      strength
    };
  }

  private hasCommonPatterns(password: string): boolean {
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /admin/i,
      /letmein/i,
      /welcome/i,
      /monkey/i
    ];

    return commonPatterns.some(pattern => pattern.test(password));
  }

  // Rate limiting
  isRateLimited(clientId: string): boolean {
    const status = this.getRateLimitStatus(clientId);
    return status.isLimited || status.isBlocked;
  }

  getRateLimitStatus(clientId: string): RateLimitStatus {
    const now = new Date();
    const userAttempts = this.rateLimitMap.get(clientId);

    if (!userAttempts) {
      return {
        isLimited: false,
        isBlocked: false,
        remainingAttempts: this.MAX_ATTEMPTS
      };
    }

    // Check if still blocked
    if (userAttempts.blockUntil && now < userAttempts.blockUntil) {
      return {
        isLimited: true,
        isBlocked: true,
        remainingAttempts: 0,
        resetTime: userAttempts.blockUntil,
        blockedUntil: userAttempts.blockUntil,
        timeRemaining: userAttempts.blockUntil.getTime() - now.getTime()
      };
    }

    // Check if window has expired
    const timeDiff = now.getTime() - userAttempts.lastAttempt.getTime();
    if (timeDiff > this.WINDOW_MS) {
      this.rateLimitMap.delete(clientId);
      return {
        isLimited: false,
        isBlocked: false,
        remainingAttempts: this.MAX_ATTEMPTS
      };
    }

    const isLimited = userAttempts.attempts >= this.MAX_ATTEMPTS;
    const remainingAttempts = Math.max(0, this.MAX_ATTEMPTS - userAttempts.attempts);

    if (isLimited && !userAttempts.blockUntil) {
      userAttempts.blockUntil = new Date(now.getTime() + this.BLOCK_DURATION_MS);
    }

    return {
      isLimited,
      isBlocked: isLimited,
      remainingAttempts,
      resetTime: isLimited ? userAttempts.blockUntil : undefined,
      blockedUntil: userAttempts.blockUntil,
      timeRemaining: isLimited && userAttempts.blockUntil ?
        userAttempts.blockUntil.getTime() - now.getTime() : undefined
    };
  }

  recordFailedAttempt(clientId: string): void {
    const now = new Date();
    const existing = this.rateLimitMap.get(clientId);

    if (!existing) {
      this.rateLimitMap.set(clientId, {
        attempts: 1,
        lastAttempt: now,
        successfulAttempts: 0
      });
    } else {
      const timeDiff = now.getTime() - existing.lastAttempt.getTime();

      if (timeDiff > this.WINDOW_MS) {
        // Reset if window expired
        this.rateLimitMap.set(clientId, {
          attempts: 1,
          lastAttempt: now,
          successfulAttempts: 0
        });
      } else {
        // Increment attempts
        existing.attempts += 1;
        existing.lastAttempt = now;
      }
    }
  }

  recordSuccessfulAttempt(clientId: string): void {
    const existing = this.rateLimitMap.get(clientId);
    if (existing) {
      existing.successfulAttempts += 1;
      // Don't completely clear on success, but reduce penalty
      existing.attempts = Math.max(0, existing.attempts - 1);
    }
  }

  // Login attempt tracking
  recordLoginAttempt(clientId: string, success: boolean, email?: string): void {
    const attempt: LoginAttempt = {
      clientId,
      timestamp: new Date(),
      success,
      email
    };

    this.loginAttempts.push(attempt);

    // Keep only recent attempts
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.loginAttempts = this.loginAttempts.filter(attempt =>
      attempt.timestamp > oneHourAgo
    );

    // Update rate limiting
    if (!success) {
      this.recordFailedAttempt(clientId);
    } else {
      this.recordSuccessfulAttempt(clientId);
    }

    // Log security event
    this.logSecurityEvent({
      type: 'login_attempt',
      timestamp: new Date(),
      details: `Login attempt ${success ? 'succeeded' : 'failed'} for ${email || 'unknown'} from client ${clientId}`,
      clientId,
      severity: success ? 'low' : 'medium'
    });
  }

  // Security event logging
  logSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);

    // Keep only recent events to prevent memory issues
    if (this.securityEvents.length > this.MAX_EVENTS) {
      this.securityEvents = this.securityEvents.slice(-this.MAX_EVENTS);
    }

    // In production, you might want to send critical events to a monitoring service
    if (event.severity === 'critical' || event.severity === 'high') {
      console.warn('Security Event:', event);
    }
  }

  getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.securityEvents
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getLoginAttempts(limit: number = 50): LoginAttempt[] {
    return this.loginAttempts
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  clearRateLimit(clientId: string): void {
    this.rateLimitMap.delete(clientId);
  }

  clearAllRateLimits(): void {
    this.rateLimitMap.clear();
  }

  // Utility methods
  generateClientId(): string {
    // Create a client ID based on browser fingerprint and session
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Security fingerprint', 2, 2);
    }

    const fingerprint = canvas.toDataURL();
    const sessionId = sessionStorage.getItem('securityClientId') || this.generateRandomId();

    if (!sessionStorage.getItem('securityClientId')) {
      sessionStorage.setItem('securityClientId', sessionId);
    }

    return btoa(fingerprint + sessionId).slice(0, 32);
  }

  private generateRandomId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private cleanupExpiredEntries(): void {
    // Run cleanup every 5 minutes
    setInterval(() => {
      const now = new Date();

      // Cleanup rate limits
      for (const [clientId, data] of this.rateLimitMap.entries()) {
        const timeDiff = now.getTime() - data.lastAttempt.getTime();
        if (timeDiff > this.WINDOW_MS * 2) { // Clean up entries older than 2 windows
          this.rateLimitMap.delete(clientId);
        }
      }

      // Cleanup old login attempts (keep only last 24 hours)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      this.loginAttempts = this.loginAttempts.filter(attempt =>
        attempt.timestamp > oneDayAgo
      );

      // Cleanup old security events (keep only last 7 days)
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      this.securityEvents = this.securityEvents.filter(event =>
        event.timestamp > oneWeekAgo
      );

    }, 5 * 60 * 1000); // 5 minutes
  }

  // Additional security checks
  checkSuspiciousActivity(clientId: string): boolean {
    const recentAttempts = this.loginAttempts.filter(attempt =>
      attempt.clientId === clientId &&
      attempt.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    // Flag if too many different emails from same client
    const uniqueEmails = new Set(recentAttempts.map(a => a.email));
    return uniqueEmails.size > 10; // More than 10 different emails in an hour
  }

  getSecurityMetrics() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentAttempts = this.loginAttempts.filter(a => a.timestamp > oneHourAgo);
    const dailyAttempts = this.loginAttempts.filter(a => a.timestamp > oneDayAgo);

    return {
      lastHour: {
        totalAttempts: recentAttempts.length,
        failedAttempts: recentAttempts.filter(a => !a.success).length,
        successfulAttempts: recentAttempts.filter(a => a.success).length
      },
      lastDay: {
        totalAttempts: dailyAttempts.length,
        failedAttempts: dailyAttempts.filter(a => !a.success).length,
        successfulAttempts: dailyAttempts.filter(a => a.success).length
      },
      activeBlocks: this.rateLimitMap.size,
      totalEvents: this.securityEvents.length
    };
  }
}
