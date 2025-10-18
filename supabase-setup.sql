-- Supabase Database Setup for Portfolio Admin Dashboard
-- Run this script in your Supabase project's SQL Editor (https://supabase.com/dashboard/project/[your-project]/sql)

-- Enable RLS for all tables (Row Level Security)
-- Note: This assumes you have authentication set up. Admins should be authenticated users.
-- For simplicity, policies allow authenticated users to CRUD all data. Adjust for production.

-- 1. About Table (with relations)
CREATE TABLE IF NOT EXISTS public.about (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT NOT NULL,
    location TEXT,
    email TEXT,
    phone TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- About Values (e.g., key-value pairs for additional info)
CREATE TABLE IF NOT EXISTS public.about_values (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    about_id UUID REFERENCES public.about(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- About Experience (e.g., summary experience)
CREATE TABLE IF NOT EXISTS public.about_experience (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    about_id UUID REFERENCES public.about(id) ON DELETE CASCADE,
    years INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,  -- Rich HTML content from Quill editor
    image_url TEXT,
    category TEXT,
    tags TEXT[],  -- Array of tags
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    publish_date TIMESTAMP WITH TIME ZONE,
    read_time INTEGER,  -- Estimated reading time in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Skills
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,  -- e.g., 'Frontend', 'Backend'
    proficiency INTEGER CHECK (proficiency BETWEEN 0 AND 100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Work Experience
CREATE TABLE IF NOT EXISTS public.work_experience (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN DEFAULT FALSE,
    description TEXT,
    achievements TEXT[],  -- Array of achievement strings
    technologies TEXT[],  -- Array of technology strings
    company_logo TEXT,
    location TEXT,
    employment_type TEXT,  -- e.g., 'Full-time', 'Part-time'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Education
CREATE TABLE IF NOT EXISTS public.education (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN DEFAULT FALSE,
    gpa NUMERIC(3,2),
    honors TEXT[],  -- Array of honors
    description TEXT,
    institution_logo TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    technologies TEXT[],  -- Array of technologies
    github_url TEXT,
    live_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    certificate_url TEXT,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT,
    company TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    date DATE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Recommendations (similar to testimonials, if separate)
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT,
    company TEXT,
    content TEXT NOT NULL,
    linkedin_url TEXT,
    date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users (admins) full CRUD access
-- Adjust 'auth.uid() = id' if you have user_id columns; here assuming all data is public for authenticated users

-- About
CREATE POLICY "Authenticated users can CRUD about" ON public.about
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can CRUD about_values" ON public.about_values
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can CRUD about_experience" ON public.about_experience
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Blog Posts
CREATE POLICY "Authenticated users can CRUD blog_posts" ON public.blog_posts
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Skills
CREATE POLICY "Authenticated users can CRUD skills" ON public.skills
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Work Experience
CREATE POLICY "Authenticated users can CRUD work_experience" ON public.work_experience
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Education
CREATE POLICY "Authenticated users can CRUD education" ON public.education
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Projects
CREATE POLICY "Authenticated users can CRUD projects" ON public.projects
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Certificates
CREATE POLICY "Authenticated users can CRUD certificates" ON public.certificates
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Testimonials
CREATE POLICY "Authenticated users can CRUD testimonials" ON public.testimonials
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Recommendations
CREATE POLICY "Authenticated users can CRUD recommendations" ON public.recommendations
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Insert sample about data (optional, for testing)
INSERT INTO public.about (name, title, bio, location, email, phone, website_url, linkedin_url, github_url)
VALUES ('Bernard', 'Full Stack Developer', 'Passionate developer creating amazing web experiences.', 'Location', 'email@example.com', '123-456-7890', 'https://example.com', 'https://linkedin.com/in/bernard', 'https://github.com/bernard')
ON CONFLICT (id) DO NOTHING;

-- Note: After running this, test the connection in your app. If you have auth set up, ensure you're logged in as admin.
-- For public read access on frontend, add SELECT policies for anonymous users if needed (e.g., for published blog posts).
