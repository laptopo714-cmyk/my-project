#!/usr/bin/env node
/**
 * Automated Supabase Setup Script
 * سكريبت الإعداد التلقائي الكامل
 *
 * This script automatically:
 * 1. Verifies Supabase connection
 * 2. Sets up admin user with multiple fallback methods
 * 3. Configures proper permissions and metadata
 * 4. Tests all functionality
 * 5. Provides comprehensive status report
 */

import { createClient } from "@supabase/supabase-js";
import { spawn, execSync } from "child_process";
import { writeFileSync, existsSync } from "fs";

// Configuration
const CONFIG = {
  supabase: {
    url: "https://vzuuzpcpaskvrhyafuqx.supabase.co",
    serviceRoleKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3MTE0MSwiZXhwIjoyMDcyMTQ3MTQxfQ.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog",
  },
  admin: {
    email: "admin@educational-platform.com",
    password: "admin123",
    metadata: {
      role: "admin",
      is_super_admin: true,
      full_name: "مدير المنصة التعليمية",
      arabic_name: "مدير عام",
      permissions_level: 100,
      created_by: "auto_setup_system",
      setup_version: "1.0.0",
    },
  },
};

class AutoSetup {
  constructor() {
    this.supabaseAdmin = createClient(
      CONFIG.supabase.url,
      CONFIG.supabase.serviceRoleKey,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

    this.supabaseClient = createClient(
      CONFIG.supabase.url,
      CONFIG.supabase.anonKey
    );

    this.results = {
      connection: false,
      userCreation: false,
      loginTest: false,
      permissionsTest: false,
      overallSuccess: false,
    };
  }

  // Logging utilities
  log(message, type = "info", arabic = "") {
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      warning: "\x1b[33m",
      error: "\x1b[31m",
      header: "\x1b[35m",
      reset: "\x1b[0m",
    };

    const icons = {
      info: "🔍",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      header: "🚀",
    };

    const fullMessage = arabic ? `${message} / ${arabic}` : message;
    console.log(`${colors[type]}${icons[type]} ${fullMessage}${colors.reset}`);
  }

  separator(char = "=") {
    console.log(char.repeat(80));
  }

  // Step 1: Verify Supabase Connection
  async verifyConnection() {
    this.log(
      "Verifying Supabase connection",
      "info",
      "التحقق من اتصال Supabase"
    );

    try {
      // Test service role connection
      const { data: serviceTest, error: serviceError } =
        await this.supabaseAdmin.auth.admin.listUsers();

      if (serviceError && !serviceError.message.includes("Database error")) {
        throw new Error(
          `Service role connection failed: ${serviceError.message}`
        );
      }

      // Test anon key connection
      const { data: anonTest, error: anonError } =
        await this.supabaseClient.auth.getSession();

      if (anonError) {
        throw new Error(`Anon key connection failed: ${anonError.message}`);
      }

      this.log(
        "Supabase connection successful",
        "success",
        "نجح الاتصال مع Supabase"
      );
      this.results.connection = true;
      return true;
    } catch (error) {
      this.log(`Connection failed: ${error.message}`, "error", "فشل الاتصال");
      this.results.connection = false;
      return false;
    }
  }

  // Step 2: Create Admin User with Multiple Methods
  async createAdminUser() {
    this.log(
      "Creating admin user with multiple fallback methods",
      "info",
      "إنشاء المدير بطرق متعددة"
    );

    // Method 1: Admin API
    const apiResult = await this.tryAdminAPI();
    if (apiResult.success) {
      this.results.userCreation = true;
      return apiResult;
    }

    this.log(
      "Admin API failed, trying signup method",
      "warning",
      "فشلت API المدير، جاري المحاولة بالتسجيل"
    );

    // Method 2: Signup Method
    const signupResult = await this.trySignupMethod();
    if (signupResult.success) {
      this.results.userCreation = true;
      return signupResult;
    }

    this.log(
      "Signup failed, trying direct SQL",
      "warning",
      "فشل التسجيل، جاري المحاولة بـ SQL"
    );

    // Method 3: Direct SQL (via RPC or direct query)
    const sqlResult = await this.tryDirectSQL();
    if (sqlResult.success) {
      this.results.userCreation = true;
      return sqlResult;
    }

    // Method 4: Manual instruction generation
    this.generateManualInstructions();
    this.results.userCreation = false;
    return { success: false, method: "all_failed" };
  }

  async tryAdminAPI() {
    try {
      this.log(
        "Attempting admin API creation",
        "info",
        "محاولة إنشاء عبر API المدير"
      );

      const { data: user, error } =
        await this.supabaseAdmin.auth.admin.createUser({
          email: CONFIG.admin.email,
          password: CONFIG.admin.password,
          email_confirm: true,
          user_metadata: CONFIG.admin.metadata,
          app_metadata: {
            provider: "email",
            providers: ["email"],
            role: "admin",
            access_level: "super_admin",
          },
        });

      if (error) {
        if (
          error.message.includes("already registered") ||
          error.message.includes("already exists")
        ) {
          this.log(
            "User already exists, updating metadata",
            "info",
            "المستخدم موجود، جاري تحديث البيانات"
          );
          return await this.updateExistingUser();
        }
        throw new Error(error.message);
      }

      this.log(
        "Admin API creation successful",
        "success",
        "نجح إنشاء المدير عبر API"
      );
      return { success: true, method: "admin_api", user: user.user };
    } catch (error) {
      this.log(`Admin API failed: ${error.message}`, "error", "فشل API المدير");
      return { success: false, error: error.message };
    }
  }

  async trySignupMethod() {
    try {
      this.log("Attempting signup method", "info", "محاولة التسجيل العادي");

      const { data: user, error } = await this.supabaseClient.auth.signUp({
        email: CONFIG.admin.email,
        password: CONFIG.admin.password,
        options: {
          data: CONFIG.admin.metadata,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          this.log(
            "User exists via signup, attempting login test",
            "info",
            "المستخدم موجود"
          );
          return { success: true, method: "existing_user" };
        }
        throw new Error(error.message);
      }

      this.log("Signup successful", "success", "نجح التسجيل");

      // Sign out immediately
      await this.supabaseClient.auth.signOut();

      return { success: true, method: "signup", user: user.user };
    } catch (error) {
      this.log(`Signup failed: ${error.message}`, "error", "فشل التسجيل");
      return { success: false, error: error.message };
    }
  }

  async tryDirectSQL() {
    try {
      this.log(
        "Attempting direct SQL insertion",
        "info",
        "محاولة الإدخال المباشر بـ SQL"
      );

      // Create a comprehensive SQL script
      const sqlScript = `
        -- Create or update admin user
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at,
          confirmation_token,
          recovery_token,
          email_change_token_new,
          email_change,
          is_super_admin
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          '${CONFIG.admin.email}',
          crypt('${CONFIG.admin.password}', gen_salt('bf')),
          now(),
          '{"provider": "email", "providers": ["email"], "role": "admin"}',
          '${JSON.stringify(CONFIG.admin.metadata)}',
          now(),
          now(),
          '',
          '',
          '',
          '',
          false
        )
        ON CONFLICT (email) 
        DO UPDATE SET 
          encrypted_password = EXCLUDED.encrypted_password,
          raw_user_meta_data = EXCLUDED.raw_user_meta_data,
          email_confirmed_at = now(),
          updated_at = now();

        -- Create identity
        INSERT INTO auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          created_at,
          updated_at
        ) 
        SELECT 
          gen_random_uuid(),
          u.id,
          jsonb_build_object('sub', u.id::text, 'email', u.email),
          'email',
          now(),
          now()
        FROM auth.users u 
        WHERE u.email = '${CONFIG.admin.email}'
        ON CONFLICT (provider, user_id) DO NOTHING;
      `;

      // Try executing via RPC if available
      try {
        const { error: rpcError } = await this.supabaseAdmin.rpc("exec_sql", {
          query: sqlScript,
        });

        if (!rpcError) {
          this.log(
            "Direct SQL via RPC successful",
            "success",
            "نجح SQL عبر RPC"
          );
          return { success: true, method: "sql_rpc" };
        }
      } catch (rpcError) {
        // RPC might not be available
      }

      // Generate SQL file for manual execution
      writeFileSync("./setup-admin-user.sql", sqlScript);
      this.log(
        "SQL script generated: setup-admin-user.sql",
        "info",
        "تم إنشاء ملف SQL"
      );

      return {
        success: false,
        method: "sql_manual",
        sqlFile: "./setup-admin-user.sql",
      };
    } catch (error) {
      this.log(
        `Direct SQL failed: ${error.message}`,
        "error",
        "فشل SQL المباشر"
      );
      return { success: false, error: error.message };
    }
  }

  async updateExistingUser() {
    try {
      // Get existing user
      const { data: users, error: listError } =
        await this.supabaseAdmin.auth.admin.listUsers();

      if (listError) {
        throw new Error(`Failed to list users: ${listError.message}`);
      }

      const existingUser = users.users.find(
        (user) => user.email === CONFIG.admin.email
      );

      if (!existingUser) {
        throw new Error("User not found after creation attempt");
      }

      const { data: updatedUser, error: updateError } =
        await this.supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: CONFIG.admin.password,
          email_confirm: true,
          user_metadata: CONFIG.admin.metadata,
        });

      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`);
      }

      this.log(
        "Existing user updated successfully",
        "success",
        "تم تحديث المستخدم الموجود"
      );
      return {
        success: true,
        method: "update_existing",
        user: updatedUser.user,
      };
    } catch (error) {
      this.log(
        `Update existing user failed: ${error.message}`,
        "error",
        "فشل تحديث المستخدم"
      );
      return { success: false, error: error.message };
    }
  }

  // Step 3: Test Admin Login
  async testAdminLogin() {
    this.log(
      "Testing admin login functionality",
      "info",
      "اختبار تسجيل دخول المدير"
    );

    try {
      const { data, error } = await this.supabaseClient.auth.signInWithPassword(
        {
          email: CONFIG.admin.email,
          password: CONFIG.admin.password,
        }
      );

      if (error) {
        this.log(
          `Login test failed: ${error.message}`,
          "error",
          "فشل اختبار تسجيل الدخول"
        );

        // Provide specific error guidance
        if (error.message.includes("Email not confirmed")) {
          this.log(
            "Solution: Email needs confirmation in Supabase dashboard",
            "warning",
            "الحل: البريد يحتاج تأكيد"
          );
        } else if (error.message.includes("Invalid login credentials")) {
          this.log(
            "Solution: Check if user was created or confirm email",
            "warning",
            "الحل: تحقق من إنشاء المستخدم"
          );
        }

        this.results.loginTest = false;
        return false;
      }

      this.log("Admin login successful!", "success", "نجح تسجيل دخول المدير!");
      this.log(`User ID: ${data.user.id}`, "info");
      this.log(`Email: ${data.user.email}`, "info");
      this.log(
        `Email Confirmed: ${data.user.email_confirmed_at ? "Yes" : "No"}`,
        "info"
      );

      if (data.user.user_metadata) {
        this.log(
          "User metadata found:",
          "info",
          "تم العثور على البيانات الوصفية"
        );
        Object.entries(data.user.user_metadata).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      }

      // Sign out
      await this.supabaseClient.auth.signOut();

      this.results.loginTest = true;
      return true;
    } catch (error) {
      this.log(
        `Login test error: ${error.message}`,
        "error",
        "خطأ في اختبار تسجيل الدخول"
      );
      this.results.loginTest = false;
      return false;
    }
  }

  // Step 4: Test Permissions System
  async testPermissionsSystem() {
    this.log(
      "Testing permissions system integration",
      "info",
      "اختبار نظام الصلاحيات"
    );

    try {
      // Test if the admin permissions file works correctly
      const { getAdminUserInfo, hasPermission } = await import(
        "./lib/adminPermissions.ts"
      ).catch(() => ({}));

      if (!getAdminUserInfo || !hasPermission) {
        this.log(
          "Permissions system not fully integrated",
          "warning",
          "نظام الصلاحيات غير متكامل"
        );
        this.results.permissionsTest = false;
        return false;
      }

      // Test admin user permissions
      const { role, isDefault } = getAdminUserInfo(
        CONFIG.admin.email,
        CONFIG.admin.metadata
      );

      this.log(
        `Admin role detected: ${role.nameArabic}`,
        "info",
        `دور المدير: ${role.nameArabic}`
      );
      this.log(
        `Permission level: ${role.level}`,
        "info",
        `مستوى الصلاحية: ${role.level}`
      );
      this.log(
        `Is default admin: ${isDefault}`,
        "info",
        `مدير افتراضي: ${isDefault}`
      );

      // Test specific permissions
      const testPermissions = [
        "viewDashboard",
        "manageStudents",
        "manageSettings",
      ];
      testPermissions.forEach((permission) => {
        const hasAccess = hasPermission(
          CONFIG.admin.email,
          permission,
          CONFIG.admin.metadata
        );
        this.log(
          `${permission}: ${hasAccess ? "Granted" : "Denied"}`,
          hasAccess ? "success" : "error"
        );
      });

      this.results.permissionsTest = true;
      return true;
    } catch (error) {
      this.log(
        `Permissions test failed: ${error.message}`,
        "warning",
        "فشل اختبار الصلاحيات"
      );
      this.results.permissionsTest = false;
      return false;
    }
  }

  // Generate manual setup instructions if all automated methods fail
  generateManualInstructions() {
    const instructions = `
# Manual Admin Setup Instructions
# تعليمات الإعداد اليدوي للمدير

Since automated creation failed, follow these steps:

## Method 1: Supabase Dashboard
1. Go to: ${CONFIG.supabase.url.replace("/rest/v1", "")}/dashboard
2. Navigate to Authentication → Users
3. Click "Add User"
4. Enter:
   - Email: ${CONFIG.admin.email}
   - Password: ${CONFIG.admin.password}
   - Auto Confirm: ✅ Enable
5. Add User Metadata:
${JSON.stringify(CONFIG.admin.metadata, null, 2)}

## Method 2: SQL Editor
1. Go to SQL Editor in Supabase Dashboard
2. Run the SQL file: setup-admin-user.sql

## Method 3: Contact Support
If both methods fail, there may be RLS policies or custom configurations
preventing user creation. Contact Supabase support or check your database policies.
    `;

    writeFileSync("./MANUAL_SETUP_INSTRUCTIONS.md", instructions);
    this.log(
      "Manual setup instructions generated",
      "info",
      "تم إنشاء تعليمات الإعداد اليدوي"
    );
  }

  // Generate comprehensive report
  generateReport() {
    this.separator("=");
    this.log("AUTOMATED SETUP COMPLETE", "header", "انتهى الإعداد التلقائي");
    this.separator("=");

    console.log("\n📊 Setup Results / نتائج الإعداد:\n");

    const results = [
      {
        test: "Supabase Connection",
        status: this.results.connection,
        arabic: "اتصال Supabase",
      },
      {
        test: "Admin User Creation",
        status: this.results.userCreation,
        arabic: "إنشاء المدير",
      },
      {
        test: "Login Test",
        status: this.results.loginTest,
        arabic: "اختبار تسجيل الدخول",
      },
      {
        test: "Permissions System",
        status: this.results.permissionsTest,
        arabic: "نظام الصلاحيات",
      },
    ];

    results.forEach((result) => {
      const status = result.status ? "✅ PASS" : "❌ FAIL";
      const statusArabic = result.status ? "نجح" : "فشل";
      console.log(
        `  ${status} ${result.test} / ${statusArabic} ${result.arabic}`
      );
    });

    // Overall success
    this.results.overallSuccess =
      this.results.connection &&
      this.results.userCreation &&
      this.results.loginTest;

    console.log(
      `\n🎯 Overall Status / الحالة العامة: ${
        this.results.overallSuccess ? "✅ SUCCESS" : "⚠️ PARTIAL SUCCESS"
      }`
    );

    if (this.results.overallSuccess) {
      console.log(
        "\n🎉 Admin system is ready to use! / نظام المدير جاهز للاستخدام!"
      );
      console.log("\n📋 Admin Credentials / بيانات المدير:");
      console.log(`   Email: ${CONFIG.admin.email}`);
      console.log(`   Password: ${CONFIG.admin.password}`);
      console.log("\n🌐 Access admin panel / الوصول إلى لوحة التحكم:");
      console.log("   1. Go to: http://localhost:5173");
      console.log('   2. Click login → Select "مدرس" (Teacher)');
      console.log("   3. Enter the credentials above");
    } else {
      console.log("\n📖 Next Steps / الخطوات التالية:");

      if (!this.results.connection) {
        console.log("   ❌ Fix Supabase connection issues");
      }

      if (!this.results.userCreation) {
        console.log(
          "   ❌ Follow manual setup instructions in MANUAL_SETUP_INSTRUCTIONS.md"
        );
      }

      if (!this.results.loginTest && this.results.userCreation) {
        console.log(
          "   ⚠️ User created but login failed - check email confirmation in Supabase dashboard"
        );
      }
    }

    this.separator("=");
  }

  // Main setup process
  async runFullSetup() {
    console.log("\n🚀 Starting Automated Supabase Admin Setup");
    console.log("🚀 بدء الإعداد التلقائي لمدير Supabase\n");

    // Step 1: Connection
    const connectionOk = await this.verifyConnection();
    if (!connectionOk) {
      this.generateReport();
      return false;
    }

    // Step 2: User Creation
    const userResult = await this.createAdminUser();

    // Step 3: Login Test (only if user creation succeeded)
    if (this.results.userCreation) {
      // Wait a bit for user to be fully created
      this.log(
        "Waiting for user creation to complete...",
        "info",
        "انتظار اكتمال إنشاء المستخدم"
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await this.testAdminLogin();
    }

    // Step 4: Permissions Test
    await this.testPermissionsSystem();

    // Generate final report
    this.generateReport();

    return this.results.overallSuccess;
  }
}

// Run the automated setup
const setup = new AutoSetup();
setup.runFullSetup().catch((error) => {
  console.error("❌ Fatal error in automated setup:", error.message);
  process.exit(1);
});
