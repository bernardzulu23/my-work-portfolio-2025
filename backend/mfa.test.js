const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const OTPAuth = require('otpauth');
const mfa = require('./mfa');
const { isPublicApiRoute } = require('./security');

describe('MFA helpers', () => {
  before(() => {
    mfa.setJwtSecret('unit-test-jwt-secret-value-32chars!!');
  });

  it('encrypts and decrypts TOTP secrets', () => {
    const secret = mfa.generateTotpSecret();
    const encrypted = mfa.encryptSecret(secret);
    assert.notEqual(encrypted, secret);
    assert.equal(mfa.decryptSecret(encrypted), secret);
  });

  it('validates TOTP codes from the authenticator secret', () => {
    const secret = mfa.generateTotpSecret();
    const totp = new OTPAuth.TOTP({
      issuer: 'BluePeack Technologies',
      label: 'admin@example.com',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    });
    const code = totp.generate();
    assert.equal(mfa.verifyTotpCode(secret, code, 'admin@example.com'), true);
    assert.equal(mfa.verifyTotpCode(secret, '000000', 'admin@example.com'), false);
  });

  it('consumes hashed recovery codes once', () => {
    const codes = mfa.generateRecoveryCodes(2);
    const hashes = codes.map(mfa.hashRecoveryCode);
    const remaining = mfa.consumeRecoveryCode(hashes, codes[0]);
    assert.ok(remaining);
    assert.equal(remaining.length, 1);
    assert.equal(mfa.consumeRecoveryCode(remaining, codes[0]), null);
  });

  it('creates an authenticator setup payload', async () => {
    const setup = await mfa.createTotpSetup({
      email: 'admin@example.com',
      issuer: 'BluePeack Technologies'
    });
    assert.equal(typeof setup.secret, 'string');
    assert.equal(setup.qrDataUrl.startsWith('data:image/png'), true);
    assert.equal(mfa.verifyTypedToken(setup.setupToken, 'totp-setup').email, 'admin@example.com');
  });

  it('rejects MFA tokens as session tokens', () => {
    const mfaToken = mfa.signMfaToken('admin@example.com', { totp: true });
    assert.equal(mfa.verifySessionToken(mfaToken), null);
    assert.equal(mfa.verifyTypedToken(mfaToken, 'mfa').email, 'admin@example.com');
    const session = mfa.signSessionToken('admin@example.com');
    assert.equal(mfa.verifySessionToken(session).typ, 'session');
  });

  it('binds session tokens to iss and aud', () => {
    const session = mfa.verifySessionToken(mfa.signSessionToken('admin@example.com'));
    assert.equal(session.iss, mfa.TOKEN_ISS);
    assert.equal(session.aud, mfa.TOKEN_AUD);
  });

  it('rejects tokens that omit iss and aud', () => {
    const crypto = require('crypto');
    const payload = Buffer.from(JSON.stringify({
      email: 'admin@example.com',
      typ: 'session',
      exp: Date.now() + 60000
    })).toString('base64url');
    const signature = crypto
      .createHmac('sha256', 'unit-test-jwt-secret-value-32chars!!')
      .update(payload)
      .digest('base64url');
    assert.equal(mfa.verifySessionToken(`${payload}.${signature}`), null);
  });

  it('rejects unknown MFA update columns', async () => {
    await assert.rejects(
      () => mfa.upsertMfaRow({ query: async () => [[]] }, 'admin@example.com', { role: 'admin' }),
      /Invalid MFA field/
    );
  });

  it('requires WebAuthn user verification', () => {
    assert.equal(mfa.REQUIRE_USER_VERIFICATION, true);
  });

  it('requires WebAuthn origin and rp ID in production', () => {
    const previous = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      WEBAUTHN_RP_ID: process.env.WEBAUTHN_RP_ID,
      WEBAUTHN_ORIGIN: process.env.WEBAUTHN_ORIGIN
    };

    process.env.NODE_ENV = 'production';
    delete process.env.VERCEL;
    delete process.env.WEBAUTHN_RP_ID;
    delete process.env.WEBAUTHN_ORIGIN;

    assert.throws(() => mfa.getWebAuthnConfig({}, []), /not configured/);

    const fromHost = mfa.getWebAuthnConfig({
      headers: { host: 'my-work-portfolio-2025.vercel.app' }
    }, []);
    assert.equal(fromHost.rpID, 'my-work-portfolio-2025.vercel.app');
    assert.equal(fromHost.origin, 'https://my-work-portfolio-2025.vercel.app');

    process.env.WEBAUTHN_RP_ID = 'example.com';
    process.env.WEBAUTHN_ORIGIN = 'https://example.com';
    const config = mfa.getWebAuthnConfig({ headers: { origin: 'https://evil.example' } }, []);
    assert.equal(config.rpID, 'example.com');
    assert.equal(config.origin, 'https://example.com');

    if (previous.NODE_ENV === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous.NODE_ENV;
    if (previous.VERCEL === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous.VERCEL;
    if (previous.WEBAUTHN_RP_ID === undefined) delete process.env.WEBAUTHN_RP_ID;
    else process.env.WEBAUTHN_RP_ID = previous.WEBAUTHN_RP_ID;
    if (previous.WEBAUTHN_ORIGIN === undefined) delete process.env.WEBAUTHN_ORIGIN;
    else process.env.WEBAUTHN_ORIGIN = previous.WEBAUTHN_ORIGIN;
  });

  it('keeps MFA verify routes public and other auth routes private', () => {
    assert.equal(isPublicApiRoute('POST', '/api/auth/login'), true);
    assert.equal(isPublicApiRoute('POST', '/api/auth/mfa/verify'), true);
    assert.equal(isPublicApiRoute('POST', '/api/auth/passkey/login/options'), true);
    assert.equal(isPublicApiRoute('POST', '/api/auth/passkey/login/verify'), true);
    assert.equal(isPublicApiRoute('GET', '/api/auth/mfa'), false);
    assert.equal(isPublicApiRoute('POST', '/api/auth/mfa/totp/setup'), false);
    assert.equal(isPublicApiRoute('GET', '/api/auth/me'), false);
    assert.equal(isPublicApiRoute('GET', '/api/projects'), true);
  });
});
