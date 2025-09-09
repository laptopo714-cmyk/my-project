// Test basic Supabase connection
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log("🔍 Testing Supabase Connection...");
  console.log(`📍 Project URL: ${SUPABASE_URL}`);

  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Connection failed:", error.message);
      return false;
    }

    console.log("✅ Basic connection successful");

    // Test if we can access auth
    console.log("🔐 Testing auth access...");

    const { data: user } = await supabase.auth.getUser();
    console.log("✅ Auth access works");

    return true;
  } catch (error) {
    console.error("❌ Connection error:", error.message);
    return false;
  }
}

async function checkAuthSettings() {
  console.log("\n⚙️  Checking authentication status...");

  // Try to get session
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("❌ Auth error:", error.message);
  } else {
    console.log("✅ Auth system is accessible");
    console.log("- Current session:", data.session ? "Active" : "None");
  }
}

async function main() {
  console.log("🚀 Supabase Connection Test");
  console.log("============================");

  const connected = await testConnection();

  if (connected) {
    await checkAuthSettings();

    console.log("\n📋 Next Steps:");
    console.log(
      "1. Since automated user creation failed, create the admin user manually"
    );
    console.log("2. Go to Supabase Dashboard > Authentication > Users");
    console.log("3. Add user with email: admin@educational-platform.com");
    console.log("4. Add password: admin123");
    console.log("5. Make sure to auto-confirm the email");
    console.log(
      '6. Add user metadata: {"role": "admin", "is_super_admin": true}'
    );
    console.log("\n📖 See MANUAL_ADMIN_SETUP.md for detailed instructions");
  } else {
    console.log("\n❌ Basic connection failed");
    console.log("Please check your Supabase project settings");
  }
}

main().catch(console.error);
