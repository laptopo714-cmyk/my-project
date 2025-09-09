// Supabase Admin User Creation Script (ES6 Module)
// This script creates the official admin user in Supabase

import { createClient } from "@supabase/supabase-js";

// Your actual Supabase project credentials
const SUPABASE_URL = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3MTE0MSwiZXhwIjoyMDcyMTQ3MTQxfQ.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY";

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  try {
    console.log("🚀 إنشاء حساب المدير الرسمي...");
    console.log("🚀 Creating official admin user...\n");

    // Create user using Supabase Auth Admin API
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@educational-platform.com",
      password: "admin123",
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: "مدير المنصة التعليمية",
        role: "admin",
        is_super_admin: true,
        created_by: "automated_setup",
        arabic_name: "مدير عام",
        created_at: new Date().toISOString(),
      },
      app_metadata: {
        provider: "email",
        providers: ["email"],
        role: "admin",
        access_level: "super_admin",
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        console.log("⚠️  المستخدم موجود مسبقاً، جاري تحديث البيانات...");
        console.log("⚠️  User already exists, updating data...\n");
        return await updateExistingUser();
      }

      console.error("❌ خطأ في إنشاء المستخدم:", error.message);
      console.error("❌ Error creating user:", error.message);
      return false;
    }

    console.log("✅ تم إنشاء حساب المدير بنجاح!");
    console.log("✅ Admin user created successfully!\n");

    console.log("📋 معلومات الحساب الجديد:");
    console.log("📋 New account information:");
    console.log("- User ID:", user.user.id);
    console.log("- Email:", user.user.email);
    console.log(
      "- Email Confirmed:",
      user.user.email_confirmed_at ? "نعم ✅" : "لا ❌"
    );
    console.log(
      "- Created:",
      new Date(user.user.created_at).toLocaleString("ar-EG")
    );
    console.log("- Role:", user.user.user_metadata?.role);
    console.log(
      "- Super Admin:",
      user.user.user_metadata?.is_super_admin ? "نعم ✅" : "لا ❌"
    );

    return true;
  } catch (error) {
    console.error("❌ خطأ غير متوقع:", error.message);
    console.error("❌ Unexpected error:", error.message);
    return false;
  }
}

async function updateExistingUser() {
  try {
    // Get existing user
    const { data: users, error: getUserError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (getUserError) {
      console.error(
        "خطأ في الحصول على قائمة المستخدمين:",
        getUserError.message
      );
      return false;
    }

    const adminUser = users.users.find(
      (user) => user.email === "admin@educational-platform.com"
    );

    if (!adminUser) {
      console.log("المستخدم غير موجود، جاري إنشاؤه...");
      return await createAdminUser();
    }

    console.log("🔄 تحديث المستخدم الموجود...");
    console.log("🔄 Updating existing user...");

    const { data: updatedUser, error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
        password: "admin123",
        email_confirm: true,
        user_metadata: {
          full_name: "مدير المنصة التعليمية",
          role: "admin",
          is_super_admin: true,
          updated_by: "automated_setup",
          arabic_name: "مدير عام",
          updated_at: new Date().toISOString(),
        },
      });

    if (updateError) {
      console.error("❌ خطأ في تحديث المستخدم:", updateError.message);
      return false;
    }

    console.log("✅ تم تحديث حساب المدير بنجاح!");
    console.log("✅ Admin user updated successfully!");
    console.log("- User ID:", updatedUser.user.id);

    return true;
  } catch (error) {
    console.error("❌ خطأ في التحديث:", error.message);
    return false;
  }
}

async function testAdminLogin() {
  try {
    console.log("\n🧪 اختبار تسجيل دخول المدير...");
    console.log("🧪 Testing admin login...");

    // Create a regular client for login testing
    const supabaseTest = createClient(
      SUPABASE_URL,
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog"
    );

    const { data: loginData, error: loginError } =
      await supabaseTest.auth.signInWithPassword({
        email: "admin@educational-platform.com",
        password: "admin123",
      });

    if (loginError) {
      console.error("❌ فشل اختبار تسجيل الدخول:", loginError.message);
      console.error("❌ Login test failed:", loginError.message);
      return false;
    }

    console.log("✅ نجح اختبار تسجيل الدخول!");
    console.log("✅ Login test successful!");
    console.log(
      "- Access Token:",
      loginData.session?.access_token ? "متوفر ✅" : "غير متوفر ❌"
    );
    console.log(
      "- Session Expires:",
      new Date(loginData.session?.expires_at * 1000).toLocaleString("ar-EG")
    );

    // Sign out test session
    await supabaseTest.auth.signOut();
    console.log("- تم تسجيل الخروج من جلسة الاختبار");
    console.log("- Test session signed out");

    return true;
  } catch (error) {
    console.error("❌ خطأ في اختبار تسجيل الدخول:", error.message);
    return false;
  }
}

async function main() {
  console.log("🎯 إعداد حساب المدير الرسمي في Supabase");
  console.log("🎯 Setting up official admin account in Supabase");
  console.log("=".repeat(60));
  console.log(`📍 المشروع: ${SUPABASE_URL}`);
  console.log(`📧 البريد الإلكتروني: admin@educational-platform.com`);
  console.log(`🔑 كلمة المرور: admin123\n`);

  // Create or update admin user
  const success = await createAdminUser();

  if (success) {
    // Test login functionality
    const loginTest = await testAdminLogin();

    if (loginTest) {
      console.log("\n🎉 تم إعداد حساب المدير بنجاح!");
      console.log("🎉 Admin account setup completed successfully!");
      console.log("\n📱 للوصول إلى لوحة التحكم:");
      console.log("📱 To access admin dashboard:");
      console.log("1. اذهب إلى: http://localhost:5173");
      console.log('2. اختر "تسجيل الدخول"');
      console.log('3. اختر "مدرس"');
      console.log("4. أدخل البيانات المذكورة أعلاه");

      console.log("\n✨ يمكنك الآن استخدام لوحة التحكم مع جميع الصلاحيات!");
      console.log(
        "✨ You can now use the admin dashboard with full permissions!"
      );
    } else {
      console.log("\n⚠️  تم إنشاء الحساب ولكن فشل اختبار تسجيل الدخول");
      console.log("⚠️  Account created but login test failed");
      console.log("يرجى المحاولة يدوياً في التطبيق");
    }
  } else {
    console.log("\n❌ فشل في إعداد حساب المدير");
    console.log("❌ Failed to setup admin account");
    console.log("راجع الأخطاء أعلاه وحاول مرة أخرى");
  }

  console.log("\n" + "=".repeat(60));
  console.log("🏁 انتهى الإعداد");
  console.log("🏁 Setup complete");
}

// تشغيل الإعداد
main().catch(console.error);
