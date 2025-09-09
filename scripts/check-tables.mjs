// Script to check if sections and videos tables exist in the database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = 'https://vzuuzpcpaskvrhyafuqx.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3MTE0MSwiZXhwIjoyMDcyMTQ3MTQxfQ.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkTables() {
  try {
    console.log('Checking if sections and videos tables exist...');
    
    // Check if sections table exists
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('sections')
      .select('count')
      .limit(1);
    
    if (sectionsError) {
      console.error('Error checking sections table:', sectionsError.message);
      console.log('Sections table might not exist.');
    } else {
      console.log('Sections table exists!');
    }
    
    // Check if videos table exists
    const { data: videosData, error: videosError } = await supabase
      .from('videos')
      .select('count')
      .limit(1);
    
    if (videosError) {
      console.error('Error checking videos table:', videosError.message);
      console.log('Videos table might not exist.');
    } else {
      console.log('Videos table exists!');
    }
    
    // If tables don't exist, suggest running the migration script
    if (sectionsError || videosError) {
      console.log('\nSome tables are missing. You should run the migration script:');
      console.log('node scripts/run-migration.mjs db/migrations/create_sections_videos_tables.sql');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTables();