// Test script for sections and videos services

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables from .env file
const dotenvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(dotenvPath)) {
  const envConfig = fs.readFileSync(dotenvPath, 'utf8').split('\n');
  for (const line of envConfig) {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  }
}

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or service key not found in environment variables');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test data
const testSection = {
  title: 'قسم البرمجة',
  description: 'دروس في البرمجة وتطوير الويب',
  status: 'published',
  featured: true
};

const testVideo = {
  title: 'مقدمة في HTML',
  description: 'شرح أساسيات لغة HTML',
  url: 'https://www.youtube.com/watch?v=example',
  duration_minutes: 15,
  status: 'published'
};

async function testSectionsAndVideos() {
  try {
    console.log('Testing sections and videos services...');
    
    // Create a test section
    console.log('Creating test section...');
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .insert([testSection])
      .select()
      .single();
    
    if (sectionError) {
      throw sectionError;
    }
    
    console.log('Test section created:', section);
    
    // Create a test video linked to the section
    console.log('Creating test video...');
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert([{
        ...testVideo,
        section_id: section.id
      }])
      .select()
      .single();
    
    if (videoError) {
      throw videoError;
    }
    
    console.log('Test video created:', video);
    
    // Fetch the video with section information
    console.log('Fetching video with section info...');
    const { data: videoWithSection, error: fetchError } = await supabase
      .from('videos')
      .select('*, sections(title)')
      .eq('id', video.id)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log('Video with section info:', videoWithSection);
    
    // Get section stats
    console.log('Getting section stats...');
    const { data: totalSections, error: statsError } = await supabase
      .from('sections')
      .select('*', { count: 'exact', head: true });
    
    if (statsError) {
      throw statsError;
    }
    
    console.log('Total sections:', totalSections.length);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the tests
testSectionsAndVideos();