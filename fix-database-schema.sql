-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sections table if it doesn't exist
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

-- Create videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  section_id UUID NOT NULL REFERENCES sections(id),
  duration_minutes INTEGER,
  thumbnail TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for sections
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage sections
DROP POLICY IF EXISTS admin_manage_sections ON sections;
CREATE POLICY admin_manage_sections ON sections
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Policy for students to view published sections
DROP POLICY IF EXISTS students_view_sections ON sections;
CREATE POLICY students_view_sections ON sections
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM sections s WHERE s.id = sections.id AND s.status = 'published'));

-- Create RLS policies for videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage videos
DROP POLICY IF EXISTS admin_manage_videos ON videos;
CREATE POLICY admin_manage_videos ON videos
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Policy for students to view published videos in published sections
DROP POLICY IF EXISTS students_view_videos ON videos;
CREATE POLICY students_view_videos ON videos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM videos v WHERE v.id = videos.id AND v.status = 'published') AND
    section_id IN (SELECT id FROM sections s WHERE s.status = 'published')
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sections_status ON sections(status);
CREATE INDEX IF NOT EXISTS idx_sections_featured ON sections(featured);
CREATE INDEX IF NOT EXISTS idx_videos_section_id ON videos(section_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);