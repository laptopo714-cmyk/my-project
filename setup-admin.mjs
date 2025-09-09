// Simple admin user creation using SQL
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3MTE0MSwiZXhwIjoyMDcyMTQ3MTQxfQ.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createAdminWithSQL() {
  try {
    console.log("🔧 Creating admin user using SQL approach...");

    // First, let's try to create the user using the admin API with minimal data
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: "admin@educational-platform.com",
      password: "admin123",
      email_confirm: true,
      user_metadata: {
        role: "admin",
        is_super_admin: true,
      },
    });

    if (error) {
      console.error("❌ Error:", error.message);
      if (error.message.includes("already registered")) {
        console.log("✅ User already exists, this is fine!");
        return await testLogin();
      }
      return false;
    }

    console.log("✅ User created successfully!");
    console.log("- ID:", user.user.id);
    console.log("- Email:", user.user.email);

    return await testLogin();
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return false;
  }
}

async function testLogin() {
  try {
    console.log("\n🧪 Testing login...");

    // Create regular client for testing
    const testClient = createClient(
      SUPABASE_URL,
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog"
    );

    const { data, error } = await testClient.auth.signInWithPassword({
      email: "admin@educational-platform.com",
      password: "admin123",
    });

    if (error) {
      console.error("❌ Login failed:", error.message);
      return false;
    }

    console.log("✅ Login successful!");
    console.log("- User ID:", data.user.id);
    console.log("- Email:", data.user.email);
    console.log(
      "- Email Confirmed:",
      data.user.email_confirmed_at ? "Yes" : "No"
    );

    // Sign out
    await testClient.auth.signOut();
    console.log("- Signed out successfully");

    return true;
  } catch (error) {
    console.error("❌ Login test error:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Simple Admin Setup");
  console.log("=====================");

  const success = await createAdminWithSQL();

  if (success) {
    console.log("\n🎉 SUCCESS! Admin account is ready!");
    console.log("\n📋 Admin Credentials:");
    console.log("Email: admin@educational-platform.com");
    console.log("Password: admin123");
    console.log("\n🌐 Access your admin panel at: http://localhost:5173");
    console.log("1. Click login");
    console.log('2. Select "مدرس" (Teacher)');
    console.log("3. Enter the credentials above");
  } else {
    console.log("\n❌ Setup failed. Please check the errors above.");
  }
}

main().catch(console.error);
