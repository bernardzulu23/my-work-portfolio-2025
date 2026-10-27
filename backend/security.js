const crypto = require('crypto');
const bcrypt = require('bcrypt');

const isProduction =
  process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const PUBLIC_AUTH_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/mfa/verify',
  '/api/auth/passkey/login/options',
  '/api/auth/passkey/login/verify'
]);

const DUMMY_PASSWORD_HASH = '$2b$12$0qifBO.bUIyv/xJoaR7PtOl8mV7uuaAd5XEYor5VoBgRZqh6TP5je';
const MIN_ADMIN_PASSWORD_LENGTH = 12;

function assertProductionSecrets() {
  if (!isProduction) return;

  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }

  if (!process.env.ADMIN_PASSWORD_HASH) {
    throw new Error('ADMIN_PASSWORD_HASH is required in production');
  }

  if (!process.env.ADMIN_EMAIL) {
    throw new Error('ADMIN_EMAIL is required in production');
  }
}

function getAdminEmail() {
  return String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
}

function normalizeOrigin(origin) {
  return String(origin || '').trim().replace(/\/+$/, '');
}

function vercelAppOrigins() {
  const hosts = [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL
  ].filter(Boolean);

  return hosts
    .map((host) => {
      const cleaned = String(host).trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      return cleaned ? `https://${cleaned}` : '';
    })
    .filter(Boolean);
}

function getAllowedOrigins() {
  const fromEnv = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
  return [...new Set([...fromEnv, ...vercelAppOrigins()])];
}

function loopbackAliases(origin) {
  if (!origin) return [];
  try {
    const url = new URL(origin);
    if (url.hostname === 'localhost') {
      url.hostname = '127.0.0.1';
      return [origin, url.origin];
    }
    if (url.hostname === '127.0.0.1') {
      url.hostname = 'localhost';
      return [origin, url.origin];
    }
  } catch {
    return [origin];
  }
  return [origin];
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  const normalized = normalizeOrigin(origin);
  const allowed = getAllowedOrigins();
  if (allowed.includes(normalized)) return true;
  if (isProduction) return false;
  return loopbackAliases(normalized).some((candidate) => allowed.includes(candidate));
}

function corsOriginDelegate(origin, callback) {
  if (!origin) {
    callback(null, true);
    return;
  }
  if (isAllowedOrigin(origin)) {
    callback(null, origin);
    return;
  }
  callback(null, false);
}

async function verifyAdminPassword(password) {
  if (!password || typeof password !== 'string') return false;

  if (process.env.ADMIN_PASSWORD_HASH) {
    return bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  }

  if (!isProduction && process.env.ADMIN_PASSWORD) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    return password === process.env.ADMIN_PASSWORD;
  }

  await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
  return false;
}

async function verifyLoginCredentials(email, password) {
  const adminEmail = getAdminEmail();
  const emailOk = Boolean(adminEmail) && String(email || '').trim().toLowerCase() === adminEmail;
  const passwordOk = await verifyAdminPassword(password);
  return emailOk && passwordOk;
}

function validateAdminPasswordStrength(password) {
  if (typeof password !== 'string' || password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return { valid: false, error: `Password must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters` };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return {
      valid: false,
      error: 'Password must include uppercase, lowercase, a number, and a special character'
    };
  }
  return { valid: true };
}

function sanitizeText(value, maxLength = 5000) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .trim()
    .slice(0, maxLength);
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

function isValidId(id) {
  if (typeof id !== 'string' || !id.trim()) return false;
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

function containsXss(value) {
  if (typeof value !== 'string') return false;

  const patterns = [
    /<script[^>]*>/i,
    /<iframe[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /vbscript:/i
  ];

  return patterns.some((pattern) => pattern.test(value));
}

function validateContactPayload(body) {
  const rawName = typeof body?.name === 'string' ? body.name : '';
  const rawEmail = typeof body?.email === 'string' ? body.email : '';
  const rawSubject = typeof body?.subject === 'string' ? body.subject : '';
  const rawMessage = typeof body?.message === 'string' ? body.message : '';

  if ([rawName, rawEmail, rawSubject, rawMessage].some((value) => containsXss(value) || hasControlChars(value))) {
    return { valid: false, error: 'Invalid input detected' };
  }

  const name = sanitizeText(rawName, 120);
  const email = sanitizeText(rawEmail, 254);
  const subject = sanitizeText(rawSubject, 200);
  const message = sanitizeText(rawMessage, 5000);

  if (!name || !email || !subject || !message) {
    return { valid: false, error: 'All fields are required' };
  }

  if (!isValidEmail(email)) {
    return { valid: false, error: 'Invalid email address' };
  }

  return { valid: true, data: { name, email, subject, message } };
}

function isPublicApiRoute(method, path) {
  if (PUBLIC_AUTH_PATHS.has(path)) return true;
  if (path === '/api/auth/me' || path.startsWith('/api/auth/')) return false;
  if (method === 'POST' && path === '/api/contact') return true;
  if (method === 'GET' && path !== '/api/contact') return true;
  return false;
}

function parseCookies(header) {
  const cookies = {};
  String(header || '').split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  });
  return cookies;
}

function sessionCookieName() {
  return isProduction ? '__Host-bp_session' : 'bp_session';
}

function buildSessionCookie(token, ttlMs, { clear = false } = {}) {
  const parts = [
    `${sessionCookieName()}=${clear ? '' : encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `SameSite=${isProduction ? 'Strict' : 'Lax'}`,
    `Max-Age=${clear ? 0 : Math.max(0, Math.floor(ttlMs / 1000))}`
  ];
  if (isProduction) parts.push('Secure');
  return parts.join('; ');
}

function readSessionToken(req) {
  const header = req.headers?.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  const cookies = parseCookies(req.headers?.cookie);
  return cookies[sessionCookieName()] || '';
}

function jsonBodyLimit(req) {
  return req.path?.startsWith('/api/cv/') ? '6mb' : '100kb';
}

function requestSelfOrigin(req) {
  const host = String(req?.headers?.['x-forwarded-host'] || req?.headers?.host || '')
    .split(',')[0]
    .trim();
  if (!host) return '';
  const proto = String(req?.headers?.['x-forwarded-proto'] || (isProduction ? 'https' : 'http'))
    .split(',')[0]
    .trim();
  return normalizeOrigin(`${proto}://${host}`);
}

function trustedOrigin(req) {
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) return true;
  if (!req.path?.startsWith('/api/')) return true;

  const origin = req.headers.origin;
  if (!origin) {
    return Boolean(req.headers.authorization) || !isProduction;
  }
  if (isAllowedOrigin(origin)) return true;
  const self = requestSelfOrigin(req);
  return Boolean(self) && normalizeOrigin(origin) === self;
}

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_PDF_BYTES = 20 * 1024 * 1024;
const MAX_LIST_ITEMS = 40;
const MAX_NESTED_ITEMS = 20;

function hasControlChars(value) {
  return typeof value === 'string' && CONTROL_CHARS.test(value);
}

function fail(error) {
  return { valid: false, error };
}

function ok(data) {
  return { valid: true, data };
}

function firstError(...results) {
  return results.find((result) => result?.error);
}

function takeId(value) {
  if (value == null || value === '') {
    return { value: crypto.randomUUID() };
  }
  if (!isValidId(value)) return { error: 'Invalid id' };
  return { value };
}

function takeText(value, maxLength, { required = false } = {}) {
  if (value == null || value === '') {
    return required ? { error: 'Required field missing' } : { value: '' };
  }
  if (typeof value !== 'string' && typeof value !== 'number') {
    return { error: 'Invalid text' };
  }
  const text = String(value);
  if (hasControlChars(text)) return { error: 'Invalid text' };
  const trimmed = text.trim().slice(0, maxLength);
  if (required && !trimmed) return { error: 'Required field missing' };
  return { value: trimmed };
}

function takeBool(value) {
  return { value: Boolean(value) };
}

function takeNumber(value, { min, max, optional = true, integer = false } = {}) {
  if (value == null || value === '') {
    return optional ? { value: null } : { error: 'Invalid number' };
  }
  const parsed = integer ? Number.parseInt(String(value), 10) : Number(value);
  if (!Number.isFinite(parsed)) return { error: 'Invalid number' };
  if (min != null && parsed < min) return { error: 'Invalid number' };
  if (max != null && parsed > max) return { error: 'Invalid number' };
  return { value: parsed };
}

function takeDate(value) {
  if (value == null || value === '') return { value: null };
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return { error: 'Invalid date' };
  return { value: parsed.toISOString().slice(0, 10) };
}

function isSafeHttpUrl(value, { allowMailto = false, optional = true } = {}) {
  if (value == null || value === '') return optional;
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return optional;
  if (trimmed.startsWith('//') || trimmed.includes('\\')) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return !/[\s<>]/.test(trimmed) && !trimmed.includes('://');
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:') return true;
    if (allowMailto && parsed.protocol === 'mailto:') return true;
    return false;
  } catch {
    return false;
  }
}

function dataUrlPayloadBytes(value) {
  const comma = value.indexOf(',');
  if (comma === -1) return value.length;
  return Math.floor((value.length - comma - 1) * 0.75);
}

function isSafeAssetUrl(value, { allowPdf = false, maxBytes = MAX_IMAGE_BYTES, optional = true } = {}) {
  if (value == null || value === '') return optional;
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return optional;
  if (trimmed.startsWith('data:')) {
    const allowed = allowPdf
      ? /^data:(image\/[a-z0-9.+-]+|application\/pdf)(;base64)?,/i
      : /^data:image\/[a-z0-9.+-]+(;base64)?,/i;
    if (!allowed.test(trimmed)) return false;
    return dataUrlPayloadBytes(trimmed) <= maxBytes;
  }
  return isSafeHttpUrl(trimmed, { optional: false });
}

function takeUrl(value, options = {}) {
  if (value == null || value === '') return { value: '' };
  if (!isSafeHttpUrl(value, { ...options, optional: false })) return { error: 'Invalid URL' };
  return { value: String(value).trim() };
}

function takeAssetUrl(value, options = {}) {
  if (value == null || value === '') return { value: '' };
  if (!isSafeAssetUrl(value, { ...options, optional: false })) return { error: 'Invalid URL' };
  return { value: String(value).trim() };
}

function takeStringArray(value, { maxItems = MAX_LIST_ITEMS, maxLength = 100 } = {}) {
  if (value == null) return { value: [] };
  if (!Array.isArray(value)) return { error: 'Invalid list' };
  const items = [];
  for (const item of value.slice(0, maxItems)) {
    const text = takeText(item, maxLength);
    if (text.error) return text;
    if (text.value) items.push(text.value);
  }
  return { value: items };
}

function takeOptionalList(value, mapper) {
  if (value === undefined) return { value: undefined };
  if (!Array.isArray(value)) return { error: 'Invalid list' };
  return mapper(value);
}

function validateAboutValues(values) {
  const items = [];
  for (const entry of values.slice(0, MAX_NESTED_ITEMS)) {
    const id = takeId(entry?.id);
    const title = takeText(entry?.title, 255, { required: true });
    const description = takeText(entry?.description, 2000);
    const icon = takeText(entry?.icon, 50);
    const color = takeText(entry?.color, 50);
    const err = firstError(id, title, description, icon, color);
    if (err) return err;
    items.push({
      id: id.value,
      title: title.value,
      description: description.value,
      icon: icon.value,
      color: color.value
    });
  }
  return { value: items };
}

function validateAboutExperience(experience) {
  const items = [];
  for (const entry of experience.slice(0, MAX_NESTED_ITEMS)) {
    const id = takeId(entry?.id);
    const year = takeText(entry?.year, 20);
    const title = takeText(entry?.title, 255, { required: true });
    const company = takeText(entry?.company, 255);
    const description = takeText(entry?.description, 4000);
    const technologies = takeStringArray(entry?.technologies);
    const err = firstError(id, year, title, company, description, technologies);
    if (err) return err;
    items.push({
      id: id.value,
      year: year.value,
      title: title.value,
      company: company.value,
      description: description.value,
      technologies: technologies.value
    });
  }
  return { value: items };
}

function validateAboutPayload(body) {
  const id = takeId(body?.id);
  const name = takeText(body?.name, 255, { required: true });
  const title = takeText(body?.title, 255);
  const bio = takeText(body?.bio, 4000);
  const location = takeText(body?.location, 255);
  const email = takeText(body?.email, 254);
  const phone = takeText(body?.phone, 50);
  const tagline = takeText(body?.tagline, 255);
  const availability = takeText(body?.availability, 50);
  const avatar = takeAssetUrl(body?.avatar);
  const resumeUrl = takeUrl(body?.resumeUrl);
  const linkedinUrl = takeUrl(body?.linkedinUrl);
  const githubUrl = takeUrl(body?.githubUrl);
  const websiteUrl = takeUrl(body?.websiteUrl);
  const values = takeOptionalList(body?.values, validateAboutValues);
  const experience = takeOptionalList(body?.experience, validateAboutExperience);
  const err = firstError(
    id, name, title, bio, location, email, phone, tagline, availability,
    avatar, resumeUrl, linkedinUrl, githubUrl, websiteUrl, values, experience
  );
  if (err) return fail(err.error);
  return ok({
    id: id.value,
    name: name.value,
    title: title.value,
    bio: bio.value,
    location: location.value,
    email: email.value,
    phone: phone.value,
    tagline: tagline.value,
    availability: availability.value,
    avatar: avatar.value,
    resumeUrl: resumeUrl.value,
    linkedinUrl: linkedinUrl.value,
    githubUrl: githubUrl.value,
    websiteUrl: websiteUrl.value,
    values: values.value,
    experience: experience.value
  });
}

function validateSkillPayload(body) {
  const id = takeId(body?.id);
  const name = takeText(body?.name, 255, { required: true });
  const category = takeText(body?.category, 100, { required: true });
  const proficiency = takeNumber(body?.proficiency, { min: 1, max: 100, optional: false, integer: true });
  const yearsOfExperience = takeNumber(body?.yearsOfExperience, { min: 0, max: 40, optional: true, integer: true });
  const certifications = takeStringArray(body?.certifications);
  const projects = takeNumber(body?.projects, { min: 0, max: 500, optional: true, integer: true });
  const err = firstError(id, name, category, proficiency, yearsOfExperience, certifications, projects);
  if (err) return fail(err.error);
  return ok({
    id: id.value,
    name: name.value,
    category: category.value,
    proficiency: proficiency.value,
    yearsOfExperience: yearsOfExperience.value ?? 0,
    certifications: certifications.value,
    projects: projects.value ?? 0
  });
}

function validateProjectPayload(body) {
  const id = takeId(body?.id);
  const title = takeText(body?.title, 255, { required: true });
  const description = takeText(body?.description, 5000, { required: true });
  const technologies = takeStringArray(body?.technologies);
  const githubUrl = takeUrl(body?.githubUrl);
  const liveUrl = takeUrl(body?.liveUrl);
  const imageUrl = takeAssetUrl(body?.imageUrl);
  const featured = takeBool(body?.featured);
  const category = takeText(body?.category, 100, { required: true });
  const status = takeText(body?.status, 20);
  const err = firstError(id, title, description, technologies, githubUrl, liveUrl, imageUrl, category, status);
  if (err) return fail(err.error);
  return ok({
    id: id.value,
    title: title.value,
    description: description.value,
    technologies: technologies.value,
    githubUrl: githubUrl.value,
    liveUrl: liveUrl.value,
    imageUrl: imageUrl.value,
    featured: featured.value,
    category: category.value,
    status: status.value || 'active'
  });
}

function validateServicePayload(body) {
  const id = takeId(body?.id);
  const title = takeText(body?.title, 255, { required: true });
  const slug = takeText(body?.slug, 255, { required: true });
  const description = takeText(body?.description, 5000, { required: true });
  const icon = takeText(body?.icon, 50);
  const category = takeText(body?.category, 100, { required: true });
  const features = takeStringArray(body?.features);
  const deliverables = takeStringArray(body?.deliverables);
  const duration = takeText(body?.duration, 100);
  const price = takeNumber(body?.price, { min: 0, max: 1000000 });
  const originalPrice = takeNumber(body?.originalPrice, { min: 0, max: 1000000 });
  const popular = takeBool(body?.popular);
  const badge = takeText(body?.badge, 100);
  const ctaLabel = takeText(body?.ctaLabel, 100);
  const ctaUrl = takeUrl(body?.ctaUrl);
  const featured = takeBool(body?.featured);
  const status = takeText(body?.status, 20);
  const sortOrder = takeNumber(body?.sortOrder, { min: 0, max: 10000, optional: true, integer: true });
  const err = firstError(
    id, title, slug, description, icon, category, features, deliverables,
    duration, price, originalPrice, badge, ctaLabel, ctaUrl, status, sortOrder
  );
  if (err) return fail(err.error);
  return ok({
    id: id.value,
    title: title.value,
    slug: slug.value,
    description: description.value,
    icon: icon.value || 'web',
    category: category.value,
    features: features.value,
    deliverables: deliverables.value,
    duration: duration.value || null,
    price: price.value,
    originalPrice: originalPrice.value,
    popular: popular.value,
    badge: badge.value || null,
    ctaLabel: ctaLabel.value || 'Get Started',
    ctaUrl: ctaUrl.value || null,
    featured: featured.value,
    status: status.value || 'active',
    sortOrder: sortOrder.value ?? 0
  });
}

function validateWorkExperiencePayload(body) {
  const id = takeId(body?.id);
  const company = takeText(body?.company, 255, { required: true });
  const position = takeText(body?.position, 255, { required: true });
  const startDate = takeDate(body?.startDate);
  const endDate = takeDate(body?.endDate);
  const current = takeBool(body?.current);
  const description = takeText(body?.description, 4000);
  const achievements = takeStringArray(body?.achievements, { maxLength: 500 });
  const technologies = takeStringArray(body?.technologies);
  const companyLogo = takeAssetUrl(body?.companyLogo);
  const location = takeText(body?.location, 255);
  const employmentType = takeText(body?.employmentType, 100);
  const err = firstError(
    id, company, position, startDate, endDate, description,
    achievements, technologies, companyLogo, location, employmentType
  );
  if (err) return fail(err.error);
  return ok({
    id: id.value,
    company: company.value,
    position: position.value,
    startDate: startDate.value,
    endDate: current.value ? null : endDate.value,
    current: current.value,
    description: description.value,
    achievements: achievements.value,
    technologies: technologies.value,
    companyLogo: companyLogo.value,
    location: location.value,
    employmentType: employmentType.value
  });
}

function validateEducationPayload(body) {
  const id = takeId(body?.id);
  const institution = takeText(body?.institution, 255, { required: true });
  const degree = takeText(body?.degree, 255, { required: true });
  const field = takeText(body?.field, 255);
  const startDate = takeDate(body?.startDate);
  const endDate = takeDate(body?.endDate);
  const current = takeBool(body?.current);
  const gpa = takeNumber(body?.gpa, { min: 0, max: 5 });
  const honors = takeStringArray(body?.honors);
  const description = takeText(body?.description, 4000);
  const institutionLogo = takeAssetUrl(body?.institutionLogo);
  const location = takeText(body?.location, 255);
  const err = firstError(
    id, institution, degree, field, startDate, endDate, gpa,
    honors, description, institutionLogo, location
  );
  if (err) return fail(err.error);
  return ok({
    id: id.value,
    institution: institution.value,
    degree: degree.value,
    field: field.value,
    startDate: startDate.value,
    endDate: current.value ? null : endDate.value,
    current: current.value,
    gpa: gpa.value,
    honors: honors.value,
    description: description.value,
    institutionLogo: institutionLogo.value,
    location: location.value
  });
}

function validateCertificatePayload(body) {
  const id = takeId(body?.id);
  const title = takeText(body?.title, 255, { required: true });
  const issuer = takeText(body?.issuer, 255, { required: true });
  const issueDate = takeDate(body?.issueDate);
  const expiryDate = takeDate(body?.expiryDate);
  const category = takeText(body?.category, 100);
  const pdfUrl = takeAssetUrl(body?.pdfUrl, { allowPdf: true, maxBytes: MAX_PDF_BYTES });
  const thumbnailUrl = takeAssetUrl(body?.thumbnailUrl);
  const verificationBadge = takeBool(body?.verificationBadge);
  const issuerVerification = takeUrl(body?.issuerVerification);
  const credentialId = takeText(body?.credentialId, 255);
  const err = firstError(
    id, title, issuer, issueDate, expiryDate, category,
    pdfUrl, thumbnailUrl, issuerVerification, credentialId
  );
  if (err) return fail(err.error);
  return ok({
    id: id.value,
    title: title.value,
    issuer: issuer.value,
    issueDate: issueDate.value,
    expiryDate: expiryDate.value,
    category: category.value,
    pdfUrl: pdfUrl.value,
    thumbnailUrl: thumbnailUrl.value,
    verificationBadge: verificationBadge.value,
    issuerVerification: issuerVerification.value,
    credentialId: credentialId.value
  });
}

function validateTestimonialPayload(body) {
  const id = takeId(body?.id);
  const author = takeText(body?.author, 255, { required: true });
  const position = takeText(body?.position, 255);
  const company = takeText(body?.company, 255);
  const content = takeText(body?.content, 5000, { required: true });
  const avatar = takeAssetUrl(body?.avatar);
  const rating = takeNumber(body?.rating, { min: 1, max: 5, optional: true, integer: true });
  const date = takeDate(body?.date);
  const featured = takeBool(body?.featured);
  const verified = takeBool(body?.verified);
  const companyLogo = takeAssetUrl(body?.companyLogo);
  const linkedinUrl = takeUrl(body?.linkedinUrl);
  const project = takeText(body?.project, 255);
  const skills = takeStringArray(body?.skills);
  const err = firstError(
    id, author, position, company, content, avatar, rating, date,
    companyLogo, linkedinUrl, project, skills
  );
  if (err) return fail(err.error);
  return ok({
    id: id.value,
    author: author.value,
    position: position.value,
    company: company.value,
    content: content.value,
    avatar: avatar.value,
    rating: rating.value ?? 5,
    date: date.value,
    featured: featured.value,
    verified: verified.value,
    companyLogo: companyLogo.value,
    linkedinUrl: linkedinUrl.value,
    project: project.value,
    skills: skills.value
  });
}

function validateRecommendationPayload(body) {
  const id = takeId(body?.id);
  const author = takeText(body?.author, 255, { required: true });
  const position = takeText(body?.position, 255);
  const company = takeText(body?.company, 255);
  const content = takeText(body?.content, 5000, { required: true });
  const date = takeDate(body?.date);
  const avatar = takeAssetUrl(body?.avatar);
  const linkedinUrl = takeUrl(body?.linkedinUrl);
  const verified = takeBool(body?.verified);
  const companyLogo = takeAssetUrl(body?.companyLogo);
  const skills = takeStringArray(body?.skills);
  const err = firstError(
    id, author, position, company, content, date, avatar, linkedinUrl, companyLogo, skills
  );
  if (err) return fail(err.error);
  return ok({
    id: id.value,
    author: author.value,
    position: position.value,
    company: company.value,
    content: content.value,
    date: date.value,
    avatar: avatar.value,
    linkedinUrl: linkedinUrl.value,
    verified: verified.value,
    companyLogo: companyLogo.value,
    skills: skills.value
  });
}

function validateBlogPostPayload(body) {
  const id = takeId(body?.id);
  const title = takeText(body?.title, 255, { required: true });
  const content = takeText(body?.content, 50000);
  const excerpt = takeText(body?.excerpt, 2000);
  const author = takeText(body?.author, 255);
  const publishDate = takeDate(body?.publishDate);
  const tags = takeStringArray(body?.tags, { maxItems: 20 });
  const category = takeText(body?.category, 100);
  const readTime = takeNumber(body?.readTime, { min: 1, max: 120, optional: true, integer: true });
  const featured = takeBool(body?.featured);
  const status = takeText(body?.status, 20);
  const imageUrl = takeAssetUrl(body?.imageUrl);
  const err = firstError(
    id, title, content, excerpt, author, publishDate, tags, category, readTime, status, imageUrl
  );
  if (err) return fail(err.error);
  return ok({
    id: id.value,
    title: title.value,
    content: content.value,
    excerpt: excerpt.value,
    author: author.value,
    publishDate: publishDate.value,
    tags: tags.value,
    category: category.value,
    readTime: readTime.value ?? 5,
    featured: featured.value,
    status: status.value || 'published',
    imageUrl: imageUrl.value
  });
}

module.exports = {
  isProduction,
  assertProductionSecrets,
  getAdminEmail,
  getAllowedOrigins,
  isAllowedOrigin,
  corsOriginDelegate,
  verifyAdminPassword,
  verifyLoginCredentials,
  validateAdminPasswordStrength,
  MIN_ADMIN_PASSWORD_LENGTH,
  sanitizeText,
  isValidEmail,
  isValidId,
  containsXss,
  validateContactPayload,
  isPublicApiRoute,
  parseCookies,
  sessionCookieName,
  buildSessionCookie,
  readSessionToken,
  jsonBodyLimit,
  trustedOrigin,
  isSafeHttpUrl,
  isSafeAssetUrl,
  validateAboutPayload,
  validateSkillPayload,
  validateProjectPayload,
  validateServicePayload,
  validateWorkExperiencePayload,
  validateEducationPayload,
  validateCertificatePayload,
  validateTestimonialPayload,
  validateRecommendationPayload,
  validateBlogPostPayload
};
