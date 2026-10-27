const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  sanitizeText,
  isValidEmail,
  isValidId,
  containsXss,
  validateContactPayload,
  getAdminEmail,
  verifyAdminPassword,
  verifyLoginCredentials,
  validateAdminPasswordStrength,
  corsOriginDelegate,
  isAllowedOrigin,
  isPublicApiRoute,
  parseCookies,
  buildSessionCookie,
  readSessionToken,
  jsonBodyLimit,
  trustedOrigin,
  isSafeHttpUrl,
  isSafeAssetUrl,
  validateProjectPayload,
  validateAboutPayload
} = require('./security');

describe('backend security helpers', () => {
  it('sanitizes dangerous markup', () => {
    const sanitized = sanitizeText('<script>alert(1)</script>Hello');
    assert.equal(sanitized.includes('<script>'), false);
    assert.equal(sanitized.includes('Hello'), true);
  });

  it('validates email format', () => {
    assert.equal(isValidEmail('user@example.com'), true);
    assert.equal(isValidEmail('not-an-email'), false);
  });

  it('validates resource ids', () => {
    assert.equal(isValidId('project-123'), true);
    assert.equal(isValidId('../etc/passwd'), false);
  });

  it('detects xss payloads', () => {
    assert.equal(containsXss('<script>alert(1)</script>'), true);
    assert.equal(containsXss('plain text'), false);
  });

  it('validates contact payload', () => {
    const result = validateContactPayload({
      name: 'Bernard',
      email: 'bernard@example.com',
      subject: 'Project inquiry',
      message: 'I would like to discuss a project.'
    });

    assert.equal(result.valid, true);
    assert.equal(result.data.email, 'bernard@example.com');
  });

  it('rejects malicious contact payload', () => {
    const result = validateContactPayload({
      name: '<script>alert(1)</script>',
      email: 'bernard@example.com',
      subject: 'Hello',
      message: 'Test'
    });

    assert.equal(result.valid, false);
  });

  it('does not default a real admin email', () => {
    const previous = process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_EMAIL;
    assert.equal(getAdminEmail(), '');
    if (previous === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = previous;
  });

  it('rejects login when no admin password is configured', async () => {
    const previousHash = process.env.ADMIN_PASSWORD_HASH;
    const previousPassword = process.env.ADMIN_PASSWORD;
    const previousEmail = process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.ADMIN_PASSWORD;
    process.env.ADMIN_EMAIL = 'admin@example.com';

    assert.equal(await verifyAdminPassword('admin123'), false);
    assert.equal(await verifyLoginCredentials('admin@example.com', 'admin123'), false);

    if (previousHash === undefined) delete process.env.ADMIN_PASSWORD_HASH;
    else process.env.ADMIN_PASSWORD_HASH = previousHash;
    if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = previousPassword;
    if (previousEmail === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = previousEmail;
  });

  it('enforces a 12-character admin password when hashing', () => {
    assert.equal(validateAdminPasswordStrength('short').valid, false);
    assert.equal(validateAdminPasswordStrength('twelve chars').valid, false);
    assert.equal(validateAdminPasswordStrength('TwelveChars1!').valid, true);
  });

  it('does not reflect an untrusted CORS origin', () => {
    let reflected;
    corsOriginDelegate('https://evil-attacker.example.com', (_err, value) => {
      reflected = value;
    });
    assert.equal(reflected, false);
    assert.equal(isAllowedOrigin('https://evil-attacker.example.com'), false);
  });

  it('treats localhost and 127.0.0.1 as the same origin outside production', () => {
    const previous = process.env.ALLOWED_ORIGINS;
    process.env.ALLOWED_ORIGINS = 'http://localhost:4200';
    try {
      assert.equal(isAllowedOrigin('http://127.0.0.1:4200'), true);
    } finally {
      if (previous === undefined) delete process.env.ALLOWED_ORIGINS;
      else process.env.ALLOWED_ORIGINS = previous;
    }
  });

  it('ignores trailing slashes on allowed origins', () => {
    const previous = process.env.ALLOWED_ORIGINS;
    process.env.ALLOWED_ORIGINS = 'https://my-work-portfolio-2025.vercel.app/';
    try {
      assert.equal(isAllowedOrigin('https://my-work-portfolio-2025.vercel.app'), true);
      assert.equal(isAllowedOrigin('https://my-work-portfolio-2025.vercel.app/'), true);
    } finally {
      if (previous === undefined) delete process.env.ALLOWED_ORIGINS;
      else process.env.ALLOWED_ORIGINS = previous;
    }
  });

  it('allows same-origin API posts from the request host', () => {
    assert.equal(
      trustedOrigin({
        method: 'POST',
        path: '/api/auth/login',
        headers: {
          origin: 'https://my-work-portfolio-2025.vercel.app',
          host: 'my-work-portfolio-2025.vercel.app',
          'x-forwarded-proto': 'https'
        }
      }),
      true
    );
  });

  it('requires auth for contact reads and admin MFA setup', () => {
    assert.equal(isPublicApiRoute('GET', '/api/contact'), false);
    assert.equal(isPublicApiRoute('POST', '/api/projects'), false);
    assert.equal(isPublicApiRoute('POST', '/api/uploads'), false);
    assert.equal(isPublicApiRoute('GET', '/api/projects'), true);
  });

  it('builds an HttpOnly session cookie and reads bearer or cookie tokens', () => {
    const cookie = buildSessionCookie('session-token', 3600000);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=/);
    assert.equal(parseCookies('bp_session=abc; other=1').bp_session, 'abc');
    assert.equal(
      readSessionToken({ headers: { authorization: 'Bearer header-token' } }),
      'header-token'
    );
  });

  it('rejects untrusted origins on mutating API requests in production-like checks', () => {
    assert.equal(
      trustedOrigin({
        method: 'POST',
        path: '/api/projects',
        headers: { origin: 'https://evil-attacker.example.com' }
      }),
      false
    );
    assert.equal(jsonBodyLimit({ path: '/api/contact' }), '100kb');
    assert.equal(jsonBodyLimit({ path: '/api/cv/parse' }), '6mb');
  });

  it('rejects javascript, data, and protocol-relative URLs', () => {
    assert.equal(isSafeHttpUrl('https://example.com/resume.pdf'), true);
    assert.equal(isSafeHttpUrl('/assets/resume.pdf'), true);
    assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
    assert.equal(isSafeHttpUrl('data:text/html,hi'), false);
    assert.equal(isSafeHttpUrl('//evil.example'), false);
    assert.equal(isSafeHttpUrl('http://example.com'), false);
    assert.equal(isSafeAssetUrl('data:image/png;base64,aaaa'), true);
    assert.equal(isSafeAssetUrl('data:text/html;base64,aaaa'), false);
  });

  it('rejects unsafe project URLs and extra fields stay unused', () => {
    const rejected = validateProjectPayload({
      title: 'Demo',
      description: 'A project',
      category: 'web',
      liveUrl: 'javascript:alert(1)',
      role: 'admin'
    });
    assert.equal(rejected.valid, false);

    const accepted = validateProjectPayload({
      title: 'Demo',
      description: 'A project',
      category: 'web',
      liveUrl: 'https://example.com',
      role: 'admin'
    });
    assert.equal(accepted.valid, true);
    assert.equal(accepted.data.role, undefined);
    assert.equal(accepted.data.liveUrl, 'https://example.com');
  });

  it('rejects control characters in about text', () => {
    const result = validateAboutPayload({
      name: 'Ada\u0000Lovelace',
      title: 'Engineer'
    });
    assert.equal(result.valid, false);
  });
});
