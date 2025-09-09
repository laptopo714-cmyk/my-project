// Simple script to create sections and videos tables
import { supabaseAdmin } from '../lib/supabaseClient.js';

async function createTables() {
  console.log('Creating sections and videos tables...');
  
  try {
    // Create sections table
    const sectionsSQL = `
      CREATE TABLE IF NOT EXISTS sections (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail TEXT,
        status TEXT DEFAULT 'draft',
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Create videos table
    const videosSQL = `
      CREATE TABLE IF NOT EXISTS videos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
        duration_minutes INTEGER DEFAULT 0,
        thumbnail TEXT,
        status TEXT DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Execute SQL using rpc
    const { error: sectionsError } = await supabaseAdmin.rpc('exec_sql', { query: sectionsSQL });
    if (sectionsError) {
      console.error('Error creating sections table:', sectionsError);
      return;
    }

    const { error: videosError } = await supabaseAdmin.rpc('exec_sql', { query: videosSQL });
    if (videosError) {
      console.error('Error creating videos table:', videosError);
      return;
    }

    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();