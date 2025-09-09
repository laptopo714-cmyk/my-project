// Script to fix database schema issues
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or service key not found in environment variables');
  console.log('Make sure you have .env.local file with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabase() {
  try {
    console.log('Checking database tables...');
    
    // Check if sections table exists
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('sections')
      .select('count')
      .limit(1);

    if (sectionsError) {
      console.error('Error checking sections table:', sectionsError.message);
      console.log('Sections table might not exist, will create it.');
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
      console.log('Videos table might not exist, will create it.');
    } else {
      console.log('Videos table exists!');
    }

    // If any table doesn't exist, run the SQL script
    if (sectionsError || videosError) {
      console.log('\nCreating missing tables...');
      
      // Read SQL file
      const sqlFilePath = path.resolve('./fix-database-schema.sql');
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      
      // Split SQL into individual statements
      const statements = sqlContent.split(';').filter(stmt => stmt.trim() !== '');
      
      // Execute each statement separately
      for (const statement of statements) {
        const { error } = await supabase.rpc('exec_sql', { 
          query: statement + ';' 
        });
        
        if (error) {
          // If exec_sql function doesn't exist, we need to use a different approach
          if (error.message.includes("Could not find the function public.exec_sql")) {
            console.error('The exec_sql function is not available in your Supabase project.');
            console.log('Please run the SQL statements directly in the Supabase SQL Editor.');
            console.log('SQL file has been created at: ./fix-database-schema.sql');
            process.exit(1);
          }
          
          console.error('Error executing SQL statement:', error.message);
          console.error('Statement:', statement);
        }
      }
      
      console.log('Database schema fixed successfully!');
    } else {
      console.log('\nAll required tables already exist. No changes needed.');
    }
    
    console.log('\nDatabase check completed.');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

fixDatabase();