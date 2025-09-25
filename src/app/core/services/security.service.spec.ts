import { TestBed } from '@angular/core/testing';
import { SecurityService, PasswordValidation, RateLimitStatus, SecurityEvent, LoginAttempt } from './security.service';

describe('SecurityService', () => {
  let service: SecurityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecurityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Input Sanitization', () => {
    it('should sanitize XSS attempts', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const result = service.sanitizeInput(maliciousInput);
      expect(result).toBe('alert("xss")');
    });

    it('should sanitize javascript protocol', () => {
      const maliciousInput = 'javascript:alert("xss")';
      const result = service.sanitizeInput(maliciousInput);
      expect(result).toBe('alert("xss")');
    });

    it('should sanitize event handlers', () => {
      const maliciousInput = 'onload=alert("xss")';
      const result = service.sanitizeInput(maliciousInput);
      expect(result).toBe('alert("xss")');
    });

    it('should handle null and undefined input', () => {
      expect(service.sanitizeInput(null as any)).toBe('');
      expect(service.sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('XSS Detection', () => {
    it('should detect script tags', () => {
      expect(service.detectXSSAttempt('<script>alert("xss")</script>')).toBeTrue();
    });

    it('should detect javascript protocol', () => {
      expect(service.detectXSSAttempt('javascript:alert("xss")')).toBeTrue();
    });

    it('should detect iframe tags', () => {
      expect(service.detectXSSAttempt('<iframe src="evil.com"></iframe>')).toBeTrue();
    });

    it('should detect event handlers', () => {
      expect(service.detectXSSAttempt('<div onload="alert(\'xss\')"></div>')).toBeTrue();
    });

    it('should not detect normal text', () => {
      expect(service.detectXSSAttempt('normal text')).toBeFalse();
      expect(service.detectXSSAttempt('hello world')).toBeFalse();
    });

    it('should handle null and undefined input', () => {
      expect(service.detectXSSAttempt(null as any)).toBeFalse();
      expect(service.detectXSSAttempt(undefined as any)).toBeFalse();
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      expect(service.validateEmail('test@example.com')).toBeTrue();
      expect(service.validateEmail('user.name@domain.co.uk')).toBeTrue();
      expect(service.validateEmail('test+tag@example.com')).toBeTrue();
    });

    it('should reject invalid email addresses', () => {
      expect(service.validateEmail('invalid-email')).toBeFalse();
      expect(service.validateEmail('@example.com')).toBeFalse();
      expect(service.validateEmail('test@')).toBeFalse();
      expect(service.validateEmail('test..test@example.com')).toBeFalse();
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(service.validateEmail(longEmail)).toBeFalse();
    });

    it('should handle null and undefined input', () => {
      expect(service.validateEmail(null as any)).toBeFalse();
      expect(service.validateEmail(undefined as any)).toBeFalse();
    });
  });

  describe('Password Strength Validation', () => {
    it('should reject empty password', () => {
      const result: PasswordValidation = service.validatePasswordStrength('');
      expect(result.valid).toBeFalse();
      expect(result.errors).toContain('Password is required');
      expect(result.strength).toBe('weak');
      expect(result.score).toBe(0);
    });

    it('should reject short passwords', () => {
      const result = service.validatePasswordStrength('123');
      expect(result.valid).toBeFalse();
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should validate strong passwords', () => {
      const result = service.validatePasswordStrength('Password123!');
      expect(result.valid).toBeTrue();
      expect(result.strength).toBe('strong');
      expect(result.score).toBeGreaterThan(3);
    });

    it('should validate very strong passwords', () => {
      const result = service.validatePasswordStrength('VeryLongPassword123!@#');
      expect(result.valid).toBeTrue();
      expect(result.strength).toBe('very-strong');
      expect(result.score).toBeGreaterThan(5);
    });

    it('should detect common patterns', () => {
      const result = service.validatePasswordStrength('password123');
      expect(result.valid).toBeFalse();
      expect(result.errors).toContain('Password contains common patterns');
    });

    it('should check for uppercase letters', () => {
      const result = service.validatePasswordStrength('password123!');
      expect(result.valid).toBeFalse();
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should check for lowercase letters', () => {
      const result = service.validatePasswordStrength('PASSWORD123!');
      expect(result.valid).toBeFalse();
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should check for numbers', () => {
      const result = service.validatePasswordStrength('Password!');
      expect(result.valid).toBeFalse();
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should check for special characters', () => {
      const result = service.validatePasswordStrength('Password123');
      expect(result.valid).toBeFalse();
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('Rate Limiting', () => {
    const clientId = 'test-client';

    beforeEach(() => {
      service.clearRateLimit(clientId);
    });

    it('should allow attempts initially', () => {
      const status: RateLimitStatus = service.getRateLimitStatus(clientId);
      expect(status.isLimited).toBeFalse();
      expect(status.isBlocked).toBeFalse();
      expect(status.remainingAttempts).toBe(5);
    });

    it('should track failed attempts', () => {
      service.recordFailedAttempt(clientId);
      const status = service.getRateLimitStatus(clientId);
      expect(status.remainingAttempts).toBe(4);
      expect(status.isLimited).toBeFalse();
    });

    it('should block after max attempts', () => {
      for (let i = 0; i < 5; i++) {
        service.recordFailedAttempt(clientId);
      }
      const status = service.getRateLimitStatus(clientId);
      expect(status.isLimited).toBeTrue();
      expect(status.isBlocked).toBeTrue();
      expect(status.remainingAttempts).toBe(0);
    });

    it('should reduce penalty on successful attempt', () => {
      for (let i = 0; i < 3; i++) {
        service.recordFailedAttempt(clientId);
      }
      service.recordSuccessfulAttempt(clientId);
      const status = service.getRateLimitStatus(clientId);
      expect(status.remainingAttempts).toBe(3); // Should be reduced
    });

    it('should clear rate limit', () => {
      service.recordFailedAttempt(clientId);
      service.clearRateLimit(clientId);
      const status = service.getRateLimitStatus(clientId);
      expect(status.remainingAttempts).toBe(5);
    });
  });

  describe('Login Attempt Tracking', () => {
    const clientId = 'test-client';

    beforeEach(() => {
      // Clear previous attempts
      service['loginAttempts'] = [];
    });

    it('should record login attempts', () => {
      service.recordLoginAttempt(clientId, true, 'test@example.com');
      service.recordLoginAttempt(clientId, false, 'test@example.com');

      const attempts = service.getLoginAttempts();
      expect(attempts.length).toBe(2);
      expect(attempts[0].success).toBeFalse(); // Most recent first
      expect(attempts[1].success).toBeTrue();
    });

    it('should limit stored attempts', () => {
      for (let i = 0; i < 100; i++) {
        service.recordLoginAttempt(clientId, true, `test${i}@example.com`);
      }

      const attempts = service.getLoginAttempts(200);
      expect(attempts.length).toBeLessThanOrEqual(50); // Should be limited
    });
  });

  describe('Security Event Logging', () => {
    beforeEach(() => {
      service['securityEvents'] = [];
    });

    it('should log security events', () => {
      const event: SecurityEvent = {
        type: 'xss_attempt',
        timestamp: new Date(),
        details: 'XSS attempt detected',
        severity: 'high'
      };

      service.logSecurityEvent(event);
      const events = service.getSecurityEvents();
      expect(events.length).toBe(1);
      expect(events[0].type).toBe('xss_attempt');
    });

    it('should limit stored events', () => {
      for (let i = 0; i < 1100; i++) {
        service.logSecurityEvent({
          type: 'login_attempt',
          timestamp: new Date(),
          details: `Event ${i}`,
          severity: 'low'
        });
      }

      const events = service.getSecurityEvents(2000);
      expect(events.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Client ID Generation', () => {
    it('should generate unique client IDs', () => {
      const id1 = service.generateClientId();
      const id2 = service.generateClientId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Security Metrics', () => {
    it('should provide security metrics', () => {
      const metrics = service.getSecurityMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.lastHour).toBeDefined();
      expect(metrics.lastDay).toBeDefined();
      expect(typeof metrics.activeBlocks).toBe('number');
      expect(typeof metrics.totalEvents).toBe('number');
    });
  });

  describe('Suspicious Activity Detection', () => {
    it('should detect suspicious activity', () => {
      const clientId = 'suspicious-client';

      // Add many different emails from same client
      for (let i = 0; i < 15; i++) {
        service.recordLoginAttempt(clientId, false, `email${i}@example.com`);
      }

      const isSuspicious = service.checkSuspiciousActivity(clientId);
      expect(isSuspicious).toBeTrue();
    });

    it('should not flag normal activity', () => {
      const clientId = 'normal-client';

      service.recordLoginAttempt(clientId, true, 'test@example.com');
      service.recordLoginAttempt(clientId, false, 'test@example.com');

      const isSuspicious = service.checkSuspiciousActivity(clientId);
      expect(isSuspicious).toBeFalse();
    });
  });

  describe('Cleanup Functionality', () => {
    it('should clear all rate limits', () => {
      service.recordFailedAttempt('client1');
      service.recordFailedAttempt('client2');

      service.clearAllRateLimits();

      expect(service.getRateLimitStatus('client1').remainingAttempts).toBe(5);
      expect(service.getRateLimitStatus('client2').remainingAttempts).toBe(5);
    });
  });
});
