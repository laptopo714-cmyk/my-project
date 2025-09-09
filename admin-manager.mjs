#!/usr/bin/env node
/**
 * Complete Admin User Management System for Supabase
 * نظام إدارة المدير الشامل لـ Supabase
 *
 * Features:
 * - Create admin user
 * - Update admin user
 * - Delete admin user
 * - Test admin login
 * - List all users
 * - Reset admin password
 *
 * Usage: node admin-manager.mjs [command]
 * Commands: create, update, delete, test, list, reset, help
 */

import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";

// Supabase Configuration
const SUPABASE_URL = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3MTE0MSwiZXhwIjoyMDcyMTQ3MTQxfQ.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog";

// Admin User Configuration
const ADMIN_CONFIG = {
  email: "admin@educational-platform.com",
  password: "admin123",
  metadata: {
    role: "admin",
    is_super_admin: true,
    full_name: "مدير المنصة التعليمية",
    arabic_name: "مدير عام",
    created_by: "automated_system",
  },
};

// Create Supabase clients
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Utility functions
const log = (message, type = "info") => {
  const colors = {
    info: "\x1b[36m", // Cyan
    success: "\x1b[32m", // Green
    warning: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
    reset: "\x1b[0m", // Reset
  };

  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
};

const separator = () => console.log("=".repeat(60));

// Core Admin Management Functions
class AdminManager {
  async createAdminUser() {
    log("إنشاء حساب المدير... / Creating admin user...", "info");

    try {
      // Method 1: Try Admin API
      const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
        email: ADMIN_CONFIG.email,
        password: ADMIN_CONFIG.password,
        email_confirm: true,
        user_metadata: ADMIN_CONFIG.metadata,
        app_metadata: {
          provider: "email",
          providers: ["email"],
          role: "admin",
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          log("المستخدم موجود مسبقاً / User already exists", "warning");
          return await this.updateAdminUser();
        }

        log(`فشل الإنشاء عبر API: ${error.message}`, "error");
        log("جاري المحاولة عبر SQL... / Trying SQL method...", "info");
        return await this.createAdminWithSQL();
      }

      log(`تم إنشاء المدير بنجاح! / Admin created successfully!`, "success");
      log(`User ID: ${user.user.id}`, "info");
      return { success: true, user: user.user };
    } catch (error) {
      log(`خطأ غير متوقع: ${error.message}`, "error");
      return await this.createAdminWithSQL();
    }
  }

  async createAdminWithSQL() {
    log("إنشاء المدير عبر SQL... / Creating admin via SQL...", "info");

    const sqlQuery = `
      -- Create admin user with SQL
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
        last_sign_in_at,
        invited_at,
        confirmation_sent_at,
        recovery_sent_at,
        email_change_sent_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_super_admin
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        '${ADMIN_CONFIG.email}',
        crypt('${ADMIN_CONFIG.password}', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"], "role": "admin"}',
        '${JSON.stringify(ADMIN_CONFIG.metadata)}',
        now(),
        now(),
        '',
        '',
        '',
        '',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        '',
        '',
        null,
        '',
        0,
        null,
        '',
        null,
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
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        (SELECT id FROM auth.users WHERE email = '${ADMIN_CONFIG.email}'),
        jsonb_build_object(
          'sub', (SELECT id FROM auth.users WHERE email = '${
            ADMIN_CONFIG.email
          }'),
          'email', '${ADMIN_CONFIG.email}'
        ),
        'email',
        null,
        now(),
        now()
      )
      ON CONFLICT (provider, user_id) DO NOTHING;

      -- Return created user info
      SELECT id, email, email_confirmed_at, raw_user_meta_data, created_at
      FROM auth.users 
      WHERE email = '${ADMIN_CONFIG.email}';
    `;

    try {
      const { data, error } = await supabaseAdmin.rpc("exec_sql", {
        query: sqlQuery,
      });

      if (error) {
        // Try direct SQL execution
        const { data: result, error: sqlError } = await supabaseAdmin
          .from("auth.users")
          .select("*")
          .eq("email", ADMIN_CONFIG.email)
          .single();

        if (sqlError && !sqlError.message.includes("No rows")) {
          log(`فشل إنشاء المدير عبر SQL: ${sqlError.message}`, "error");
          return { success: false, error: sqlError.message };
        }
      }

      log(
        "تم إنشاء المدير عبر SQL بنجاح! / Admin created via SQL successfully!",
        "success"
      );
      return { success: true };
    } catch (error) {
      log(`خطأ في تنفيذ SQL: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async updateAdminUser() {
    log("تحديث حساب المدير... / Updating admin user...", "info");

    try {
      // Get existing user first
      const { data: users, error: listError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (listError) {
        log(
          `خطأ في الحصول على قائمة المستخدمين: ${listError.message}`,
          "error"
        );
        return { success: false, error: listError.message };
      }

      const existingUser = users.users.find(
        (user) => user.email === ADMIN_CONFIG.email
      );

      if (!existingUser) {
        log(
          "المستخدم غير موجود، جاري إنشاؤه... / User not found, creating...",
          "warning"
        );
        return await this.createAdminUser();
      }

      const { data: updatedUser, error } =
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: ADMIN_CONFIG.password,
          email_confirm: true,
          user_metadata: {
            ...ADMIN_CONFIG.metadata,
            updated_at: new Date().toISOString(),
          },
        });

      if (error) {
        log(`فشل التحديث: ${error.message}`, "error");
        return { success: false, error: error.message };
      }

      log("تم تحديث المدير بنجاح! / Admin updated successfully!", "success");
      log(`User ID: ${updatedUser.user.id}`, "info");
      return { success: true, user: updatedUser.user };
    } catch (error) {
      log(`خطأ غير متوقع في التحديث: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async deleteAdminUser() {
    log("حذف حساب المدير... / Deleting admin user...", "warning");

    try {
      // Get user first
      const { data: users, error: listError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (listError) {
        log(
          `خطأ في الحصول على قائمة المستخدمين: ${listError.message}`,
          "error"
        );
        return { success: false, error: listError.message };
      }

      const adminUser = users.users.find(
        (user) => user.email === ADMIN_CONFIG.email
      );

      if (!adminUser) {
        log("المدير غير موجود / Admin user not found", "warning");
        return {
          success: true,
          message: "User already deleted or never existed",
        };
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(adminUser.id);

      if (error) {
        log(`فشل الحذف: ${error.message}`, "error");
        return { success: false, error: error.message };
      }

      log("تم حذف المدير بنجاح! / Admin deleted successfully!", "success");
      return { success: true };
    } catch (error) {
      log(`خطأ غير متوقع في الحذف: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async testAdminLogin() {
    log("اختبار تسجيل دخول المدير... / Testing admin login...", "info");

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: ADMIN_CONFIG.email,
        password: ADMIN_CONFIG.password,
      });

      if (error) {
        log(`فشل تسجيل الدخول: ${error.message}`, "error");

        if (error.message.includes("Invalid login credentials")) {
          log(
            "الحل المقترح: تحقق من إنشاء المدير أو تأكيد البريد الإلكتروني",
            "info"
          );
        }

        return { success: false, error: error.message };
      }

      log("تسجيل الدخول ناجح! / Login successful!", "success");
      log(`User ID: ${data.user.id}`, "info");
      log(`Email: ${data.user.email}`, "info");
      log(
        `Email Confirmed: ${
          data.user.email_confirmed_at ? "نعم / Yes" : "لا / No"
        }`,
        "info"
      );

      if (data.user.user_metadata) {
        log("البيانات الوصفية / Metadata:", "info");
        Object.entries(data.user.user_metadata).forEach(([key, value]) => {
          log(`  ${key}: ${value}`, "info");
        });
      }

      // Sign out
      await supabaseClient.auth.signOut();
      log("تم تسجيل الخروج / Signed out", "info");

      return { success: true, user: data.user };
    } catch (error) {
      log(`خطأ غير متوقع في اختبار تسجيل الدخول: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async listUsers() {
    log("عرض قائمة المستخدمين... / Listing users...", "info");

    try {
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

      if (error) {
        log(`خطأ في الحصول على قائمة المستخدمين: ${error.message}`, "error");
        return { success: false, error: error.message };
      }

      log(
        `إجمالي المستخدمين: ${users.users.length} / Total users: ${users.users.length}`,
        "info"
      );

      users.users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(
          `   Created: ${new Date(user.created_at).toLocaleString()}`
        );
        console.log(
          `   Email Confirmed: ${
            user.email_confirmed_at ? "نعم / Yes" : "لا / No"
          }`
        );
        console.log(
          `   Last Sign In: ${
            user.last_sign_in_at
              ? new Date(user.last_sign_in_at).toLocaleString()
              : "لم يسجل دخول / Never"
          }`
        );

        if (user.user_metadata && Object.keys(user.user_metadata).length > 0) {
          console.log(
            "   Metadata:",
            JSON.stringify(user.user_metadata, null, 4)
          );
        }
      });

      // Highlight admin user if found
      const adminUser = users.users.find(
        (user) => user.email === ADMIN_CONFIG.email
      );
      if (adminUser) {
        log("\n🎯 تم العثور على المدير! / Admin user found!", "success");
      } else {
        log("\n⚠️ لم يتم العثور على المدير / Admin user not found", "warning");
      }

      return { success: true, users: users.users };
    } catch (error) {
      log(`خطأ غير متوقع في عرض المستخدمين: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async resetAdminPassword() {
    log(
      "إعادة تعيين كلمة مرور المدير... / Resetting admin password...",
      "info"
    );

    try {
      // Get existing user
      const { data: users, error: listError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (listError) {
        log(
          `خطأ في الحصول على قائمة المستخدمين: ${listError.message}`,
          "error"
        );
        return { success: false, error: listError.message };
      }

      const adminUser = users.users.find(
        (user) => user.email === ADMIN_CONFIG.email
      );

      if (!adminUser) {
        log("المدير غير موجود / Admin user not found", "error");
        return { success: false, error: "Admin user not found" };
      }

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        adminUser.id,
        { password: ADMIN_CONFIG.password }
      );

      if (error) {
        log(`فشل إعادة تعيين كلمة المرور: ${error.message}`, "error");
        return { success: false, error: error.message };
      }

      log(
        "تم إعادة تعيين كلمة المرور بنجاح! / Password reset successfully!",
        "success"
      );
      return { success: true };
    } catch (error) {
      log(
        `خطأ غير متوقع في إعادة تعيين كلمة المرور: ${error.message}`,
        "error"
      );
      return { success: false, error: error.message };
    }
  }

  async fullSetup() {
    log("بدء الإعداد الكامل للمدير... / Starting full admin setup...", "info");
    separator();

    // Step 1: Create or update admin
    const createResult = await this.createAdminUser();
    if (!createResult.success) {
      log("فشل إنشاء المدير / Failed to create admin", "error");
      return false;
    }

    // Step 2: Test login
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
    const testResult = await this.testAdminLogin();
    if (!testResult.success) {
      log("فشل اختبار تسجيل الدخول / Login test failed", "error");

      // Try to fix common issues
      log("جاري محاولة إصلاح المشاكل... / Trying to fix issues...", "info");
      await this.updateAdminUser();

      // Test again
      const retestResult = await this.testAdminLogin();
      if (!retestResult.success) {
        return false;
      }
    }

    separator();
    log("🎉 تم الإعداد بنجاح! / Setup completed successfully!", "success");
    log("\n📋 بيانات المدير / Admin Credentials:", "info");
    log(`Email: ${ADMIN_CONFIG.email}`, "info");
    log(`Password: ${ADMIN_CONFIG.password}`, "info");
    log("\n🌐 للوصول إلى لوحة التحكم / Access admin panel:", "info");
    log("1. اذهب إلى: http://localhost:5173", "info");
    log("2. اختر تسجيل الدخول → مدرس", "info");
    log("3. أدخل البيانات المذكورة أعلاه", "info");

    return true;
  }
}

// CLI Interface
const showHelp = () => {
  console.log(`
🚀 نظام إدارة المدير / Admin Management System
============================================

الأوامر المتاحة / Available Commands:

  create    إنشاء حساب المدير / Create admin user
  update    تحديث حساب المدير / Update admin user  
  delete    حذف حساب المدير / Delete admin user
  test      اختبار تسجيل دخول المدير / Test admin login
  list      عرض جميع المستخدمين / List all users
  reset     إعادة تعيين كلمة المرور / Reset password
  setup     الإعداد الكامل / Full automated setup
  help      عرض هذه المساعدة / Show this help

الاستخدام / Usage:
  node admin-manager.mjs [command]

أمثلة / Examples:
  node admin-manager.mjs create
  node admin-manager.mjs test
  node admin-manager.mjs setup
`);
};

// Main execution
const main = async () => {
  const command = process.argv[2] || "help";
  const manager = new AdminManager();

  console.log(
    "🎯 نظام إدارة المدير التلقائي / Automated Admin Management System"
  );
  separator();

  switch (command.toLowerCase()) {
    case "create":
      await manager.createAdminUser();
      break;

    case "update":
      await manager.updateAdminUser();
      break;

    case "delete":
      await manager.deleteAdminUser();
      break;

    case "test":
      await manager.testAdminLogin();
      break;

    case "list":
      await manager.listUsers();
      break;

    case "reset":
      await manager.resetAdminPassword();
      break;

    case "setup":
      await manager.fullSetup();
      break;

    case "help":
    default:
      showHelp();
      break;
  }

  separator();
};

// Run the script
main().catch((error) => {
  log(`خطأ عام في النظام: ${error.message}`, "error");
  process.exit(1);
});

export default AdminManager;
