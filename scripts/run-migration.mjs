// Script to run SQL migrations on Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = 'https://vzuuzpcpaskvrhyafuqx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3MTE0MSwiZXhwIjoyMDcyMTQ3MTQxfQ.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get migration file path from command line arguments
const migrationFilePath = process.argv[2];

if (!migrationFilePath) {
  console.error('Error: Migration file path not provided');
  console.log('Usage: node run-migration.mjs <path-to-migration-file>');
  process.exit(1);
}

async function runMigration() {
  try {
    // Read SQL file
    const sqlFilePath = path.resolve(migrationFilePath);
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`Error: Migration file '${sqlFilePath}' not found`);
      process.exit(1);
    }
    
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log(`Running migration from ${migrationFilePath}...`);
    
    // Execute SQL query using Supabase's RPC
    const { error } = await supabase.rpc('exec_sql', { query: sqlQuery });
    
    if (error) {
      console.error('Error executing migration:', error.message);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();