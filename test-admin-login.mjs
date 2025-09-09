// Test admin login after manual creation
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAdminLogin() {
  console.log("🔐 Testing Admin Login");
  console.log("======================");
  console.log("Email: admin@educational-platform.com");
  console.log("Password: admin123\n");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@educational-platform.com",
      password: "admin123",
    });

    if (error) {
      console.error("❌ Login Failed:", error.message);

      if (error.message.includes("Invalid login credentials")) {
        console.log("\n💡 Possible Solutions:");
        console.log("1. User not created yet - follow manual setup guide");
        console.log('2. Incorrect password - verify it\'s exactly "admin123"');
        console.log("3. Email not confirmed - check Supabase dashboard");
      } else if (error.message.includes("Email not confirmed")) {
        console.log("\n⚠️  Email needs confirmation in Supabase dashboard");
      }

      return false;
    }

    console.log("✅ Login Successful!");
    console.log("\n👤 User Information:");
    console.log("- ID:", data.user.id);
    console.log("- Email:", data.user.email);
    console.log(
      "- Email Confirmed:",
      data.user.email_confirmed_at ? "✅ Yes" : "❌ No"
    );
    console.log("- Created:", new Date(data.user.created_at).toLocaleString());

    if (
      data.user.user_metadata &&
      Object.keys(data.user.user_metadata).length > 0
    ) {
      console.log("\n📋 User Metadata:");
      Object.entries(data.user.user_metadata).forEach(([key, value]) => {
        console.log(`- ${key}:`, value);
      });
    }

    console.log("\n🎯 Session Information:");
    console.log(
      "- Access Token:",
      data.session.access_token ? "✅ Present" : "❌ Missing"
    );
    console.log(
      "- Expires:",
      new Date(data.session.expires_at * 1000).toLocaleString()
    );

    // Sign out
    await supabase.auth.signOut();
    console.log("\n🚪 Successfully signed out");

    console.log("\n🎉 ADMIN LOGIN WORKS!");
    console.log(
      "You can now access your admin panel at: http://localhost:5173"
    );
    console.log("1. Click login");
    console.log('2. Select "مدرس" (Teacher)');
    console.log("3. Enter the credentials above");

    return true;
  } catch (error) {
    console.error("❌ Unexpected Error:", error.message);
    return false;
  }
}

// Run the test
testAdminLogin().catch(console.error);
