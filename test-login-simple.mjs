// Simple Login Test
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLoginDetailed() {
  console.log("🧪 Testing admin login with detailed error reporting...");
  console.log("Email: admin@educational-platform.com");
  console.log("Password: admin123");
  console.log("URL:", SUPABASE_URL);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@educational-platform.com",
      password: "admin123",
    });

    if (error) {
      console.error("\n❌ Login Error Details:");
      console.error("- Message:", error.message);
      console.error("- Code:", error.status || "No status code");
      console.error("- Name:", error.name || "No error name");

      // Common error interpretations
      if (error.message.includes("Invalid login credentials")) {
        console.error("\n🔍 This means:");
        console.error("- User doesn't exist, OR");
        console.error("- Email is not confirmed, OR");
        console.error("- Password is incorrect");
      } else if (error.message.includes("Email not confirmed")) {
        console.error("\n🔍 This means:");
        console.error("- User exists but email needs confirmation");
      } else if (error.status === 400) {
        console.error("\n🔍 HTTP 400 Bad Request usually means:");
        console.error("- Invalid email format, OR");
        console.error("- Missing required fields, OR");
        console.error("- User doesn't exist, OR");
        console.error("- Authentication is disabled");
      }

      return false;
    }

    console.log("\n✅ Login successful!");
    console.log("- User ID:", data.user?.id);
    console.log("- Email:", data.user?.email);
    console.log(
      "- Email verified:",
      data.user?.email_confirmed_at ? "Yes" : "No"
    );
    console.log(
      "- User metadata:",
      JSON.stringify(data.user?.user_metadata, null, 2)
    );

    // Clean up
    await supabase.auth.signOut();
    return true;
  } catch (error) {
    console.error("\n❌ Unexpected error:", error.message);
    console.error("- Stack:", error.stack);
    return false;
  }
}

async function testBasicConnection() {
  console.log("\n🔌 Testing basic Supabase connection...");

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Connection failed:", error.message);
      return false;
    }

    console.log("✅ Connection successful");
    return true;
  } catch (error) {
    console.error("❌ Connection error:", error.message);
    return false;
  }
}

async function main() {
  console.log("🔍 Simple Admin Login Test");
  console.log("=========================");

  // Test basic connection first
  const connectionOk = await testBasicConnection();

  if (!connectionOk) {
    console.log(
      "\n❌ Basic connection failed. Check your Supabase configuration."
    );
    return;
  }

  // Test login
  const loginOk = await testLoginDetailed();

  if (!loginOk) {
    console.log("\n🔧 Recommended actions:");
    console.log("1. Verify user exists in Supabase Dashboard");
    console.log("2. Check that email is confirmed");
    console.log("3. Verify password is exactly 'admin123'");
    console.log("4. Check Supabase Authentication settings");
  }
}

main().catch(console.error);
