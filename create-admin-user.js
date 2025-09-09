// Supabase Admin User Creation Script
// This script uses Supabase Admin API to create the official admin user

import { createClient } from "@supabase/supabase-js";

// Configuration - Replace these with your actual Supabase project details
const SUPABASE_URL = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3MTE0MSwiZXhwIjoyMDcyMTQ3MTQxfQ.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY"; // Service role key

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  try {
    console.log("Creating official admin user...");

    // Create user using Supabase Auth Admin API
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@educational-platform.com",
      password: "admin123",
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: "مدير المنصة التعليمية",
        role: "admin",
        is_super_admin: true,
        created_by: "system",
        arabic_name: "مدير عام",
      },
      app_metadata: {
        provider: "email",
        providers: ["email"],
        role: "admin",
      },
    });

    if (error) {
      console.error("Error creating admin user:", error);
      return;
    }

    console.log("✅ Admin user created successfully!");
    console.log("User ID:", user.user.id);
    console.log("Email:", user.user.email);
    console.log("Created at:", user.user.created_at);

    // Optional: Create profile record if you have a profiles table
    /*
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.user.id,
        full_name: 'مدير المنصة التعليمية',
        role: 'admin',
        is_super_admin: true
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    } else {
      console.log('✅ Profile created successfully!');
    }
    */

    // Test login with the created user
    console.log("\nTesting admin login...");
    const { data: loginData, error: loginError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: "admin@educational-platform.com",
        password: "admin123",
      });

    if (loginError) {
      console.error("❌ Login test failed:", loginError);
    } else {
      console.log("✅ Admin login test successful!");
      console.log("Access token available:", !!loginData.session?.access_token);

      // Sign out the test session
      await supabaseAdmin.auth.signOut();
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Alternative function to update existing user if needed
async function updateAdminUser() {
  try {
    // First, get the user by email
    const { data: users, error: getUserError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (getUserError) {
      console.error("Error listing users:", getUserError);
      return;
    }

    const adminUser = users.users.find(
      (user) => user.email === "admin@educational-platform.com"
    );

    if (!adminUser) {
      console.log("Admin user not found. Creating new user...");
      await createAdminUser();
      return;
    }

    console.log("Updating existing admin user...");

    const { data: updatedUser, error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
        email: "admin@educational-platform.com",
        password: "admin123",
        email_confirm: true,
        user_metadata: {
          full_name: "مدير المنصة التعليمية",
          role: "admin",
          is_super_admin: true,
          updated_by: "system",
          arabic_name: "مدير عام",
        },
      });

    if (updateError) {
      console.error("Error updating admin user:", updateError);
      return;
    }

    console.log("✅ Admin user updated successfully!");
    console.log("User ID:", updatedUser.user.id);
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Function to verify admin user exists and is properly configured
async function verifyAdminUser() {
  try {
    console.log("Verifying admin user...");

    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("Error listing users:", error);
      return false;
    }

    const adminUser = users.users.find(
      (user) => user.email === "admin@educational-platform.com"
    );

    if (adminUser) {
      console.log("✅ Admin user found!");
      console.log("ID:", adminUser.id);
      console.log("Email:", adminUser.email);
      console.log(
        "Email Confirmed:",
        adminUser.email_confirmed_at ? "Yes" : "No"
      );
      console.log("Role in metadata:", adminUser.user_metadata?.role);
      console.log("Created:", adminUser.created_at);
      return true;
    } else {
      console.log("❌ Admin user not found");
      return false;
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return false;
  }
}

// Main execution
async function main() {
  console.log("🚀 Supabase Admin User Setup");
  console.log("================================");

  // First verify if user already exists
  const exists = await verifyAdminUser();

  if (!exists) {
    // Create new admin user
    await createAdminUser();
  } else {
    console.log(
      "\nAdmin user already exists. Do you want to update? (Run updateAdminUser() manually if needed)"
    );
  }

  console.log("\n✅ Setup complete!");
  console.log("\nAdmin Credentials:");
  console.log("Email: admin@educational-platform.com");
  console.log("Password: admin123");
  console.log(
    "\nYou can now use these credentials to log into your application."
  );
}

// Export functions for manual use
export { createAdminUser, updateAdminUser, verifyAdminUser };

// Run main function if this file is executed directly
if (import.meta.main) {
  main();
}
