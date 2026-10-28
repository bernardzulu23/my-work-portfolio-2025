require('./load-env');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const {
  isProduction,
  assertProductionSecrets,
  getAdminEmail,
  getAllowedOrigins,
  corsOriginDelegate,
  isValidId,
  validateContactPayload,
  isPublicApiRoute,
  buildSessionCookie,
  readSessionToken,
  jsonBodyLimit,
  trustedOrigin,
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
} = require('./security');
const mfa = require('./mfa');
const adminAccount = require('./admin-account');
const cv = require('./cv');
const contactMail = require('./contact-mail');
const storage = require('./storage');
const realtime = require('./realtime');

let bootError = null;
try {
  assertProductionSecrets();
} catch (err) {
  bootError = err;
  console.error('Server boot configuration error:', err.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_EMAIL = getAdminEmail();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';
const allowedOrigins = getAllowedOrigins();

app.disable('x-powered-by');
// Vercel sits behind a proxy and sets X-Forwarded-For. Without this,
// express-rate-limit throws and every /api request returns FUNCTION_INVOCATION_FAILED.
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: isProduction ? 'same-origin' : 'cross-origin' },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false
}));

app.use(cors({
  origin: corsOriginDelegate,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600
}));

app.use((req, res, next) => {
  express.json({ limit: jsonBodyLimit(req) })(req, res, next);
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, private');
    res.setHeader('Pragma', 'no-cache');
  }
  next();
});

app.use((req, res, next) => {
  if (bootError) {
    return res.status(503).json({ success: false, error: 'Server is misconfigured' });
  }
  next();
});

app.use((req, res, next) => {
  if (trustedOrigin(req)) return next();
  return res.status(403).json({ error: 'Forbidden' });
});

const limiterBase = {
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
};

const loginLimiter = rateLimit({
  ...limiterBase,
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many login attempts. Try again later.' }
});

const contactLimiter = rateLimit({
  ...limiterBase,
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many messages sent. Please try again later.' }
});

const writeLimiter = rateLimit({
  ...limiterBase,
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: { error: 'Too many requests. Please slow down.' }
});

const mfaLimiter = rateLimit({
  ...limiterBase,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many verification attempts. Try again later.' }
});

const cvLimiter = rateLimit({
  ...limiterBase,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many CV import requests. Try again later.' }
});

const publicGetLimiter = rateLimit({
  ...limiterBase,
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests. Please slow down.' }
});

const snakeToCamel = (str) => {
  if (str === 'read_status') return 'read_status';
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const keysToCamel = (value) => {
  if (Array.isArray(value)) return value.map(keysToCamel);
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [snakeToCamel(key), keysToCamel(nested)])
    );
  }
  return value;
};

mfa.setJwtSecret(JWT_SECRET);

const adminUserPayload = (mfaStatus, setupFlags = {}) => ({
  id: 'admin-1',
  email: ADMIN_EMAIL,
  role: 'admin',
  created_at: new Date().toISOString(),
  mustChangePassword: Boolean(setupFlags.mustChangePassword),
  setupRequired: Boolean(setupFlags.setupRequired),
  mfa: mfaStatus
    ? {
        enrolled: mfaStatus.enrolled,
        totpEnabled: mfaStatus.totpEnabled,
        passkeyCount: mfaStatus.passkeyCount
      }
    : undefined
});

const loadSetupFlags = async () => {
  const [account, state] = await Promise.all([
    adminAccount.getAccount(db, ADMIN_EMAIL),
    mfa.getMfaState(db, ADMIN_EMAIL)
  ]);
  return {
    state,
    status: mfa.toPublicMfaStatus(state),
    flags: adminAccount.setupFrom(account, state)
  };
};

const completeLogin = async (res) => {
  let status;
  let flags = { mustChangePassword: true, setupRequired: true };
  try {
    const loaded = await loadSetupFlags();
    status = loaded.status;
    flags = loaded.flags;
  } catch (err) {
    console.warn('Setup flags unavailable during login:', err.message);
  }
  const token = mfa.signSessionToken(ADMIN_EMAIL);
  res.setHeader('Set-Cookie', buildSessionCookie(token, mfa.SESSION_TTL_MS));
  return res.json({
    success: true,
    user: adminUserPayload(status, flags)
  });
};

const ensureSchema = async () => {
  const createStatements = [
    `CREATE TABLE IF NOT EXISTS about (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      bio TEXT NOT NULL,
      location VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      avatar TEXT,
      resume_url TEXT,
      linkedin_url TEXT,
      github_url TEXT,
      website_url TEXT,
      tagline VARCHAR(255) NOT NULL,
      availability VARCHAR(50) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS about_values (
      id VARCHAR(36) PRIMARY KEY,
      about_id VARCHAR(36) REFERENCES about(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(50) NOT NULL,
      color VARCHAR(50)
    )`,
    `CREATE TABLE IF NOT EXISTS about_experience (
      id VARCHAR(36) PRIMARY KEY,
      about_id VARCHAR(36) REFERENCES about(id) ON DELETE CASCADE,
      year VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      technologies JSONB
    )`,
    `CREATE TABLE IF NOT EXISTS blog_posts (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      author VARCHAR(255) NOT NULL,
      publish_date TIMESTAMP NOT NULL,
      tags JSONB,
      category VARCHAR(100) NOT NULL,
      read_time INT NOT NULL,
      featured BOOLEAN DEFAULT FALSE,
      status VARCHAR(20) NOT NULL,
      image_url TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS skills (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      proficiency INT NOT NULL,
      years_of_experience INT NOT NULL,
      certifications JSONB,
      projects INT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS work_experience (
      id VARCHAR(36) PRIMARY KEY,
      company VARCHAR(255) NOT NULL,
      position VARCHAR(255) NOT NULL,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP,
      current BOOLEAN DEFAULT FALSE,
      description TEXT NOT NULL,
      achievements JSONB,
      technologies JSONB,
      company_logo TEXT,
      location VARCHAR(255) NOT NULL,
      employment_type VARCHAR(100) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS education (
      id VARCHAR(36) PRIMARY KEY,
      institution VARCHAR(255) NOT NULL,
      degree VARCHAR(255) NOT NULL,
      field VARCHAR(255) NOT NULL,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP,
      current BOOLEAN DEFAULT FALSE,
      gpa DECIMAL(3, 2),
      honors JSONB,
      description TEXT NOT NULL,
      institution_logo TEXT,
      location VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      technologies JSONB,
      github_url TEXT,
      live_url TEXT,
      image_url TEXT,
      featured BOOLEAN DEFAULT FALSE,
      category VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS certificates (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      issuer VARCHAR(255) NOT NULL,
      issue_date TIMESTAMP NOT NULL,
      expiry_date TIMESTAMP,
      category VARCHAR(100) NOT NULL,
      pdf_url TEXT,
      thumbnail_url TEXT,
      verification_badge BOOLEAN DEFAULT FALSE,
      issuer_verification TEXT,
      credential_id VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS testimonials (
      id VARCHAR(36) PRIMARY KEY,
      author VARCHAR(255) NOT NULL,
      position VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      avatar TEXT,
      rating INT NOT NULL,
      date TIMESTAMP NOT NULL,
      featured BOOLEAN DEFAULT FALSE,
      verified BOOLEAN DEFAULT FALSE,
      company_logo TEXT,
      linkedin_url TEXT,
      project VARCHAR(255),
      skills JSONB
    )`,
    `CREATE TABLE IF NOT EXISTS recommendations (
      id VARCHAR(36) PRIMARY KEY,
      author VARCHAR(255) NOT NULL,
      position VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      date TIMESTAMP NOT NULL,
      avatar TEXT,
      linkedin_url TEXT,
      company_logo TEXT,
      skills JSONB,
      verified BOOLEAN DEFAULT FALSE
    )`,
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      read_status BOOLEAN DEFAULT FALSE
    )`,
    `CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(50) NOT NULL DEFAULT 'web',
      category VARCHAR(100) NOT NULL,
      features JSONB,
      deliverables JSONB,
      duration VARCHAR(100),
      price NUMERIC,
      original_price NUMERIC,
      popular BOOLEAN DEFAULT FALSE,
      badge VARCHAR(100),
      cta_label VARCHAR(100) DEFAULT 'Get Started',
      cta_url TEXT,
      featured BOOLEAN DEFAULT FALSE,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      sort_order INT NOT NULL DEFAULT 0
    )`
  ];

  for (const statement of createStatements) {
    await db.query(statement);
  }

  await mfa.ensureMfaSchema(db);
  await adminAccount.seedAdminAccount(db);

  const alterStatements = [
    'ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS company_logo TEXT',
    'ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS linkedin_url TEXT',
    'ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS project VARCHAR(255)',
    'ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS skills JSONB',
    'ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS company_logo TEXT',
    'ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS skills JSONB',
    'ALTER TABLE about ALTER COLUMN avatar TYPE TEXT',
    'ALTER TABLE about ALTER COLUMN resume_url TYPE TEXT',
    'ALTER TABLE about ALTER COLUMN linkedin_url TYPE TEXT',
    'ALTER TABLE about ALTER COLUMN github_url TYPE TEXT',
    'ALTER TABLE about ALTER COLUMN website_url TYPE TEXT',
    'ALTER TABLE blog_posts ALTER COLUMN image_url TYPE TEXT',
    'ALTER TABLE work_experience ALTER COLUMN company_logo TYPE TEXT',
    'ALTER TABLE education ALTER COLUMN institution_logo TYPE TEXT',
    'ALTER TABLE projects ALTER COLUMN github_url TYPE TEXT',
    'ALTER TABLE projects ALTER COLUMN live_url TYPE TEXT',
    'ALTER TABLE projects ALTER COLUMN image_url TYPE TEXT',
    'ALTER TABLE certificates ALTER COLUMN pdf_url TYPE TEXT',
    'ALTER TABLE certificates ALTER COLUMN thumbnail_url TYPE TEXT',
    'ALTER TABLE certificates ALTER COLUMN issuer_verification TYPE TEXT',
    'ALTER TABLE testimonials ALTER COLUMN avatar TYPE TEXT',
    'ALTER TABLE testimonials ALTER COLUMN company_logo TYPE TEXT',
    'ALTER TABLE testimonials ALTER COLUMN linkedin_url TYPE TEXT',
    'ALTER TABLE recommendations ALTER COLUMN avatar TYPE TEXT',
    'ALTER TABLE recommendations ALTER COLUMN linkedin_url TYPE TEXT',
    'ALTER TABLE recommendations ALTER COLUMN company_logo TYPE TEXT',
    'ALTER TABLE services ALTER COLUMN cta_url TYPE TEXT'
  ];

  for (const statement of alterStatements) {
    try {
      await db.query(statement);
    } catch (err) {
      if (err.code !== '42701' && err.code !== '42703') {
        console.warn('Schema migration warning:', err.message);
      }
    }
  }
};

ensureSchema().catch((err) => console.error('Schema setup failed:', err));

app.param('id', (req, res, next, id) => {
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
});

const requireAdmin = async (req, res, next) => {
  const token = readSessionToken(req);
  const session = mfa.verifySessionToken(token);
  if (!session || session.email !== ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { flags } = await loadSetupFlags();
    req.admin = { ...session, ...flags };
    if (flags.setupRequired && !adminAccount.isSetupAllowedPath(req.path)) {
      return res.status(403).json({
        error: 'Complete password and security setup first',
        setupRequired: true
      });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unauthorized' });
  }
};

const rejectInvalid = (res, parsed) => {
  if (parsed.valid) return false;
  const message = typeof parsed.error === 'string' && parsed.error.trim()
    ? parsed.error
    : 'Invalid input';
  res.status(400).json({ error: message });
  return true;
};

const sendPasskeyError = (res, err, fallback, fallbackStatus = 500) => {
  console.error(err);
  if (err?.status === 503) {
    return res.status(503).json({ success: false, error: 'Passkeys are not available' });
  }
  return res.status(fallbackStatus).json({ success: false, error: fallback });
};

app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) return next();
  if (isPublicApiRoute(req.method, req.path)) return next();
  return requireAdmin(req, res, next);
});

app.use('/api', (req, res, next) => {
  if (req.method === 'GET' && isPublicApiRoute(req.method, req.path)) {
    return publicGetLimiter(req, res, next);
  }
  if (['POST', 'PUT', 'DELETE'].includes(req.method) && !isPublicApiRoute(req.method, req.path)) {
    return writeLimiter(req, res, next);
  }
  next();
});

const parseJsonFields = (rows, fields) => {
  return rows.map((row) => {
    const newRow = { ...row };
    fields.forEach((field) => {
      if (newRow[field] && typeof newRow[field] === 'string') {
        try {
          newRow[field] = JSON.parse(newRow[field]);
        } catch (e) {
          console.error(`Error parsing JSON for field ${field}:`, e);
          newRow[field] = [];
        }
      }
    });
    return keysToCamel(newRow);
  });
};

// --- About ---

app.get('/api/about', async (req, res) => {
  try {
    const [aboutRows] = await db.query('SELECT * FROM about LIMIT 1');
    if (aboutRows.length === 0) return res.json({});

    const about = keysToCamel(aboutRows[0]);

    const [values] = await db.query('SELECT * FROM about_values WHERE about_id = ?', [about.id]);
    about.values = keysToCamel(values);

    const [experience] = await db.query('SELECT * FROM about_experience WHERE about_id = ?', [about.id]);
    about.experience = parseJsonFields(experience, ['technologies']);

    res.json(about);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/about', async (req, res) => {
  const parsed = validateAboutPayload(req.body);
  if (rejectInvalid(res, parsed)) return;
  const {
    id, name, title, bio, location, email, phone, tagline, availability,
    avatar, resumeUrl, linkedinUrl, githubUrl, websiteUrl, values, experience
  } = parsed.data;

  try {
    await db.query(
      `INSERT INTO about (id, name, title, bio, location, email, phone, tagline, availability, avatar, resume_url, linkedin_url, github_url, website_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, title, bio, location, email, phone, tagline, availability, avatar, resumeUrl, linkedinUrl, githubUrl, websiteUrl]
    );

    if (values?.length) {
      const valuesRows = values.map((v) => [v.id, id, v.title, v.description, v.icon, v.color]);
      await db.query('INSERT INTO about_values (id, about_id, title, description, icon, color) VALUES ?', [valuesRows]);
    }

    if (experience?.length) {
      const expRows = experience.map((e) => [e.id, id, e.year, e.title, e.company, e.description, JSON.stringify(e.technologies || [])]);
      await db.query('INSERT INTO about_experience (id, about_id, year, title, company, description, technologies) VALUES ?', [expRows]);
    }

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/about/:id', async (req, res) => {
  const parsed = validateAboutPayload({ ...req.body, id: req.params.id });
  if (rejectInvalid(res, parsed)) return;
  const {
    id, name, title, bio, location, email, phone, tagline, availability,
    avatar, resumeUrl, linkedinUrl, githubUrl, websiteUrl, values, experience
  } = parsed.data;

  try {
    await db.query(
      `UPDATE about SET name=?, title=?, bio=?, location=?, email=?, phone=?, tagline=?, availability=?, avatar=?, resume_url=?, linkedin_url=?, github_url=?, website_url=? WHERE id=?`,
      [name, title, bio, location, email, phone, tagline, availability, avatar, resumeUrl, linkedinUrl, githubUrl, websiteUrl, id]
    );

    if (values) {
      await db.query('DELETE FROM about_values WHERE about_id = ?', [id]);
      if (values.length > 0) {
        const valuesValues = values.map((v) => [v.id, id, v.title, v.description, v.icon, v.color]);
        await db.query('INSERT INTO about_values (id, about_id, title, description, icon, color) VALUES ?', [valuesValues]);
      }
    }

    if (experience) {
      await db.query('DELETE FROM about_experience WHERE about_id = ?', [id]);
      if (experience.length > 0) {
        const expValues = experience.map((e) => [e.id, id, e.year, e.title, e.company, e.description, JSON.stringify(e.technologies || [])]);
        await db.query('INSERT INTO about_experience (id, about_id, year, title, company, description, technologies) VALUES ?', [expValues]);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Skills ---

app.get('/api/skills', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM skills');
    res.json(parseJsonFields(rows, ['certifications']));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/skills', async (req, res) => {
  const parsed = validateSkillPayload(req.body);
  if (rejectInvalid(res, parsed)) return;
  const { id, name, category, proficiency, yearsOfExperience, certifications, projects } = parsed.data;
  try {
    await db.query(
      'INSERT INTO skills (id, name, category, proficiency, years_of_experience, certifications, projects) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, category, proficiency, yearsOfExperience, JSON.stringify(certifications), projects]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/skills/:id', async (req, res) => {
  const parsed = validateSkillPayload({ ...req.body, id: req.params.id });
  if (rejectInvalid(res, parsed)) return;
  const { id, name, category, proficiency, yearsOfExperience, certifications, projects } = parsed.data;
  try {
    await db.query(
      'UPDATE skills SET name=?, category=?, proficiency=?, years_of_experience=?, certifications=?, projects=? WHERE id=?',
      [name, category, proficiency, yearsOfExperience, JSON.stringify(certifications), projects, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/skills/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM skills WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Projects ---

app.get('/api/projects', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects');
    res.json(parseJsonFields(rows, ['technologies']));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/projects', async (req, res) => {
  const parsed = validateProjectPayload(req.body);
  if (rejectInvalid(res, parsed)) return;
  const { id, title, description, technologies, githubUrl, liveUrl, imageUrl, featured, category, status } = parsed.data;
  try {
    await db.query(
      'INSERT INTO projects (id, title, description, technologies, github_url, live_url, image_url, featured, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, JSON.stringify(technologies), githubUrl, liveUrl, imageUrl, featured, category, status]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  const parsed = validateProjectPayload({ ...req.body, id: req.params.id });
  if (rejectInvalid(res, parsed)) return;
  const { id, title, description, technologies, githubUrl, liveUrl, imageUrl, featured, category, status } = parsed.data;
  try {
    await db.query(
      'UPDATE projects SET title=?, description=?, technologies=?, github_url=?, live_url=?, image_url=?, featured=?, category=?, status=? WHERE id=?',
      [title, description, JSON.stringify(technologies), githubUrl, liveUrl, imageUrl, featured, category, status, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM projects WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Services ---

app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services ORDER BY sort_order ASC, title ASC');
    res.json(parseJsonFields(rows, ['features', 'deliverables']));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/services', async (req, res) => {
  const parsed = validateServicePayload(req.body);
  if (rejectInvalid(res, parsed)) return;
  const {
    id, title, slug, description, icon, category, features, deliverables,
    duration, price, originalPrice, popular, badge, ctaLabel, ctaUrl, featured, status, sortOrder
  } = parsed.data;
  try {
    await db.query(
      `INSERT INTO services (
        id, title, slug, description, icon, category, features, deliverables,
        duration, price, original_price, popular, badge, cta_label, cta_url, featured, status, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, title, slug, description, icon, category,
        JSON.stringify(features), JSON.stringify(deliverables),
        duration, price, originalPrice,
        popular, badge, ctaLabel, ctaUrl,
        featured, status, sortOrder
      ]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  const parsed = validateServicePayload({ ...req.body, id: req.params.id });
  if (rejectInvalid(res, parsed)) return;
  const {
    id, title, slug, description, icon, category, features, deliverables,
    duration, price, originalPrice, popular, badge, ctaLabel, ctaUrl, featured, status, sortOrder
  } = parsed.data;
  try {
    await db.query(
      `UPDATE services SET
        title=?, slug=?, description=?, icon=?, category=?, features=?, deliverables=?,
        duration=?, price=?, original_price=?, popular=?, badge=?, cta_label=?, cta_url=?,
        featured=?, status=?, sort_order=?
      WHERE id=?`,
      [
        title, slug, description, icon, category,
        JSON.stringify(features), JSON.stringify(deliverables),
        duration, price, originalPrice,
        popular, badge, ctaLabel, ctaUrl,
        featured, status, sortOrder, id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM services WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Work Experience ---

app.get('/api/work-experience', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM work_experience');
    res.json(parseJsonFields(rows, ['achievements', 'technologies']));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/work-experience', async (req, res) => {
  const parsed = validateWorkExperiencePayload(req.body);
  if (rejectInvalid(res, parsed)) return;
  const { id, company, position, startDate, endDate, current, description, achievements, technologies, companyLogo, location, employmentType } = parsed.data;
  try {
    await db.query(
      'INSERT INTO work_experience (id, company, position, start_date, end_date, current, description, achievements, technologies, company_logo, location, employment_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, company, position, startDate, endDate, current, description, JSON.stringify(achievements), JSON.stringify(technologies), companyLogo, location, employmentType]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/work-experience/:id', async (req, res) => {
  const parsed = validateWorkExperiencePayload({ ...req.body, id: req.params.id });
  if (rejectInvalid(res, parsed)) return;
  const { id, company, position, startDate, endDate, current, description, achievements, technologies, companyLogo, location, employmentType } = parsed.data;
  try {
    await db.query(
      'UPDATE work_experience SET company=?, position=?, start_date=?, end_date=?, current=?, description=?, achievements=?, technologies=?, company_logo=?, location=?, employment_type=? WHERE id=?',
      [company, position, startDate, endDate, current, description, JSON.stringify(achievements), JSON.stringify(technologies), companyLogo, location, employmentType, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/work-experience/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM work_experience WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Education ---

app.get('/api/education', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM education');
    res.json(parseJsonFields(rows, ['honors']));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/education', async (req, res) => {
  const parsed = validateEducationPayload(req.body);
  if (rejectInvalid(res, parsed)) return;
  const { id, institution, degree, field, startDate, endDate, current, gpa, honors, description, institutionLogo, location } = parsed.data;
  try {
    await db.query(
      'INSERT INTO education (id, institution, degree, field, start_date, end_date, current, gpa, honors, description, institution_logo, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, institution, degree, field, startDate, endDate, current, gpa, JSON.stringify(honors), description, institutionLogo, location]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/education/:id', async (req, res) => {
  const parsed = validateEducationPayload({ ...req.body, id: req.params.id });
  if (rejectInvalid(res, parsed)) return;
  const { id, institution, degree, field, startDate, endDate, current, gpa, honors, description, institutionLogo, location } = parsed.data;
  try {
    await db.query(
      'UPDATE education SET institution=?, degree=?, field=?, start_date=?, end_date=?, current=?, gpa=?, honors=?, description=?, institution_logo=?, location=? WHERE id=?',
      [institution, degree, field, startDate, endDate, current, gpa, JSON.stringify(honors), description, institutionLogo, location, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/education/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM education WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Certificates ---

app.get('/api/certificates', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM certificates');
    res.json(keysToCamel(rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/certificates', async (req, res) => {
  const parsed = validateCertificatePayload(req.body);
  if (rejectInvalid(res, parsed)) return;
  const { id, title, issuer, issueDate, expiryDate, category, pdfUrl, thumbnailUrl, verificationBadge, issuerVerification, credentialId } = parsed.data;
  try {
    await db.query(
      'INSERT INTO certificates (id, title, issuer, issue_date, expiry_date, category, pdf_url, thumbnail_url, verification_badge, issuer_verification, credential_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, issuer, issueDate, expiryDate, category, pdfUrl, thumbnailUrl, verificationBadge, issuerVerification, credentialId]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/certificates/:id', async (req, res) => {
  const parsed = validateCertificatePayload({ ...req.body, id: req.params.id });
  if (rejectInvalid(res, parsed)) return;
  const { id, title, issuer, issueDate, expiryDate, category, pdfUrl, thumbnailUrl, verificationBadge, issuerVerification, credentialId } = parsed.data;
  try {
    await db.query(
      'UPDATE certificates SET title=?, issuer=?, issue_date=?, expiry_date=?, category=?, pdf_url=?, thumbnail_url=?, verification_badge=?, issuer_verification=?, credential_id=? WHERE id=?',
      [title, issuer, issueDate, expiryDate, category, pdfUrl, thumbnailUrl, verificationBadge, issuerVerification, credentialId, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/certificates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM certificates WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Testimonials ---

app.get('/api/testimonials', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM testimonials');
    res.json(parseJsonFields(rows, ['skills']));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/testimonials', async (req, res) => {
  const parsed = validateTestimonialPayload(req.body);
  if (rejectInvalid(res, parsed)) return;
  const { id, author, position, company, content, avatar, rating, date, featured, verified, companyLogo, linkedinUrl, project, skills } = parsed.data;
  try {
    await db.query(
      'INSERT INTO testimonials (id, author, position, company, content, avatar, rating, date, featured, verified, company_logo, linkedin_url, project, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, author, position, company, content, avatar, rating, date, featured, verified, companyLogo, linkedinUrl, project, JSON.stringify(skills)]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/testimonials/:id', async (req, res) => {
  const parsed = validateTestimonialPayload({ ...req.body, id: req.params.id });
  if (rejectInvalid(res, parsed)) return;
  const { id, author, position, company, content, avatar, rating, date, featured, verified, companyLogo, linkedinUrl, project, skills } = parsed.data;
  try {
    await db.query(
      'UPDATE testimonials SET author=?, position=?, company=?, content=?, avatar=?, rating=?, date=?, featured=?, verified=?, company_logo=?, linkedin_url=?, project=?, skills=? WHERE id=?',
      [author, position, company, content, avatar, rating, date, featured, verified, companyLogo, linkedinUrl, project, JSON.stringify(skills), id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/testimonials/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM testimonials WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Recommendations ---

app.get('/api/recommendations', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM recommendations');
    res.json(parseJsonFields(rows, ['skills']));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/recommendations', async (req, res) => {
  const parsed = validateRecommendationPayload(req.body);
  if (rejectInvalid(res, parsed)) return;
  const { id, author, position, company, content, date, avatar, linkedinUrl, verified, companyLogo, skills } = parsed.data;
  try {
    await db.query(
      'INSERT INTO recommendations (id, author, position, company, content, date, avatar, linkedin_url, verified, company_logo, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, author, position, company, content, date, avatar, linkedinUrl, verified, companyLogo, JSON.stringify(skills)]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/recommendations/:id', async (req, res) => {
  const parsed = validateRecommendationPayload({ ...req.body, id: req.params.id });
  if (rejectInvalid(res, parsed)) return;
  const { id, author, position, company, content, date, avatar, linkedinUrl, verified, companyLogo, skills } = parsed.data;
  try {
    await db.query(
      'UPDATE recommendations SET author=?, position=?, company=?, content=?, date=?, avatar=?, linkedin_url=?, verified=?, company_logo=?, skills=? WHERE id=?',
      [author, position, company, content, date, avatar, linkedinUrl, verified, companyLogo, JSON.stringify(skills), id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/recommendations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM recommendations WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Blog Posts ---

app.get('/api/blog-posts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM blog_posts');
    res.json(parseJsonFields(rows, ['tags']));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/blog-posts', async (req, res) => {
  const parsed = validateBlogPostPayload(req.body);
  if (rejectInvalid(res, parsed)) return;
  const { id, title, content, excerpt, author, publishDate, tags, category, readTime, featured, status, imageUrl } = parsed.data;
  try {
    await db.query(
      'INSERT INTO blog_posts (id, title, content, excerpt, author, publish_date, tags, category, read_time, featured, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, content, excerpt, author, publishDate, JSON.stringify(tags), category, readTime, featured, status, imageUrl]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/blog-posts/:id', async (req, res) => {
  const parsed = validateBlogPostPayload({ ...req.body, id: req.params.id });
  if (rejectInvalid(res, parsed)) return;
  const { id, title, content, excerpt, author, publishDate, tags, category, readTime, featured, status, imageUrl } = parsed.data;
  try {
    await db.query(
      'UPDATE blog_posts SET title=?, content=?, excerpt=?, author=?, publish_date=?, tags=?, category=?, read_time=?, featured=?, status=?, image_url=? WHERE id=?',
      [title, content, excerpt, author, publishDate, JSON.stringify(tags), category, readTime, featured, status, imageUrl, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/blog-posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM blog_posts WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Contact ---

app.post('/api/contact', contactLimiter, async (req, res) => {
  const validation = validateContactPayload(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const { name, email, subject, message } = validation.data;

  try {
    const id = crypto.randomUUID();
    await db.query(
      'INSERT INTO contact_messages (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, subject, message]
    );

    try {
      await contactMail.notifyContact(
        { id, name, email, subject, message },
        {
          getAboutEmail: async () => {
            const [aboutRows] = await db.query('SELECT email FROM about LIMIT 1');
            return aboutRows[0]?.email || '';
          }
        }
      );
    } catch {
      console.error('Contact notify failed');
    }

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/contact', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(keysToCamel(rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/contact/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  try {
    await db.query('DELETE FROM contact_messages WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Auth ---

const issuerName = process.env.WEBAUTHN_RP_NAME || 'BluePeack Technologies';

app.get('/api/auth/me', requireAdmin, async (req, res) => {
  try {
    const { status, flags } = await loadSetupFlags();
    res.json({
      success: true,
      user: adminUserPayload(status, flags)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, user: null });
  }
});

app.post('/api/auth/password', requireAdmin, async (req, res) => {
  const result = await adminAccount.changePassword(
    db,
    ADMIN_EMAIL,
    req.body?.currentPassword,
    req.body?.newPassword
  );
  if (!result.ok) {
    return res.status(result.status).json({ success: false, error: result.error });
  }
  return completeLogin(res);
});

app.post('/api/auth/passkey/skip', requireAdmin, async (req, res) => {
  try {
    await adminAccount.setSkipPasskey(db, ADMIN_EMAIL);
    return completeLogin(res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to skip passkey setup' });
  }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const credentialsValid = await adminAccount.verifyPassword(db, email, password);
    if (!credentialsValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    try {
      const state = await mfa.getMfaState(db, ADMIN_EMAIL);
      if (mfa.isMfaEnrolled(state)) {
        const methods = mfa.mfaMethodsFromState(state);
        return res.json({
          success: true,
          mfaRequired: true,
          mfaToken: mfa.signMfaToken(ADMIN_EMAIL, methods),
          methods
        });
      }
    } catch (err) {
      console.warn('MFA state unavailable during login:', err.message);
    }

    return completeLogin(res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to complete sign in' });
  }
});

app.post('/api/auth/mfa/verify', mfaLimiter, async (req, res) => {
  const challenge = mfa.verifyTypedToken(req.body?.mfaToken, 'mfa');
  if (!challenge || challenge.email !== ADMIN_EMAIL) {
    return res.status(401).json({ success: false, error: 'Verification expired. Sign in again.' });
  }

  try {
    const state = await mfa.getMfaState(db, ADMIN_EMAIL);
    const method = req.body?.method === 'recovery' ? 'recovery' : 'totp';
    const code = String(req.body?.code || '');

    if (method === 'recovery') {
      const remaining = mfa.consumeRecoveryCode(state.recoveryHashes, code);
      if (!remaining) {
        return res.status(401).json({ success: false, error: 'Invalid recovery code' });
      }
      await mfa.upsertMfaRow(db, ADMIN_EMAIL, {
        recovery_hashes: JSON.stringify(remaining),
        totp_enabled: state.totpEnabled,
        totp_secret_enc: state.totpSecretEnc
      });
      return completeLogin(res);
    }

    const secret = mfa.decryptSecret(state.totpSecretEnc);
    if (!state.totpEnabled || !secret || !mfa.verifyTotpCode(secret, code, ADMIN_EMAIL)) {
      return res.status(401).json({ success: false, error: 'Invalid authenticator code' });
    }

    return completeLogin(res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to verify code' });
  }
});

app.get('/api/auth/mfa', requireAdmin, async (_req, res) => {
  try {
    const state = await mfa.getMfaState(db, ADMIN_EMAIL);
    res.json({ success: true, ...mfa.toPublicMfaStatus(state) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Unable to load security settings' });
  }
});

app.post('/api/auth/mfa/totp/setup', requireAdmin, async (_req, res) => {
  try {
    const setup = await mfa.createTotpSetup({ email: ADMIN_EMAIL, issuer: issuerName });
    res.json({
      success: true,
      qrDataUrl: setup.qrDataUrl,
      secret: setup.secret,
      otpauthUrl: setup.otpauthUrl,
      setupToken: setup.setupToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Unable to start authenticator setup' });
  }
});

app.post('/api/auth/mfa/totp/enable', requireAdmin, async (req, res) => {
  const setup = mfa.verifyTypedToken(req.body?.setupToken, 'totp-setup');
  if (!setup || setup.email !== ADMIN_EMAIL) {
    return res.status(400).json({ success: false, error: 'Setup expired. Scan a new QR code.' });
  }

  const secret = mfa.decryptSecret(setup.secret);
  if (!secret || !mfa.verifyTotpCode(secret, req.body?.code, ADMIN_EMAIL)) {
    return res.status(401).json({ success: false, error: 'Invalid authenticator code' });
  }

  try {
    const state = await mfa.getMfaState(db, ADMIN_EMAIL);
    const recoveryCodes = state.recoveryHashes.length
      ? null
      : mfa.generateRecoveryCodes();
    const recoveryHashes = recoveryCodes
      ? recoveryCodes.map(mfa.hashRecoveryCode)
      : state.recoveryHashes;

    await mfa.upsertMfaRow(db, ADMIN_EMAIL, {
      totp_secret_enc: mfa.encryptSecret(secret),
      totp_enabled: true,
      recovery_hashes: JSON.stringify(recoveryHashes)
    });

    res.json({ success: true, recoveryCodes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Unable to enable authenticator' });
  }
});

app.post('/api/auth/mfa/totp/disable', requireAdmin, async (req, res) => {
  try {
    const state = await mfa.getMfaState(db, ADMIN_EMAIL);
    const secret = mfa.decryptSecret(state.totpSecretEnc);
    const code = String(req.body?.code || '');
    const totpOk = Boolean(secret && mfa.verifyTotpCode(secret, code, ADMIN_EMAIL));
    const remaining = totpOk ? null : mfa.consumeRecoveryCode(state.recoveryHashes, code);

    if (!totpOk && !remaining) {
      return res.status(401).json({ success: false, error: 'Invalid verification code' });
    }

    await mfa.upsertMfaRow(db, ADMIN_EMAIL, {
      totp_secret_enc: null,
      totp_enabled: false,
      recovery_hashes: JSON.stringify(remaining || state.recoveryHashes)
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Unable to disable authenticator' });
  }
});

app.post('/api/auth/mfa/recovery/regenerate', requireAdmin, async (req, res) => {
  try {
    const state = await mfa.getMfaState(db, ADMIN_EMAIL);
    if (!mfa.isMfaEnrolled(state)) {
      return res.status(400).json({ success: false, error: 'Enable MFA before creating recovery codes' });
    }

    const secret = mfa.decryptSecret(state.totpSecretEnc);
    const code = String(req.body?.code || '');
    const totpOk = Boolean(state.totpEnabled && secret && mfa.verifyTotpCode(secret, code, ADMIN_EMAIL));
    const usedRecovery = totpOk ? null : mfa.consumeRecoveryCode(state.recoveryHashes, code);

    if (!totpOk && !usedRecovery) {
      return res.status(401).json({ success: false, error: 'Invalid verification code' });
    }

    const recoveryCodes = mfa.generateRecoveryCodes();
    await mfa.upsertMfaRow(db, ADMIN_EMAIL, {
      totp_secret_enc: state.totpSecretEnc,
      totp_enabled: state.totpEnabled,
      recovery_hashes: JSON.stringify(recoveryCodes.map(mfa.hashRecoveryCode))
    });

    res.json({ success: true, recoveryCodes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Unable to regenerate recovery codes' });
  }
});

app.post('/api/auth/passkey/register/options', requireAdmin, async (req, res) => {
  try {
    const result = await mfa.createRegistrationOptions(db, ADMIN_EMAIL, req, allowedOrigins);
    res.json({ success: true, ...result });
  } catch (err) {
    return sendPasskeyError(res, err, 'Unable to start passkey registration');
  }
});

app.post('/api/auth/passkey/register/verify', requireAdmin, async (req, res) => {
  try {
    const result = await mfa.verifyRegistration(db, ADMIN_EMAIL, req.body, req, allowedOrigins);
    if (!result.ok) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.json({ success: true, recoveryCodes: result.recoveryCodes });
  } catch (err) {
    return sendPasskeyError(res, err, 'Could not register this passkey', 400);
  }
});

app.post('/api/auth/passkey/login/options', mfaLimiter, async (req, res) => {
  try {
    const challenge = req.body?.mfaToken
      ? mfa.verifyTypedToken(req.body.mfaToken, 'mfa')
      : null;

    if (req.body?.mfaToken && (!challenge || challenge.email !== ADMIN_EMAIL)) {
      return res.status(401).json({ success: false, error: 'Verification expired. Sign in again.' });
    }

    const email = challenge ? ADMIN_EMAIL : null;
    const result = await mfa.createAuthenticationOptions(db, email, req, allowedOrigins);
    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.json({ success: true, ...result });
  } catch (err) {
    return sendPasskeyError(res, err, 'Unable to start passkey sign in');
  }
});

app.post('/api/auth/passkey/login/verify', mfaLimiter, async (req, res) => {
  try {
    const challenge = req.body?.mfaToken
      ? mfa.verifyTypedToken(req.body.mfaToken, 'mfa')
      : null;

    if (req.body?.mfaToken && (!challenge || challenge.email !== ADMIN_EMAIL)) {
      return res.status(401).json({ success: false, error: 'Verification expired. Sign in again.' });
    }

    const result = await mfa.verifyAuthentication(
      db,
      req.body,
      req,
      allowedOrigins,
      challenge ? ADMIN_EMAIL : undefined
    );

    if (!result.ok || result.email !== ADMIN_EMAIL) {
      return res.status(401).json({ success: false, error: result.error || 'Passkey verification failed' });
    }

    return completeLogin(res);
  } catch (err) {
    return sendPasskeyError(res, err, 'Passkey verification failed', 401);
  }
});

app.delete('/api/auth/passkey/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM auth_passkeys WHERE id=? AND email=?', [id, ADMIN_EMAIL]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Unable to remove passkey' });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  res.setHeader('Set-Cookie', buildSessionCookie('', mfa.SESSION_TTL_MS, { clear: true }));
  res.json({ success: true });
});

// --- CV import (admin) ---

app.post('/api/cv/parse', cvLimiter, async (req, res) => {
  try {
    let text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

    if (!text && req.body?.pdfBase64) {
      const buffer = cv.decodePdfBase64(req.body.pdfBase64);
      if (!buffer) {
        return res.status(400).json({ error: 'Upload a PDF or paste CV text.' });
      }
      text = await cv.extractPdfText(buffer);
    }

    if (!text || text.length < 40) {
      return res.status(400).json({ error: 'Could not read enough text from the CV.' });
    }

    const parsed = await cv.parseCvWithAi(text);
    res.json({ success: true, data: parsed });
  } catch (err) {
    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
    console.error('CV parse failed:', err.detail || err.message);
    res.status(status).json({ error: err.message || 'Unable to parse CV' });
  }
});

app.post('/api/cv/apply', cvLimiter, async (req, res) => {
  try {
    const payload = cv.normalizeCvPayload(req.body || {});
    const selectedExperience = Array.isArray(req.body?.experience) ? payload.experience : [];
    const selectedEducation = Array.isArray(req.body?.education) ? payload.education : [];
    const selectedSkills = Array.isArray(req.body?.skills) ? payload.skills : [];
    const patchAbout = Boolean(req.body?.patchAbout);

    const [existingJobs] = await db.query('SELECT company, position, start_date FROM work_experience');
    const [existingEdu] = await db.query('SELECT institution, degree, start_date FROM education');
    const [existingSkills] = await db.query('SELECT name FROM skills');
    const [aboutRows] = await db.query('SELECT * FROM about LIMIT 1');

    const jobKeys = new Set((existingJobs || []).map((row) => cv.experienceKey(row.company, row.position, row.start_date)));
    const eduKeys = new Set((existingEdu || []).map((row) => cv.educationKey(row.institution, row.degree, row.start_date)));
    const skillKeys = new Set((existingSkills || []).map((row) => cv.skillKey(row.name)));

    const inserted = { experience: 0, education: 0, skills: 0, skipped: 0, aboutPatched: false };

    for (const job of selectedExperience) {
      const key = cv.experienceKey(job.company, job.position, job.startDate);
      if (jobKeys.has(key)) {
        inserted.skipped += 1;
        continue;
      }
      await db.query(
        'INSERT INTO work_experience (id, company, position, start_date, end_date, current, description, achievements, technologies, company_logo, location, employment_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          cv.newId(),
          job.company,
          job.position,
          job.startDate,
          job.endDate,
          job.current,
          job.description,
          JSON.stringify(job.achievements || []),
          JSON.stringify(job.technologies || []),
          null,
          job.location,
          job.employmentType
        ]
      );
      jobKeys.add(key);
      inserted.experience += 1;
    }

    for (const item of selectedEducation) {
      const key = cv.educationKey(item.institution, item.degree, item.startDate);
      if (eduKeys.has(key)) {
        inserted.skipped += 1;
        continue;
      }
      await db.query(
        'INSERT INTO education (id, institution, degree, field, start_date, end_date, current, gpa, honors, description, institution_logo, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          cv.newId(),
          item.institution,
          item.degree,
          item.field,
          item.startDate,
          item.endDate,
          item.current,
          item.gpa,
          JSON.stringify(item.honors || []),
          item.description,
          null,
          item.location
        ]
      );
      eduKeys.add(key);
      inserted.education += 1;
    }

    for (const skill of selectedSkills) {
      const key = cv.skillKey(skill.name);
      if (!key || skillKeys.has(key)) {
        if (key) inserted.skipped += 1;
        continue;
      }
      await db.query(
        'INSERT INTO skills (id, name, category, proficiency, years_of_experience, certifications, projects) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [cv.newId(), skill.name, skill.category, skill.proficiency, skill.yearsOfExperience, JSON.stringify(skill.certifications || []), skill.projects]
      );
      skillKeys.add(key);
      inserted.skills += 1;
    }

    if (patchAbout) {
      const existing = aboutRows[0] ? keysToCamel(aboutRows[0]) : null;
      const next = cv.patchEmptyAboutFields(existing, payload.personal, true);
      if (next) {
        if (existing?.id) {
          await db.query(
            `UPDATE about SET name=?, title=?, bio=?, location=?, email=?, phone=?, tagline=?, availability=? WHERE id=?`,
            [
              next.name || existing.name,
              next.title || existing.title,
              next.bio || existing.bio,
              next.location || existing.location,
              next.email || existing.email,
              next.phone || existing.phone || '',
              next.tagline || existing.tagline,
              next.availability || existing.availability,
              existing.id
            ]
          );
          inserted.aboutPatched = true;
        } else if (payload.personal.name && payload.personal.title) {
          const aboutId = cv.newId();
          await db.query(
            `INSERT INTO about (id, name, title, bio, location, email, phone, tagline, availability)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              aboutId,
              payload.personal.name,
              payload.personal.title,
              payload.personal.summary || payload.personal.title,
              payload.personal.location || '—',
              payload.personal.email || 'hello@example.com',
              payload.personal.phone || '',
              payload.personal.title,
              'available'
            ]
          );
          inserted.aboutPatched = true;
        }
      }
    }

    res.json({ success: true, inserted });
  } catch (err) {
    console.error('CV apply failed:', err.message);
    res.status(500).json({ error: 'Unable to apply CV data' });
  }
});

// --- Client uploads (Neon Object Storage presigned PUT) ---

app.post('/api/uploads', async (req, res) => {
  const filename = String(req.body?.filename || req.body?.payload?.pathname || '').split(/[/\\]/).pop();
  const contentType = String(req.body?.contentType || 'application/octet-stream');
  if (!filename) {
    return res.status(400).json({ error: 'filename is required' });
  }

  const ext = (filename.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const key = `cms/${crypto.randomUUID()}.${ext}`;

  try {
    const payload = await storage.createUploadUrl(key, contentType);
    return res.json(payload);
  } catch (err) {
    console.error('Upload token failed:', err.message);
    const status = err.status || 400;
    return res.status(status).json({ error: status === 503 ? err.message : 'Upload failed' });
  }
});

app.get('/api/neon/status', async (_req, res) => {
  let authReachable = false;
  if (process.env.NEON_AUTH_BASE_URL) {
    try {
      const authRes = await fetch(process.env.NEON_AUTH_BASE_URL, { method: 'GET' });
      authReachable = authRes.status < 500;
    } catch {
      authReachable = false;
    }
  }

  let aiGatewayReachable = false;
  if (process.env.NEON_AI_GATEWAY_TOKEN && process.env.NEON_AI_GATEWAY_BASE_URL) {
    try {
      const base = String(process.env.NEON_AI_GATEWAY_BASE_URL).replace(/\/$/, '');
      const modelsRes = await fetch(`${base}/v1/models`, {
        headers: { Authorization: `Bearer ${process.env.NEON_AI_GATEWAY_TOKEN}` }
      });
      aiGatewayReachable = modelsRes.ok;
    } catch {
      aiGatewayReachable = false;
    }
  }

  let objectStorageWritable = false;
  let objectStorageUrl = '';
  if (storage.storageConfigured()) {
    try {
      const uploaded = await storage.putHealthObject();
      objectStorageWritable = true;
      objectStorageUrl = uploaded.publicUrl;
    } catch (err) {
      console.error('Object storage health failed:', err.message);
    }
  }

  const functionUrl = process.env.NEON_FUNCTION_HELLO_BASE_URL || '';
  let functionsReachable = false;
  if (functionUrl) {
    try {
      const fnRes = await fetch(functionUrl);
      functionsReachable = fnRes.ok;
    } catch {
      functionsReachable = false;
    }
  }

  res.json({
    postgres: Boolean(process.env.DATABASE_URL),
    auth: Boolean(process.env.NEON_AUTH_BASE_URL),
    authReachable,
    objectStorage: storage.storageConfigured(),
    objectStorageWritable,
    objectStorageUrl,
    aiGateway: Boolean(process.env.NEON_AI_GATEWAY_TOKEN && process.env.NEON_AI_GATEWAY_BASE_URL),
    aiGatewayReachable,
    realtime: realtime.realtimeConfigured(),
    functions: Boolean(functionUrl),
    functionsReachable,
    branch: process.env.NEON_BRANCH || ''
  });
});

app.get('/api/realtime/blog-posts', async (_req, res) => {
  try {
    const payload = await realtime.sealPublishedPosts();
    res.json(payload);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: status === 503 ? err.message : 'Realtime is unavailable' });
  }
});

// --- Health Check ---

app.get('/api/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Health check failed');
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, error: 'Unable to complete request' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
