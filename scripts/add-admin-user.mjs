// Simple script to add admin user using curl commands
import { execSync } from 'child_process';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL);
  console.error('SUPABASE_SERVICE_KEY:', !!SUPABASE_SERVICE_KEY);
  process.exit(1);
}

async function addAdminUser() {
  try {
    console.log('🔍 Checking for existing admin users...');
    
    // Check existing admin users
    const checkAdminsCmd = `curl -s -X GET "${SUPABASE_URL}/rest/v1/admin_users?select=*" ` +
      `-H "apikey: ${SUPABASE_SERVICE_KEY}" ` +
      `-H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" ` +
      `-H "Content-Type: application/json"`;
    
    let existingAdmins;
    try {
      const result = execSync(checkAdminsCmd, { encoding: 'utf8' });
      existingAdmins = JSON.parse(result);
      console.log(`📊 Found ${existingAdmins.length} existing admin users`);
      
      if (existingAdmins.length > 0) {
        console.log('✅ Admin users already exist:');
        existingAdmins.forEach(admin => {
          console.log(`   - User ID: ${admin.user_id}, Role: ${admin.role}`);
        });
        return;
      }
    } catch (error) {
      console.log('⚠️  Could not fetch existing admins, continuing...');
    }
    
    // Get all users
    console.log('🔍 Fetching authenticated users...');
    const getUsersCmd = `curl -s -X GET "${SUPABASE_URL}/auth/v1/admin/users" ` +
      `-H "apikey: ${SUPABASE_SERVICE_KEY}" ` +
      `-H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" ` +
      `-H "Content-Type: application/json"`;
    
    const usersResult = execSync(getUsersCmd, { encoding: 'utf8' });
    const usersData = JSON.parse(usersResult);
    
    if (!usersData.users || usersData.users.length === 0) {
      console.log('⚠️  No authenticated users found. Please create a user account first.');
      console.log('💡 Steps to create an admin user:');
      console.log('   1. Go to your app and create a new account');
      console.log('   2. Run this script again');
      return;
    }
    
    const firstUser = usersData.users[0];
    console.log(`📋 Found user: ${firstUser.email} (ID: ${firstUser.id})`);
    console.log(`🔧 Adding ${firstUser.email} as admin...`);
    
    // Add user as admin
    const addAdminCmd = `curl -s -X POST "${SUPABASE_URL}/rest/v1/admin_users" ` +
      `-H "apikey: ${SUPABASE_SERVICE_KEY}" ` +
      `-H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" ` +
      `-H "Content-Type: application/json" ` +
      `-H "Prefer: return=representation" ` +
      `-d '{"user_id": "${firstUser.id}", "role": "admin"}'`;
    
    const addResult = execSync(addAdminCmd, { encoding: 'utf8' });
    const newAdmin = JSON.parse(addResult);
    
    if (Array.isArray(newAdmin) && newAdmin.length > 0) {
      console.log('✅ Successfully added admin user:');
      console.log(`   - Email: ${firstUser.email}`);
      console.log(`   - User ID: ${newAdmin[0].user_id}`);
      console.log(`   - Role: ${newAdmin[0].role}`);
      console.log('\n🎉 Setup complete! You can now use the admin dashboard.');
    } else {
      console.log('⚠️  Admin user may already exist or there was an issue.');
      console.log('Response:', newAdmin);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Manual steps to add admin user:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Run this query:');
    console.log(`   INSERT INTO admin_users (user_id, role) 
   SELECT id, 'admin' FROM auth.users LIMIT 1;`);
  }
}

addAdminUser();