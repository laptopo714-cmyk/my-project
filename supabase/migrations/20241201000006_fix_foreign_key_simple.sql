-- Fix foreign key relationship between student_section_access and sections tables

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