// Check existing users in Supabase
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3MTE0MSwiZXhwIjoyMDcyMTQ3MTQxfQ.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function listUsers() {
  try {
    console.log("🔍 Checking existing users...");

    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Error listing users:", error.message);
      return;
    }

    console.log(`📊 Found ${users.users.length} users:`);

    users.users.forEach((user, index) => {
      console.log(`\n${index + 1}. User ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(
        `   Email Confirmed: ${user.email_confirmed_at ? "Yes" : "No"}`
      );
      console.log(
        `   Last Sign In: ${
          user.last_sign_in_at
            ? new Date(user.last_sign_in_at).toLocaleString()
            : "Never"
        }`
      );

      if (user.user_metadata && Object.keys(user.user_metadata).length > 0) {
        console.log(
          `   User Metadata:`,
          JSON.stringify(user.user_metadata, null, 4)
        );
      }

      if (user.app_metadata && Object.keys(user.app_metadata).length > 0) {
        console.log(
          `   App Metadata:`,
          JSON.stringify(user.app_metadata, null, 4)
        );
      }
    });

    // Check specifically for admin user
    const adminUser = users.users.find(
      (user) => user.email === "admin@educational-platform.com"
    );

    if (adminUser) {
      console.log("\n✅ Admin user found!");
      console.log("Testing login...");

      const testClient = createClient(
        SUPABASE_URL,
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog"
      );

      const { data, error } = await testClient.auth.signInWithPassword({
        email: "admin@educational-platform.com",
        password: "admin123",
      });

      if (error) {
        console.error("❌ Login test failed:", error.message);
      } else {
        console.log("✅ Login test successful!");
        await testClient.auth.signOut();
      }
    } else {
      console.log("\n❌ Admin user not found");
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }
}

listUsers().catch(console.error);
