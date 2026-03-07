
const mysql = require('mysql2/promise');

const connectionString = 'mysql://root:qLxsvkmrgwzeTQVDkEPeaTUVKyWTUqJG@yamanote.proxy.rlwy.net:33598/railway';

async function seed() {
  console.log('Connecting to MySQL database...');
  const connection = await mysql.createConnection(connectionString);

  try {
    console.log('Connected!');

    // --- Create Tables ---

    console.log('Creating tables...');

    // About
    await connection.query(`
      CREATE TABLE IF NOT EXISTS about (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        bio TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        avatar VARCHAR(255),
        resumeUrl VARCHAR(255),
        linkedinUrl VARCHAR(255),
        githubUrl VARCHAR(255),
        websiteUrl VARCHAR(255),
        tagline VARCHAR(255) NOT NULL,
        availability VARCHAR(50) NOT NULL
      )
    `);

    // About Values
    await connection.query(`
      CREATE TABLE IF NOT EXISTS about_values (
        id VARCHAR(36) PRIMARY KEY,
        about_id VARCHAR(36),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(50) NOT NULL,
        color VARCHAR(50),
        FOREIGN KEY (about_id) REFERENCES about(id) ON DELETE CASCADE
      )
    `);

    // About Experience
    await connection.query(`
      CREATE TABLE IF NOT EXISTS about_experience (
        id VARCHAR(36) PRIMARY KEY,
        about_id VARCHAR(36),
        year VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        technologies JSON,
        FOREIGN KEY (about_id) REFERENCES about(id) ON DELETE CASCADE
      )
    `);

    // Blog Posts
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        publishDate DATETIME NOT NULL,
        tags JSON,
        category VARCHAR(100) NOT NULL,
        readTime INT NOT NULL,
        featured BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) NOT NULL,
        imageUrl VARCHAR(255)
      )
    `);

    // Skills
    await connection.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        proficiency INT NOT NULL,
        yearsOfExperience INT NOT NULL,
        certifications JSON,
        projects INT NOT NULL
      )
    `);

    // Work Experience
    await connection.query(`
      CREATE TABLE IF NOT EXISTS work_experience (
        id VARCHAR(36) PRIMARY KEY,
        company VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        startDate DATETIME NOT NULL,
        endDate DATETIME,
        current BOOLEAN DEFAULT FALSE,
        description TEXT NOT NULL,
        achievements JSON,
        technologies JSON,
        companyLogo VARCHAR(255),
        location VARCHAR(255) NOT NULL,
        employmentType VARCHAR(100) NOT NULL
      )
    `);

    // Education
    await connection.query(`
      CREATE TABLE IF NOT EXISTS education (
        id VARCHAR(36) PRIMARY KEY,
        institution VARCHAR(255) NOT NULL,
        degree VARCHAR(255) NOT NULL,
        field VARCHAR(255) NOT NULL,
        startDate DATETIME NOT NULL,
        endDate DATETIME,
        current BOOLEAN DEFAULT FALSE,
        gpa DECIMAL(3, 2),
        honors JSON,
        description TEXT NOT NULL,
        institutionLogo VARCHAR(255),
        location VARCHAR(255) NOT NULL
      )
    `);

    // Projects
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        technologies JSON,
        githubUrl VARCHAR(255),
        liveUrl VARCHAR(255),
        imageUrl VARCHAR(255),
        featured BOOLEAN DEFAULT FALSE,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL
      )
    `);

    // Certificates
    await connection.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        issuer VARCHAR(255) NOT NULL,
        issueDate DATETIME NOT NULL,
        expiryDate DATETIME,
        category VARCHAR(100) NOT NULL,
        pdfUrl VARCHAR(255),
        thumbnailUrl VARCHAR(255),
        verificationBadge BOOLEAN DEFAULT FALSE,
        issuerVerification VARCHAR(255),
        credentialId VARCHAR(255)
      )
    `);

    // Testimonials
    await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR(36) PRIMARY KEY,
        author VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        avatar VARCHAR(255),
        rating INT NOT NULL,
        date DATETIME NOT NULL,
        featured BOOLEAN DEFAULT FALSE,
        verified BOOLEAN DEFAULT FALSE
      )
    `);

    // Recommendations
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recommendations (
        id VARCHAR(36) PRIMARY KEY,
        author VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATETIME NOT NULL,
        avatar VARCHAR(255),
        linkedinUrl VARCHAR(255),
        verified BOOLEAN DEFAULT FALSE
      )
    `);

    console.log('Tables created successfully.');

    // --- Insert Mock Data ---

    console.log('Seeding data...');

    // Mock Data (copied from AdminService)
    
    // About
    const aboutId = '1';
    await connection.execute(
      `INSERT INTO about (id, name, title, bio, location, email, phone, tagline, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      [
        aboutId,
        'Bernard Zulu',
        'Full Stack Developer & IT Support Specialist',
        'I\'m a dedicated IT Support Specialist, Junior Network Technician, and Full-Stack Developer with expertise in providing technical support, network administration, and developing web applications. I specialize in troubleshooting complex IT issues, managing network infrastructure, and creating efficient software solutions.',
        'Lusaka, Zambia',
        'bernard.zulu@example.com',
        '+260 123 456 789',
        'Building the future, one line of code at a time',
        'available'
      ]
    );

    // About Values
    const aboutValues = [
      { id: '1', title: 'Innovation', description: 'Always exploring new technologies and creative solutions to complex problems.', icon: 'lightning-bolt', color: 'blue' },
      { id: '2', title: 'Quality', description: 'Committed to writing clean, maintainable code and delivering exceptional user experiences.', icon: 'heart', color: 'purple' },
      { id: '3', title: 'Collaboration', description: 'Believe in the power of teamwork and open communication to achieve great results.', icon: 'users', color: 'green' }
    ];

    for (const v of aboutValues) {
      await connection.execute(
        `INSERT INTO about_values (id, about_id, title, description, icon, color) VALUES (?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE title=VALUES(title)`,
        [v.id, aboutId, v.title, v.description, v.icon, v.color || null]
      );
    }

    // About Experience
    const aboutExperience = [
      { id: '1', year: '2024', title: 'IT Support Specialist', company: 'Technology Solutions Zambia', description: 'Providing comprehensive IT support and network administration services. Managing network infrastructure, troubleshooting hardware/software issues, and implementing system optimizations for improved performance.', technologies: ['Network Administration', 'System Optimization', 'Technical Support'] },
      { id: '2', year: '2023', title: 'Junior Network Technician', company: 'Zambia IT Services', description: 'Maintaining and monitoring network systems, configuring routers and switches, and providing technical support to end-users. Implemented network security measures and conducted regular system maintenance.', technologies: ['Network Security', 'Router Configuration', 'System Maintenance'] },
      { id: '3', year: '2022', title: 'Full-Stack Developer', company: 'Freelance / Personal Projects', description: 'Developed web applications using Angular, Node.js, and modern frameworks. Built responsive user interfaces and implemented backend services. Created portfolio website and various client projects.', technologies: ['Angular', 'Node.js', 'TypeScript', 'MongoDB'] }
    ];

    for (const e of aboutExperience) {
      await connection.execute(
        `INSERT INTO about_experience (id, about_id, year, title, company, description, technologies) VALUES (?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE title=VALUES(title)`,
        [e.id, aboutId, e.year, e.title, e.company, e.description, JSON.stringify(e.technologies || [])]
      );
    }

    // Blog Posts
    const blogPosts = [
      {
        id: '1',
        title: 'Getting Started with Angular 19',
        content: 'Angular 19 brings many new features...',
        excerpt: 'Learn about the latest features in Angular 19',
        author: 'Bernard Zulu',
        publishDate: new Date('2024-01-15'),
        tags: ['Angular', 'Frontend', 'Tutorial'],
        category: 'Development',
        readTime: 5,
        featured: true,
        status: 'published'
      }
    ];

    for (const p of blogPosts) {
      await connection.execute(
        `INSERT INTO blog_posts (id, title, content, excerpt, author, publishDate, tags, category, readTime, featured, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE title=VALUES(title)`,
        [p.id, p.title, p.content, p.excerpt, p.author, p.publishDate, JSON.stringify(p.tags || []), p.category, p.readTime, p.featured, p.status]
      );
    }

    // Skills
    const skills = [
      { id: '1', name: 'Angular', category: 'Frontend', proficiency: 90, yearsOfExperience: 3, certifications: ['Angular Developer'], projects: 15 },
      { id: '2', name: 'TypeScript', category: 'Language', proficiency: 85, yearsOfExperience: 3, certifications: [], projects: 20 },
      { id: '3', name: 'JavaScript', category: 'Language', proficiency: 90, yearsOfExperience: 4, certifications: [], projects: 25 },
      { id: '4', name: 'Node.js', category: 'Backend', proficiency: 80, yearsOfExperience: 3, certifications: [], projects: 12 },
      { id: '5', name: 'React', category: 'Frontend', proficiency: 75, yearsOfExperience: 2, certifications: [], projects: 8 },
      { id: '6', name: 'MongoDB', category: 'Database', proficiency: 70, yearsOfExperience: 2, certifications: [], projects: 10 },
      { id: '7', name: 'Git', category: 'Tools', proficiency: 85, yearsOfExperience: 4, certifications: [], projects: 30 },
      { id: '8', name: 'Docker', category: 'Tools', proficiency: 65, yearsOfExperience: 1, certifications: [], projects: 5 }
    ];

    for (const s of skills) {
      await connection.execute(
        `INSERT INTO skills (id, name, category, proficiency, yearsOfExperience, certifications, projects) VALUES (?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [s.id, s.name, s.category, s.proficiency, s.yearsOfExperience, JSON.stringify(s.certifications || []), s.projects]
      );
    }

    // Work Experience
    const workExperience = [
      {
        id: '1',
        company: 'Tech Solutions Inc',
        position: 'Full Stack Developer',
        startDate: new Date('2022-01-01'),
        current: true,
        description: 'Developing modern web applications using Angular and Node.js',
        achievements: ['Led 5 major projects', 'Improved performance by 40%'],
        technologies: ['Angular', 'TypeScript', 'Node.js', 'MongoDB'],
        location: 'Lusaka, Zambia',
        employmentType: 'Full-time'
      }
    ];

    for (const w of workExperience) {
      await connection.execute(
        `INSERT INTO work_experience (id, company, position, startDate, current, description, achievements, technologies, location, employmentType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE company=VALUES(company)`,
        [w.id, w.company, w.position, w.startDate, w.current, w.description, JSON.stringify(w.achievements || []), JSON.stringify(w.technologies || []), w.location, w.employmentType]
      );
    }

    // Education
    const education = [
      {
        id: '1',
        institution: 'University of Zambia',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2022-06-30'),
        current: false,
        gpa: 3.8,
        honors: ['Dean\'s List', 'Best Final Year Project'],
        description: 'Focused on software engineering and web development',
        location: 'Lusaka, Zambia'
      }
    ];

    for (const e of education) {
      await connection.execute(
        `INSERT INTO education (id, institution, degree, field, startDate, endDate, current, gpa, honors, description, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE institution=VALUES(institution)`,
        [e.id, e.institution, e.degree, e.field, e.startDate, e.endDate, e.current, e.gpa || null, JSON.stringify(e.honors || []), e.description, e.location]
      );
    }

    // Projects
    const projects = [
      {
        id: '1',
        title: 'E-Commerce Platform',
        description: 'Modern e-commerce solution with payment integration',
        technologies: ['Angular', 'Node.js', 'Stripe', 'MongoDB'],
        githubUrl: 'https://github.com/bernardzulu23/ecommerce',
        liveUrl: 'https://ecommerce-demo.com',
        imageUrl: '/assets/projects/ecommerce.jpg',
        featured: true,
        category: 'Web Application',
        status: 'active'
      },
      {
        id: '2',
        title: 'Portfolio Website',
        description: 'Personal portfolio built with Angular and Tailwind CSS',
        technologies: ['Angular', 'Tailwind CSS', 'TypeScript'],
        githubUrl: 'https://github.com/bernardzulu23/portfolio',
        liveUrl: 'https://bernardzulu.com',
        imageUrl: '/assets/projects/portfolio.jpg',
        featured: true,
        category: 'Web Application',
        status: 'active'
      },
      {
        id: '3',
        title: 'Task Management App',
        description: 'Collaborative task management application',
        technologies: ['Angular', 'Firebase', 'Material UI'],
        githubUrl: 'https://github.com/bernardzulu23/taskmanager',
        imageUrl: '/assets/projects/taskmanager.jpg',
        featured: false,
        category: 'Web Application',
        status: 'active'
      }
    ];

    for (const p of projects) {
      await connection.execute(
        `INSERT INTO projects (id, title, description, technologies, githubUrl, liveUrl, imageUrl, featured, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE title=VALUES(title)`,
        [p.id, p.title, p.description, JSON.stringify(p.technologies || []), p.githubUrl || null, p.liveUrl || null, p.imageUrl || null, p.featured, p.category, p.status]
      );
    }

    // Certificates
    const certificates = [
      {
        id: '1',
        title: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2023-06-15'),
        expiryDate: new Date('2026-06-15'),
        category: 'Cloud',
        pdfUrl: '/assets/certificates/aws-developer.pdf',
        thumbnailUrl: '/assets/certificates/aws-thumb.jpg',
        verificationBadge: true,
        issuerVerification: 'https://aws.amazon.com/verification',
        credentialId: 'AWS-DEV-12345'
      }
    ];

    for (const c of certificates) {
      await connection.execute(
        `INSERT INTO certificates (id, title, issuer, issueDate, expiryDate, category, pdfUrl, thumbnailUrl, verificationBadge, issuerVerification, credentialId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE title=VALUES(title)`,
        [c.id, c.title, c.issuer, c.issueDate, c.expiryDate, c.category, c.pdfUrl || null, c.thumbnailUrl || null, c.verificationBadge, c.issuerVerification || null, c.credentialId || null]
      );
    }

    // Testimonials
    const testimonials = [
      {
        id: '1',
        author: 'Sarah Johnson',
        position: 'Project Manager',
        company: 'Tech Solutions Inc',
        content: 'Bernard is an exceptional developer who consistently delivers high-quality work. His attention to detail and problem-solving skills are outstanding.',
        avatar: '/assets/testimonials/sarah.jpg',
        rating: 5,
        date: new Date('2024-01-15'),
        featured: true,
        verified: true
      },
      {
        id: '2',
        author: 'Michael Chen',
        position: 'CTO',
        company: 'Digital Innovations',
        content: 'Working with Bernard has been a pleasure. He brings both technical expertise and creative thinking to every project.',
        avatar: '/assets/testimonials/michael.jpg',
        rating: 5,
        date: new Date('2024-01-10'),
        featured: false,
        verified: true
      }
    ];

    for (const t of testimonials) {
      await connection.execute(
        `INSERT INTO testimonials (id, author, position, company, content, avatar, rating, date, featured, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE author=VALUES(author)`,
        [t.id, t.author, t.position, t.company, t.content, t.avatar || null, t.rating, t.date, t.featured, t.verified]
      );
    }

    // Recommendations
    const recommendations = [
      {
        id: '1',
        author: 'David Wilson',
        position: 'Senior Developer',
        company: 'CloudTech Solutions',
        content: 'I highly recommend Bernard for any development project. His skills and professionalism are top-notch.',
        date: new Date('2024-01-20'),
        avatar: '/assets/recommendations/david.jpg',
        linkedinUrl: 'https://linkedin.com/in/davidwilson',
        verified: true
      }
    ];

    for (const r of recommendations) {
      await connection.execute(
        `INSERT INTO recommendations (id, author, position, company, content, date, avatar, linkedinUrl, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE author=VALUES(author)`,
        [r.id, r.author, r.position, r.company, r.content, r.date, r.avatar || null, r.linkedinUrl || null, r.verified]
      );
    }

    console.log('Seeding completed successfully!');

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await connection.end();
  }
}

seed();
