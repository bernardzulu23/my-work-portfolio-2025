const crypto = require('crypto');
const OTPAuth = require('otpauth');
const QRCode = require('qrcode');

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const MFA_TTL_MS = 5 * 60 * 1000;
const SETUP_TTL_MS = 10 * 60 * 1000;
const TOTP_WINDOW = 1;
const RECOVERY_CODE_COUNT = 10;
const TOKEN_ISS = 'bluepeack-portfolio';
const TOKEN_AUD = 'admin-api';
const MFA_COLUMNS = new Set(['totp_secret_enc', 'totp_enabled', 'recovery_hashes']);
const REQUIRE_USER_VERIFICATION = true;

let jwtSecretOverride = '';
let webauthnModule = null;

function getJwtSecret() {
  return jwtSecretOverride || process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';
}

function setJwtSecret(secret) {
  jwtSecretOverride = secret;
}

function getEncKey() {
  return crypto.createHash('sha256').update(`mfa-totp:${getJwtSecret()}`).digest();
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function signPayload(data) {
  const payload = Buffer.from(JSON.stringify({
    ...data,
    iss: TOKEN_ISS,
    aud: TOKEN_AUD
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', getJwtSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = crypto.createHmac('sha256', getJwtSecret()).update(payload).digest('base64url');
  if (!safeEqual(signature, expected)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.email || !data.exp || data.exp < Date.now()) return null;
    if (data.iss !== TOKEN_ISS || data.aud !== TOKEN_AUD) return null;
    if (data.alg && data.alg !== 'HS256') return null;
    return data;
  } catch {
    return null;
  }
}

function signSessionToken(email) {
  return signPayload({ email, typ: 'session', exp: Date.now() + SESSION_TTL_MS });
}

function signMfaToken(email, methods) {
  return signPayload({
    email,
    typ: 'mfa',
    methods,
    exp: Date.now() + MFA_TTL_MS
  });
}

function signTypedToken(email, typ, extra = {}, ttlMs = SETUP_TTL_MS) {
  return signPayload({
    email,
    typ,
    ...extra,
    exp: Date.now() + ttlMs
  });
}

function verifyTypedToken(token, typ) {
  const data = verifyPayload(token);
  if (!data || data.typ !== typ) return null;
  return data;
}

function verifySessionToken(token) {
  return verifyTypedToken(token, 'session');
}

function encryptSecret(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

function decryptSecret(payload) {
  if (!payload || typeof payload !== 'string') return null;
  const [ivPart, tagPart, dataPart] = payload.split('.');
  if (!ivPart || !tagPart || !dataPart) return null;

  try {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      getEncKey(),
      Buffer.from(ivPart, 'base64url')
    );
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(dataPart, 'base64url')),
      decipher.final()
    ]).toString('utf8');
  } catch {
    return null;
  }
}

function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toBase64Url(bytes) {
  return Buffer.from(bytes).toString('base64url');
}

function fromBase64Url(value) {
  return new Uint8Array(Buffer.from(value, 'base64url'));
}

function normalizeRecoveryCode(code) {
  return String(code || '').replace(/[\s-]/g, '').toLowerCase();
}

function hashRecoveryCode(code) {
  return crypto.createHash('sha256').update(normalizeRecoveryCode(code)).digest('hex');
}

function generateRecoveryCodes(count = RECOVERY_CODE_COUNT) {
  return Array.from({ length: count }, () => {
    const raw = crypto.randomBytes(5).toString('hex');
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
  });
}

function consumeRecoveryCode(hashes, code) {
  const incoming = hashRecoveryCode(code);
  const list = Array.isArray(hashes) ? hashes : [];
  const index = list.findIndex((stored) => safeEqual(stored, incoming));
  if (index === -1) return null;
  return list.filter((_, i) => i !== index);
}

function createTotp(secretBase32, email, issuer) {
  return new OTPAuth.TOTP({
    issuer: issuer || 'BluePeack Technologies',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32)
  });
}

function generateTotpSecret() {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

function verifyTotpCode(secretBase32, code, email = 'admin') {
  if (!secretBase32 || !code) return false;
  const token = String(code).replace(/\s/g, '');
  if (!/^\d{6}$/.test(token)) return false;
  const delta = createTotp(secretBase32, email).validate({ token, window: TOTP_WINDOW });
  return delta !== null;
}

async function createTotpSetup({ email, issuer }) {
  const secret = generateTotpSecret();
  const totp = createTotp(secret, email, issuer);
  const otpauthUrl = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 220
  });
  const setupToken = signTypedToken(email, 'totp-setup', { secret: encryptSecret(secret) });
  return { secret, otpauthUrl, qrDataUrl, setupToken };
}

async function ensureMfaSchema(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS auth_mfa (
      email VARCHAR(255) PRIMARY KEY,
      totp_secret_enc TEXT,
      totp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      recovery_hashes TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS auth_passkeys (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      credential_id TEXT NOT NULL UNIQUE,
      public_key TEXT NOT NULL,
      counter BIGINT NOT NULL DEFAULT 0,
      transports JSONB,
      name VARCHAR(100),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getMfaState(db, email) {
  const [mfaRows] = await db.query(
    'SELECT totp_secret_enc, totp_enabled, recovery_hashes FROM auth_mfa WHERE email=?',
    [email]
  );
  const mfa = mfaRows[0];
  const [passkeys] = await db.query(
    'SELECT id, credential_id, public_key, counter, transports, name, created_at FROM auth_passkeys WHERE email=? ORDER BY created_at ASC',
    [email]
  );

  const totpEnabled = Boolean(mfa?.totp_enabled && mfa?.totp_secret_enc);
  const recoveryHashes = parseJson(mfa?.recovery_hashes, []);

  return {
    totpEnabled,
    totpSecretEnc: mfa?.totp_secret_enc || null,
    recoveryHashes: Array.isArray(recoveryHashes) ? recoveryHashes : [],
    passkeys: passkeys || []
  };
}

function isMfaEnrolled(state) {
  return Boolean(state?.totpEnabled || (state?.passkeys || []).length > 0);
}

function toPublicMfaStatus(state) {
  const passkeys = (state.passkeys || []).map((key) => ({
    id: key.id,
    name: key.name || 'Passkey',
    createdAt: key.created_at
  }));

  return {
    enrolled: isMfaEnrolled(state),
    totpEnabled: Boolean(state.totpEnabled),
    passkeyCount: passkeys.length,
    recoveryRemaining: (state.recoveryHashes || []).length,
    passkeys,
    methods: {
      totp: Boolean(state.totpEnabled),
      passkey: passkeys.length > 0,
      recovery: (state.recoveryHashes || []).length > 0
    }
  };
}

function mfaMethodsFromState(state) {
  return {
    totp: Boolean(state.totpEnabled),
    passkey: (state.passkeys || []).length > 0,
    recovery: (state.recoveryHashes || []).length > 0
  };
}

async function upsertMfaRow(db, email, fields) {
  const entries = Object.entries(fields);
  for (const [column] of entries) {
    if (!MFA_COLUMNS.has(column)) {
      throw new Error('Invalid MFA field');
    }
  }

  const [existing] = await db.query('SELECT email FROM auth_mfa WHERE email=?', [email]);
  if (existing[0]) {
    const assignments = [];
    const values = [];
    for (const [column, value] of entries) {
      assignments.push(`${column}=?`);
      values.push(value);
    }
    assignments.push('updated_at=CURRENT_TIMESTAMP');
    values.push(email);
    await db.query(`UPDATE auth_mfa SET ${assignments.join(', ')} WHERE email=?`, values);
    return;
  }

  await db.query(
    'INSERT INTO auth_mfa (email, totp_secret_enc, totp_enabled, recovery_hashes) VALUES (?, ?, ?, ?)',
    [
      email,
      fields.totp_secret_enc ?? null,
      fields.totp_enabled ?? false,
      fields.recovery_hashes ?? JSON.stringify([])
    ]
  );
}

function isProd() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
}

function isLocalHost(value) {
  const host = String(value || '').toLowerCase().split(':')[0];
  return !host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');
}

function isMobileRequest(req) {
  return /Android|iPhone|iPad|iPod/i.test(String(req?.headers?.['user-agent'] || ''));
}

function requestPublicHost(req) {
  const forwarded = String(req?.headers?.['x-forwarded-host'] || '').split(',')[0].trim();
  const hostHeader = String(req?.headers?.host || '').split(',')[0].trim();
  const host = (forwarded || hostHeader).split(':')[0];
  return isLocalHost(host) ? '' : host;
}

function getWebAuthnConfig(req, allowedOrigins = []) {
  const rpName = process.env.WEBAUTHN_RP_NAME || 'BluePeack Technologies';

  if (isProd()) {
    let rpID = process.env.WEBAUTHN_RP_ID;
    let origin = process.env.WEBAUTHN_ORIGIN;
    try {
      if (isLocalHost(rpID) || (origin && isLocalHost(new URL(origin).hostname))) {
        rpID = '';
        origin = '';
      }
    } catch {
      origin = '';
    }
    if (!rpID || !origin) {
      const host = requestPublicHost(req);
      if (host) {
        rpID = rpID || host;
        origin = origin || `https://${host}`;
      }
    }
    if (!rpID || !origin) {
      const error = new Error('WebAuthn is not configured');
      error.status = 503;
      throw error;
    }
    return { rpID, rpName, origin };
  }

  const origins = allowedOrigins.filter(Boolean);
  const requestOrigin = req?.headers?.origin;
  const origin = process.env.WEBAUTHN_ORIGIN
    || (requestOrigin && origins.includes(requestOrigin) ? requestOrigin : origins[0])
    || requestOrigin
    || 'http://localhost:4200';

  let rpID = process.env.WEBAUTHN_RP_ID;
  if (!rpID) {
    try {
      rpID = new URL(origin).hostname;
    } catch {
      rpID = 'localhost';
    }
  }

  return { rpID, rpName, origin };
}

async function loadWebAuthn() {
  if (!webauthnModule) {
    webauthnModule = await import('@simplewebauthn/server');
  }
  return webauthnModule;
}

function extractRegistrationCredential(info) {
  if (!info) return null;
  if (info.credential) {
    return {
      id: info.credential.id,
      publicKey: info.credential.publicKey,
      counter: info.credential.counter,
      transports: info.credential.transports || []
    };
  }
  const credentialID = info.credentialID;
  return {
    id: typeof credentialID === 'string' ? credentialID : toBase64Url(credentialID),
    publicKey: info.credentialPublicKey,
    counter: info.counter,
    transports: []
  };
}

async function createRegistrationOptions(db, email, req, allowedOrigins) {
  const { generateRegistrationOptions } = await loadWebAuthn();
  const state = await getMfaState(db, email);
  const { rpID, rpName } = getWebAuthnConfig(req, allowedOrigins);
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: email,
    userDisplayName: email,
    userID: fromBase64Url(toBase64Url(Buffer.from(email))),
    attestationType: 'none',
    excludeCredentials: state.passkeys.map((key) => ({
      id: key.credential_id,
      transports: parseJson(key.transports, [])
    })),
    authenticatorSelection: {
      ...(isMobileRequest(req) ? { authenticatorAttachment: 'platform' } : {}),
      residentKey: 'preferred',
      userVerification: REQUIRE_USER_VERIFICATION ? 'required' : 'preferred'
    }
  });

  const challengeToken = signTypedToken(email, 'webauthn-reg', {
    challenge: options.challenge
  }, MFA_TTL_MS);

  return { options, challengeToken };
}

async function verifyRegistration(db, email, body, req, allowedOrigins) {
  const { verifyRegistrationResponse } = await loadWebAuthn();
  const challenge = verifyTypedToken(body?.challengeToken, 'webauthn-reg');
  if (!challenge || challenge.email !== email) {
    return { ok: false, error: 'Registration challenge expired. Try again.' };
  }

  const { rpID, origin } = getWebAuthnConfig(req, allowedOrigins);
  const verification = await verifyRegistrationResponse({
    response: body.credential,
    expectedChallenge: challenge.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: REQUIRE_USER_VERIFICATION
  });

  if (!verification.verified) {
    return { ok: false, error: 'Could not verify this passkey.' };
  }

  const credential = extractRegistrationCredential(verification.registrationInfo);
  if (!credential?.id || !credential.publicKey) {
    return { ok: false, error: 'Could not store this passkey.' };
  }

  const publicKey = toBase64Url(credential.publicKey);
  const name = typeof body.name === 'string' && body.name.trim()
    ? body.name.trim().slice(0, 80)
    : `Passkey ${new Date().toLocaleDateString()}`;

  await db.query(
    `INSERT INTO auth_passkeys (id, email, credential_id, public_key, counter, transports, name)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      email,
      credential.id,
      publicKey,
      credential.counter || 0,
      JSON.stringify(credential.transports || []),
      name
    ]
  );

  const state = await getMfaState(db, email);
  if (!state.recoveryHashes.length) {
    const codes = generateRecoveryCodes();
    await upsertMfaRow(db, email, {
      recovery_hashes: JSON.stringify(codes.map(hashRecoveryCode)),
      totp_enabled: state.totpEnabled,
      totp_secret_enc: state.totpSecretEnc
    });
    return { ok: true, recoveryCodes: codes };
  }

  return { ok: true, recoveryCodes: null };
}

async function createAuthenticationOptions(db, email, req, allowedOrigins) {
  const { generateAuthenticationOptions } = await loadWebAuthn();
  const { rpID } = getWebAuthnConfig(req, allowedOrigins);
  let allowCredentials;

  if (email) {
    const state = await getMfaState(db, email);
    if (!state.passkeys.length) {
      return { error: 'No passkeys are registered for this account.' };
    }
    allowCredentials = state.passkeys.map((key) => ({
      id: key.credential_id,
      transports: parseJson(key.transports, [])
    }));
  }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: REQUIRE_USER_VERIFICATION ? 'required' : 'preferred',
    allowCredentials
  });

  const challengeToken = signTypedToken(email || 'passkey-login', 'webauthn-auth', {
    challenge: options.challenge,
    bound: Boolean(email)
  }, MFA_TTL_MS);

  return { options, challengeToken };
}

async function findPasskey(db, credentialId) {
  const [rows] = await db.query(
    'SELECT id, email, credential_id, public_key, counter, transports, name FROM auth_passkeys WHERE credential_id=?',
    [credentialId]
  );
  return rows[0] || null;
}

function credentialIdFromResponse(credential) {
  return credential?.id || credential?.rawId || null;
}

async function verifyAuthentication(db, body, req, allowedOrigins, expectedEmail) {
  const { verifyAuthenticationResponse } = await loadWebAuthn();
  const challenge = verifyTypedToken(body?.challengeToken, 'webauthn-auth');
  if (!challenge) {
    return { ok: false, error: 'Passkey challenge expired. Try again.' };
  }

  const credentialId = credentialIdFromResponse(body.credential);
  if (!credentialId) {
    return { ok: false, error: 'Invalid passkey response.' };
  }

  const stored = await findPasskey(db, credentialId);
  if (!stored) {
    return { ok: false, error: 'Unrecognized passkey.' };
  }

  if (expectedEmail && stored.email !== expectedEmail) {
    return { ok: false, error: 'Unrecognized passkey.' };
  }

  if (challenge.bound && challenge.email !== 'passkey-login' && stored.email !== challenge.email) {
    return { ok: false, error: 'Unrecognized passkey.' };
  }

  const { rpID, origin } = getWebAuthnConfig(req, allowedOrigins);
  const verification = await verifyAuthenticationResponse({
    response: body.credential,
    expectedChallenge: challenge.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: stored.credential_id,
      publicKey: fromBase64Url(stored.public_key),
      counter: Number(stored.counter) || 0,
      transports: parseJson(stored.transports, [])
    },
    requireUserVerification: REQUIRE_USER_VERIFICATION
  });

  if (!verification.verified) {
    return { ok: false, error: 'Could not verify this passkey.' };
  }

  const nextCounter = verification.authenticationInfo?.newCounter;
  if (typeof nextCounter === 'number') {
    await db.query('UPDATE auth_passkeys SET counter=? WHERE id=?', [nextCounter, stored.id]);
  }

  return { ok: true, email: stored.email };
}

module.exports = {
  SESSION_TTL_MS,
  TOKEN_ISS,
  TOKEN_AUD,
  MFA_COLUMNS,
  REQUIRE_USER_VERIFICATION,
  setJwtSecret,
  signSessionToken,
  signMfaToken,
  signTypedToken,
  verifyPayload,
  verifyTypedToken,
  verifySessionToken,
  encryptSecret,
  decryptSecret,
  generateRecoveryCodes,
  hashRecoveryCode,
  consumeRecoveryCode,
  generateTotpSecret,
  verifyTotpCode,
  createTotpSetup,
  ensureMfaSchema,
  getMfaState,
  isMfaEnrolled,
  toPublicMfaStatus,
  mfaMethodsFromState,
  upsertMfaRow,
  getWebAuthnConfig,
  createRegistrationOptions,
  verifyRegistration,
  createAuthenticationOptions,
  verifyAuthentication
};
