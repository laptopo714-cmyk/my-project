-- Fix foreign key relationship between student_section_access and sections tables

-- First, ensure the student_section_access table exists with proper structure
CREATE TABLE IF NOT EXISTS student_section_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing foreign key constraint if it exists (to recreate it properly)
ALTER TABLE student_section_access DROP CONSTRAINT IF EXISTS student_section_access_section_id_fkey;

-- Add the proper foreign key constraint to sections table
ALTER TABLE student_section_access 
ADD CONSTRAINT student_section_access_section_id_fkey 
FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_section_access_student_id ON student_section_access(student_id);
CREATE INDEX IF NOT EXISTS idx_student_section_access_section_id ON student_section_access(section_id);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE student_section_access;

-- Insert some sample data for testing (linking students to sections)
DO $$
DECLARE
    section1_id UUID;
    section2_id UUID;
    auth_user_id UUID;
BEGIN
    -- Get some section IDs
    SELECT id INTO section1_id FROM sections WHERE title = 'مقدمة في البرمجة' LIMIT 1;
    SELECT id INTO section2_id FROM sections WHERE title = 'تطوير تطبيقات الويب' LIMIT 1;
    
    -- Get a sample auth user ID (you might need to adjust this based on your actual users)
    SELECT id INTO auth_user_id FROM auth.users LIMIT 1;
    
    -- Insert sample access records if we have the required data
    IF section1_id IS NOT NULL AND auth_user_id IS NOT NULL THEN
        INSERT INTO student_section_access (student_id, section_id, granted_at) 
        VALUES (auth_user_id, section1_id, NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    IF section2_id IS NOT NULL AND auth_user_id IS NOT NULL THEN
        INSERT INTO student_section_access (student_id, section_id, granted_at) 
        VALUES (auth_user_id, section2_id, NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;