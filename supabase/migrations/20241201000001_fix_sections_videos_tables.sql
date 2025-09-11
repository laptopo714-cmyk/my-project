-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to recreate them properly
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Create admin_users table first (needed for RLS policies)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table with foreign key to sections
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  duration_minutes INTEGER DEFAULT 0,
  thumbnail TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sections_status ON sections(status);
CREATE INDEX IF NOT EXISTS idx_sections_featured ON sections(featured);
CREATE INDEX IF NOT EXISTS idx_sections_created_at ON sections(created_at);
CREATE INDEX IF NOT EXISTS idx_videos_section_id ON videos(section_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Enable realtime for both tables
alter publication supabase_realtime add table sections;
alter publication supabase_realtime add table videos;
alter publication supabase_realtime add table admin_users;

-- Insert sample data for testing
INSERT INTO sections (title, description, status, featured) VALUES
('مقدمة في البرمجة', 'تعلم أساسيات البرمجة والمفاهيم الأساسية', 'published', true),
('تطوير تطبيقات الويب', 'تعلم كيفية بناء تطبيقات الويب الحديثة', 'published', false),
('قواعد البيانات', 'فهم أساسيات قواعد البيانات وإدارتها', 'draft', false)
ON CONFLICT (id) DO NOTHING;

-- Get the section IDs for inserting videos
DO $$
DECLARE
    section1_id UUID;
    section2_id UUID;
BEGIN
    SELECT id INTO section1_id FROM sections WHERE title = 'مقدمة في البرمجة' LIMIT 1;
    SELECT id INTO section2_id FROM sections WHERE title = 'تطوير تطبيقات الويب' LIMIT 1;
    
    IF section1_id IS NOT NULL THEN
        INSERT INTO videos (title, description, url, section_id, duration_minutes, status) VALUES
        ('مقدمة في JavaScript', 'تعلم أساسيات لغة JavaScript', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', section1_id, 45, 'published'),
        ('متغيرات JavaScript', 'فهم المتغيرات وأنواع البيانات', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', section1_id, 30, 'published')
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    IF section2_id IS NOT NULL THEN
        INSERT INTO videos (title, description, url, section_id, duration_minutes, status) VALUES
        ('HTML الأساسي', 'تعلم أساسيات HTML', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', section2_id, 60, 'published')
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;