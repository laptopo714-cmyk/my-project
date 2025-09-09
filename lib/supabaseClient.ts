import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzuuzpcpaskvrhyafuqx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3MTE0MSwiZXhwIjoyMDcyMTQ3MTQxfQ.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY'

// Regular client for normal operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})