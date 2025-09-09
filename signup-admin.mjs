// Try creating admin user through signup
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function signupAdmin() {
  try {
    console.log("🔐 Trying to signup admin user...");

    const { data, error } = await supabase.auth.signUp({
      email: "admin@educational-platform.com",
      password: "admin123",
      options: {
        data: {
          role: "admin",
          is_super_admin: true,
          full_name: "مدير المنصة التعليمية",
        },
      },
    });

    if (error) {
      console.error("❌ Signup error:", error.message);

      if (error.message.includes("already registered")) {
        console.log("✅ User already exists! Testing login...");
        return await testLogin();
      }

      return false;
    }

    console.log("✅ Signup successful!");
    console.log("- User ID:", data.user?.id);
    console.log("- Email:", data.user?.email);
    console.log("- Needs confirmation:", !data.session);

    if (data.session) {
      console.log("✅ User is automatically signed in!");
      await supabase.auth.signOut();
    }

    return await testLogin();
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return false;
  }
}

async function testLogin() {
  try {
    console.log("\n🧪 Testing login...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@educational-platform.com",
      password: "admin123",
    });

    if (error) {
      console.error("❌ Login failed:", error.message);

      if (error.message.includes("Email not confirmed")) {
        console.log("⚠️  Email needs to be confirmed");
        console.log("ℹ️  Check your Supabase dashboard to confirm the user");
        return "needs_confirmation";
      }

      return false;
    }

    console.log("✅ Login successful!");
    console.log("- User ID:", data.user.id);
    console.log("- Email:", data.user.email);
    console.log(
      "- Email Confirmed:",
      data.user.email_confirmed_at ? "Yes" : "No"
    );

    if (data.user.user_metadata) {
      console.log("- Role:", data.user.user_metadata.role);
      console.log("- Super Admin:", data.user.user_metadata.is_super_admin);
    }

    // Sign out
    await supabase.auth.signOut();
    console.log("- Signed out successfully");

    return true;
  } catch (error) {
    console.error("❌ Login test error:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Admin Signup Attempt");
  console.log("========================");

  const result = await signupAdmin();

  if (result === true) {
    console.log("\n🎉 SUCCESS! Admin account is ready!");
    console.log("\n📋 Admin Credentials:");
    console.log("Email: admin@educational-platform.com");
    console.log("Password: admin123");
    console.log("\n🌐 Access your admin panel at: http://localhost:5173");
  } else if (result === "needs_confirmation") {
    console.log("\n⚠️  Admin user created but needs email confirmation");
    console.log("Go to Supabase Dashboard > Authentication > Users");
    console.log("Find the admin user and confirm the email manually");
  } else {
    console.log("\n❌ Setup failed");
    console.log("Try running the SQL script in Supabase SQL Editor:");
    console.log("File: create-admin-direct.sql");
  }
}

main().catch(console.error);
