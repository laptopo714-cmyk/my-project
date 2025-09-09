// Verify the 500 error fix
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyFix() {
  console.log("🔧 Verifying Admin Login Fix");
  console.log("============================");

  console.log("Testing login...");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@educational-platform.com",
      password: "admin123",
    });

    if (error) {
      console.error("❌ Login still failed:");
      console.error("- Error:", error.message);
      console.error("- Code:", error.status);

      if (error.status === 500) {
        console.error("\n🚨 Still getting 500 error. Try:");
        console.error("1. Run the fix-500-error.sql script");
        console.error("2. Or delete and recreate user in Dashboard");
        console.error("3. Make sure 'Auto Confirm User' is enabled");
      } else if (error.status === 400) {
        console.error(
          "\n🚨 Back to 400 error. User might not exist or email not confirmed."
        );
      }

      return false;
    }

    console.log("🎉 SUCCESS! Admin login working!");
    console.log("- User ID:", data.user.id);
    console.log("- Email:", data.user.email);
    console.log("- Role:", data.user.user_metadata?.role);
    console.log("- Is Super Admin:", data.user.user_metadata?.is_super_admin);
    console.log(
      "- Session expires:",
      new Date(data.session.expires_at * 1000).toLocaleString()
    );

    // Test the app URL
    console.log("\n✅ You can now login at: http://localhost:5174/");
    console.log(
      "✅ Use credentials: admin@educational-platform.com / admin123"
    );

    // Clean up test session
    await supabase.auth.signOut();

    return true;
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return false;
  }
}

verifyFix().catch(console.error);
