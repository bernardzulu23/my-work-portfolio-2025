
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bernardzulu.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const PASSWORD_SALT = process.env.PASSWORD_SALT || '_salt_bernard';

app.use(cors());
app.use(bodyParser.json());

const hashPassword = (password) =>
  Buffer.from(`${password}${PASSWORD_SALT}`).toString('base64');

const ensureSchema = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      read_status BOOLEAN DEFAULT FALSE
    )
  `);

  const alterStatements = [
    'ALTER TABLE testimonials ADD COLUMN companyLogo VARCHAR(255)',
    'ALTER TABLE testimonials ADD COLUMN linkedinUrl VARCHAR(255)',
    'ALTER TABLE testimonials ADD COLUMN project VARCHAR(255)',
    'ALTER TABLE testimonials ADD COLUMN skills JSON',
    'ALTER TABLE recommendations ADD COLUMN companyLogo VARCHAR(255)',
    'ALTER TABLE recommendations ADD COLUMN skills JSON'
  ];

  for (const statement of alterStatements) {
    try {
      await db.query(statement);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.warn('Schema migration warning:', err.message);
      }
    }
  }
};

ensureSchema().catch((err) => console.error('Schema setup failed:', err));

const activeTokens = new Map();

const createSessionToken = (email) => {
  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.set(token, {
    email,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  });
  return token;
};

const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7);
  const session = activeTokens.get(token);

  if (!session || session.expiresAt < Date.now()) {
    activeTokens.delete(token);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.admin = session;
  next();
};

app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) return next();

  const isPublicRead = req.method === 'GET' && req.path !== '/api/contact';
  if (isPublicRead) return next();

  if (req.method === 'POST' && req.path === '/api/contact') return next();
  if (req.path.startsWith('/api/auth/')) return next();

  return requireAdmin(req, res, next);
});

// Helper to parse JSON fields
const parseJsonFields = (rows, fields) => {
  return rows.map(row => {
    const newRow = { ...row };
    fields.forEach(field => {
      if (newRow[field] && typeof newRow[field] === 'string') {
        try {
          newRow[field] = JSON.parse(newRow[field]);
        } catch (e) {
          console.error(`Error parsing JSON for field ${field}:`, e);
          newRow[field] = [];
        }
      }
    });
    return newRow;
  });
};

// --- About ---

app.get('/api/about', async (req, res) => {
  try {
    const [aboutRows] = await db.query('SELECT * FROM about LIMIT 1');
    if (aboutRows.length === 0) return res.json({});

    const about = aboutRows[0];
    
    // Fetch values
    const [values] = await db.query('SELECT * FROM about_values WHERE about_id = ?', [about.id]);
    about.values = values;

    // Fetch experience
    const [experience] = await db.query('SELECT * FROM about_experience WHERE about_id = ?', [about.id]);
    about.experience = parseJsonFields(experience, ['technologies']);

    res.json(about);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/about', async (req, res) => {
  const { id, name, title, bio, location, email, phone, tagline, availability, avatar, resumeUrl, linkedinUrl, githubUrl, websiteUrl, values, experience } = req.body;

  try {
    const aboutId = id || crypto.randomUUID();
    await db.query(
      `INSERT INTO about (id, name, title, bio, location, email, phone, tagline, availability, avatar, resumeUrl, linkedinUrl, githubUrl, websiteUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [aboutId, name, title, bio, location, email, phone, tagline, availability, avatar, resumeUrl, linkedinUrl, githubUrl, websiteUrl]
    );

    if (values?.length) {
      const valuesRows = values.map(v => [v.id || crypto.randomUUID(), aboutId, v.title, v.description, v.icon, v.color]);
      await db.query('INSERT INTO about_values (id, about_id, title, description, icon, color) VALUES ?', [valuesRows]);
    }

    if (experience?.length) {
      const expRows = experience.map(e => [e.id || crypto.randomUUID(), aboutId, e.year, e.title, e.company, e.description, JSON.stringify(e.technologies || [])]);
      await db.query('INSERT INTO about_experience (id, about_id, year, title, company, description, technologies) VALUES ?', [expRows]);
    }

    res.status(201).json({ success: true, id: aboutId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/about/:id', async (req, res) => {
  const { id } = req.params;
  const { name, title, bio, location, email, phone, tagline, availability, avatar, resumeUrl, linkedinUrl, githubUrl, websiteUrl, values, experience } = req.body;

  try {
    // Update main about table
    await db.query(
      `UPDATE about SET name=?, title=?, bio=?, location=?, email=?, phone=?, tagline=?, availability=?, avatar=?, resumeUrl=?, linkedinUrl=?, githubUrl=?, websiteUrl=? WHERE id=?`,
      [name, title, bio, location, email, phone, tagline, availability, avatar, resumeUrl, linkedinUrl, githubUrl, websiteUrl, id]
    );

    // Update Values (Delete all and re-insert for simplicity, or upsert)
    // For simplicity, let's delete and re-insert if values are provided
    if (values) {
      await db.query('DELETE FROM about_values WHERE about_id = ?', [id]);
      if (values.length > 0) {
        const valuesValues = values.map(v => [v.id || Date.now().toString(), id, v.title, v.description, v.icon, v.color]);
        await db.query('INSERT INTO about_values (id, about_id, title, description, icon, color) VALUES ?', [valuesValues]);
      }
    }

    // Update Experience
    if (experience) {
      await db.query('DELETE FROM about_experience WHERE about_id = ?', [id]);
      if (experience.length > 0) {
        const expValues = experience.map(e => [e.id || Date.now().toString(), id, e.year, e.title, e.company, e.description, JSON.stringify(e.technologies || [])]);
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
  const { id, name, category, proficiency, yearsOfExperience, certifications, projects } = req.body;
  try {
    await db.query(
      'INSERT INTO skills (id, name, category, proficiency, yearsOfExperience, certifications, projects) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, category, proficiency, yearsOfExperience, JSON.stringify(certifications || []), projects]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/skills/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, proficiency, yearsOfExperience, certifications, projects } = req.body;
  try {
    await db.query(
      'UPDATE skills SET name=?, category=?, proficiency=?, yearsOfExperience=?, certifications=?, projects=? WHERE id=?',
      [name, category, proficiency, yearsOfExperience, JSON.stringify(certifications || []), projects, id]
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
  const { id, title, description, technologies, githubUrl, liveUrl, imageUrl, featured, category, status } = req.body;
  try {
    await db.query(
      'INSERT INTO projects (id, title, description, technologies, githubUrl, liveUrl, imageUrl, featured, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, JSON.stringify(technologies || []), githubUrl, liveUrl, imageUrl, featured, category, status]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, technologies, githubUrl, liveUrl, imageUrl, featured, category, status } = req.body;
  try {
    await db.query(
      'UPDATE projects SET title=?, description=?, technologies=?, githubUrl=?, liveUrl=?, imageUrl=?, featured=?, category=?, status=? WHERE id=?',
      [title, description, JSON.stringify(technologies || []), githubUrl, liveUrl, imageUrl, featured, category, status, id]
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
  const { id, company, position, startDate, endDate, current, description, achievements, technologies, companyLogo, location, employmentType } = req.body;
  try {
    await db.query(
      'INSERT INTO work_experience (id, company, position, startDate, endDate, current, description, achievements, technologies, companyLogo, location, employmentType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, company, position, startDate, endDate, current, description, JSON.stringify(achievements || []), JSON.stringify(technologies || []), companyLogo, location, employmentType]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/work-experience/:id', async (req, res) => {
  const { id } = req.params;
  const { company, position, startDate, endDate, current, description, achievements, technologies, companyLogo, location, employmentType } = req.body;
  try {
    await db.query(
      'UPDATE work_experience SET company=?, position=?, startDate=?, endDate=?, current=?, description=?, achievements=?, technologies=?, companyLogo=?, location=?, employmentType=? WHERE id=?',
      [company, position, startDate, endDate, current, description, JSON.stringify(achievements || []), JSON.stringify(technologies || []), companyLogo, location, employmentType, id]
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
  const { id, institution, degree, field, startDate, endDate, current, gpa, honors, description, institutionLogo, location } = req.body;
  try {
    await db.query(
      'INSERT INTO education (id, institution, degree, field, startDate, endDate, current, gpa, honors, description, institutionLogo, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, institution, degree, field, startDate, endDate, current, gpa, JSON.stringify(honors || []), description, institutionLogo, location]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/education/:id', async (req, res) => {
  const { id } = req.params;
  const { institution, degree, field, startDate, endDate, current, gpa, honors, description, institutionLogo, location } = req.body;
  try {
    await db.query(
      'UPDATE education SET institution=?, degree=?, field=?, startDate=?, endDate=?, current=?, gpa=?, honors=?, description=?, institutionLogo=?, location=? WHERE id=?',
      [institution, degree, field, startDate, endDate, current, gpa, JSON.stringify(honors || []), description, institutionLogo, location, id]
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
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/certificates', async (req, res) => {
  const { id, title, issuer, issueDate, expiryDate, category, pdfUrl, thumbnailUrl, verificationBadge, issuerVerification, credentialId } = req.body;
  try {
    await db.query(
      'INSERT INTO certificates (id, title, issuer, issueDate, expiryDate, category, pdfUrl, thumbnailUrl, verificationBadge, issuerVerification, credentialId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, issuer, issueDate, expiryDate, category, pdfUrl, thumbnailUrl, verificationBadge, issuerVerification, credentialId]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/certificates/:id', async (req, res) => {
  const { id } = req.params;
  const { title, issuer, issueDate, expiryDate, category, pdfUrl, thumbnailUrl, verificationBadge, issuerVerification, credentialId } = req.body;
  try {
    await db.query(
      'UPDATE certificates SET title=?, issuer=?, issueDate=?, expiryDate=?, category=?, pdfUrl=?, thumbnailUrl=?, verificationBadge=?, issuerVerification=?, credentialId=? WHERE id=?',
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
  const { id, author, position, company, content, avatar, rating, date, featured, verified, companyLogo, linkedinUrl, project, skills } = req.body;
  try {
    await db.query(
      'INSERT INTO testimonials (id, author, position, company, content, avatar, rating, date, featured, verified, companyLogo, linkedinUrl, project, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, author, position, company, content, avatar, rating, date, featured, verified, companyLogo, linkedinUrl, project, JSON.stringify(skills || [])]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/testimonials/:id', async (req, res) => {
  const { id } = req.params;
  const { author, position, company, content, avatar, rating, date, featured, verified, companyLogo, linkedinUrl, project, skills } = req.body;
  try {
    await db.query(
      'UPDATE testimonials SET author=?, position=?, company=?, content=?, avatar=?, rating=?, date=?, featured=?, verified=?, companyLogo=?, linkedinUrl=?, project=?, skills=? WHERE id=?',
      [author, position, company, content, avatar, rating, date, featured, verified, companyLogo, linkedinUrl, project, JSON.stringify(skills || []), id]
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
  const { id, author, position, company, content, date, avatar, linkedinUrl, verified, companyLogo, skills } = req.body;
  try {
    await db.query(
      'INSERT INTO recommendations (id, author, position, company, content, date, avatar, linkedinUrl, verified, companyLogo, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, author, position, company, content, date, avatar, linkedinUrl, verified, companyLogo, JSON.stringify(skills || [])]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/recommendations/:id', async (req, res) => {
  const { id } = req.params;
  const { author, position, company, content, date, avatar, linkedinUrl, verified, companyLogo, skills } = req.body;
  try {
    await db.query(
      'UPDATE recommendations SET author=?, position=?, company=?, content=?, date=?, avatar=?, linkedinUrl=?, verified=?, companyLogo=?, skills=? WHERE id=?',
      [author, position, company, content, date, avatar, linkedinUrl, verified, companyLogo, JSON.stringify(skills || []), id]
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
  const { id, title, content, excerpt, author, publishDate, tags, category, readTime, featured, status, imageUrl } = req.body;
  try {
    await db.query(
      'INSERT INTO blog_posts (id, title, content, excerpt, author, publishDate, tags, category, readTime, featured, status, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, content, excerpt, author, publishDate, JSON.stringify(tags || []), category, readTime, featured, status, imageUrl]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/blog-posts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, author, publishDate, tags, category, readTime, featured, status, imageUrl } = req.body;
  try {
    await db.query(
      'UPDATE blog_posts SET title=?, content=?, excerpt=?, author=?, publishDate=?, tags=?, category=?, readTime=?, featured=?, status=?, imageUrl=? WHERE id=?',
      [title, content, excerpt, author, publishDate, JSON.stringify(tags || []), category, readTime, featured, status, imageUrl, id]
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

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const id = crypto.randomUUID();
    await db.query(
      'INSERT INTO contact_messages (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)',
      [id, name.trim(), email.trim(), subject.trim(), message.trim()]
    );
    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/contact', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact_messages ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/contact/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM contact_messages WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Auth ---

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const adminEmail = ADMIN_EMAIL.trim().toLowerCase();

  if (normalizedEmail !== adminEmail || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const token = createSessionToken(ADMIN_EMAIL);

  res.json({
    success: true,
    user: {
      id: 'admin-1',
      email: ADMIN_EMAIL,
      role: 'admin',
      created_at: new Date().toISOString()
    },
    token
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    activeTokens.delete(authHeader.slice(7));
  }
  res.json({ success: true });
});

// --- Health Check ---

app.get('/api/health', async (req, res) => {
  try {
    // Check database connectivity
    await db.query('SELECT 1');
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
