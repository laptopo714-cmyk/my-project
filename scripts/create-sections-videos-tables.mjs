// Script to create sections and videos tables in Supabase

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

// Read SQL file
const sqlFilePath = path.resolve(__dirname, '../db/migrations/sections_videos_tables.sql');
const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

async function createTables() {
  try {
    console.log('Creating sections and videos tables...');
    
    // Execute SQL query
    const { error } = await supabase.rpc('exec_sql', { query: sqlQuery });
    
    if (error) {
      throw error;
    }
    
    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Run the function
createTables();