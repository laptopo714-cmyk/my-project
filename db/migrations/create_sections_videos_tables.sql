-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  section_id UUID NOT NULL REFERENCES sections(id),
  duration_minutes INTEGER,
  thumbnail TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sections_status ON sections(status);
CREATE INDEX IF NOT EXISTS idx_sections_featured ON sections(featured);
CREATE INDEX IF NOT EXISTS idx_videos_section_id ON videos(section_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);

-- Create RLS policies for sections
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage sections
CREATE POLICY admin_manage_sections ON sections
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Policy for students to view published sections
CREATE POLICY students_view_sections ON sections
  FOR SELECT
  TO authenticated
  USING (status = 'published');

-- Create RLS policies for videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage videos
CREATE POLICY admin_manage_videos ON videos
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Policy for students to view published videos in published sections
CREATE POLICY students_view_videos ON videos
  FOR SELECT
  TO authenticated
  USING (
    status = 'published' AND 
    section_id IN (SELECT id FROM sections WHERE status = 'published')
  );