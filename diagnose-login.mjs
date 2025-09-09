// Diagnose Admin Login Issues
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3MTE0MSwiZXhwIjoyMDcyMTQ3MTQxfQ.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkUserExists() {
  console.log("🔍 Checking if admin user exists...");

  try {
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("❌ Error listing users:", error.message);
      return null;
    }

    const adminUser = users.users.find(
      (user) => user.email === "admin@educational-platform.com"
    );

    if (adminUser) {
      console.log("✅ Admin user found!");
      console.log("- User ID:", adminUser.id);
      console.log("- Email:", adminUser.email);
      console.log(
        "- Email Confirmed:",
        adminUser.email_confirmed_at ? "✅ Yes" : "❌ No"
      );
      console.log(
        "- Created:",
        new Date(adminUser.created_at).toLocaleString()
      );
      console.log(
        "- Last Sign In:",
        adminUser.last_sign_in_at
          ? new Date(adminUser.last_sign_in_at).toLocaleString()
          : "Never"
      );
      console.log(
        "- User Metadata:",
        JSON.stringify(adminUser.user_metadata, null, 2)
      );
      console.log(
        "- App Metadata:",
        JSON.stringify(adminUser.app_metadata, null, 2)
      );

      return adminUser;
    } else {
      console.log("❌ Admin user not found");
      return null;
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return null;
  }
}

async function testLogin() {
  console.log("\n🧪 Testing login with admin credentials...");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@educational-platform.com",
      password: "admin123",
    });

    if (error) {
      console.error("❌ Login failed:", error.message);
      console.error("- Error code:", error.status);
      console.error("- Full error:", JSON.stringify(error, null, 2));
      return false;
    }

    console.log("✅ Login successful!");
    console.log("- User ID:", data.user?.id);
    console.log("- Email:", data.user?.email);
    console.log(
      "- Session expires:",
      new Date(data.session?.expires_at * 1000).toLocaleString()
    );

    // Sign out to clean up
    await supabase.auth.signOut();
    console.log("- Signed out successfully");

    return true;
  } catch (error) {
    console.error("❌ Unexpected login error:", error.message);
    return false;
  }
}

async function checkAuthSettings() {
  console.log("\n⚙️ Checking authentication settings...");

  try {
    // Test basic connection
    const { data: session } = await supabase.auth.getSession();
    console.log("✅ Basic auth connection works");

    // Try to get user (should be null when not logged in)
    const { data: user } = await supabase.auth.getUser();
    console.log("✅ User endpoint accessible");

    return true;
  } catch (error) {
    console.error("❌ Auth settings error:", error.message);
    return false;
  }
}

async function fixEmailConfirmation(userId) {
  console.log("\n🔧 Attempting to fix email confirmation...");

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email_confirm: true,
      }
    );

    if (error) {
      console.error("❌ Failed to confirm email:", error.message);
      return false;
    }

    console.log("✅ Email confirmation updated");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error fixing email:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Admin Login Diagnostic Tool");
  console.log("==============================");

  // Step 1: Check if user exists
  const user = await checkUserExists();

  if (!user) {
    console.log("\n❌ Admin user doesn't exist. Please create it first using:");
    console.log("1. Supabase Dashboard -> Authentication -> Users");
    console.log("2. Or run the SQL script provided earlier");
    return;
  }

  // Step 2: Check auth settings
  const authWorks = await checkAuthSettings();

  if (!authWorks) {
    console.log("\n❌ Basic authentication is not working");
    return;
  }

  // Step 3: Fix email confirmation if needed
  if (!user.email_confirmed_at) {
    console.log("\n⚠️ Email not confirmed, attempting to fix...");
    await fixEmailConfirmation(user.id);
  }

  // Step 4: Test login
  const loginWorks = await testLogin();

  if (loginWorks) {
    console.log("\n🎉 Everything is working correctly!");
    console.log("Try logging in to your app now at: http://localhost:5174/");
  } else {
    console.log("\n❌ Login still failing. Possible issues:");
    console.log("1. Password might be incorrect");
    console.log("2. User might be disabled");
    console.log("3. Supabase project settings might block authentication");
    console.log("4. RLS policies might be interfering");

    console.log("\n🔧 Suggested fixes:");
    console.log("1. Reset password in Supabase Dashboard");
    console.log("2. Check Authentication settings -> Email confirmation");
    console.log("3. Disable RLS temporarily on auth schema");
  }
}

main().catch(console.error);
