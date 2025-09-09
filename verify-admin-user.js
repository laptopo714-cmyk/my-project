// Supabase Admin User Verification Script
// يستخدم هذا الملف للتحقق من وجود حساب المدير في Supabase

import { createClient } from "@supabase/supabase-js";

// استخدم نفس بيانات الاتصال من ملف supabaseClient.ts
const supabaseUrl = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAdminLogin() {
  console.log("🔍 التحقق من حساب المدير...");
  console.log("🔍 Verifying admin account...");

  try {
    // محاولة تسجيل الدخول بحساب المدير
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@educational-platform.com",
      password: "admin123",
    });

    if (error) {
      console.error("❌ فشل تسجيل الدخول:", error.message);
      console.error("❌ Login failed:", error.message);

      // اقتراح الحلول
      console.log("\n💡 الحلول المحتملة / Possible solutions:");
      console.log(
        "1. تأكد من إنشاء المستخدم في Supabase / Ensure user is created in Supabase"
      );
      console.log(
        "2. تحقق من تأكيد البريد الإلكتروني / Check email confirmation"
      );
      console.log("3. راجع كلمة المرور / Verify password");

      return false;
    }

    if (data.user) {
      console.log("✅ تم تسجيل الدخول بنجاح!");
      console.log("✅ Login successful!");
      console.log("\n👤 معلومات المستخدم / User Info:");
      console.log("- ID:", data.user.id);
      console.log("- Email:", data.user.email);
      console.log(
        "- Email Confirmed:",
        data.user.email_confirmed_at ? "Yes ✅" : "No ❌"
      );
      console.log(
        "- Created:",
        new Date(data.user.created_at).toLocaleString()
      );

      // عرض البيانات الوصفية
      console.log("\n📋 البيانات الوصفية / Metadata:");
      console.log(
        "- User Metadata:",
        JSON.stringify(data.user.user_metadata, null, 2)
      );
      console.log(
        "- App Metadata:",
        JSON.stringify(data.user.app_metadata, null, 2)
      );

      // تسجيل الخروج بعد التحقق
      await supabase.auth.signOut();
      console.log("\n🚪 تم تسجيل الخروج تلقائياً");
      console.log("🚪 Automatically signed out");

      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ خطأ غير متوقع:", error);
    console.error("❌ Unexpected error:", error);
    return false;
  }
}

async function checkUserExists() {
  console.log("\n🔍 البحث عن المستخدم باستخدام Service Role...");
  console.log("🔍 Looking for user using Service Role...");

  // ملاحظة: هذا يتطلب service_role key
  console.log("⚠️  يتطلب هذا service_role key من Supabase Dashboard");
  console.log("⚠️  This requires service_role key from Supabase Dashboard");
  console.log("📍 Settings > API > service_role key");
}

// تشغيل التحقق
async function main() {
  console.log("🚀 بدء التحقق من حساب المدير");
  console.log("🚀 Starting admin account verification");
  console.log("=".repeat(50));

  const loginSuccess = await verifyAdminLogin();

  if (loginSuccess) {
    console.log("\n🎉 حساب المدير جاهز للاستخدام!");
    console.log("🎉 Admin account is ready to use!");
    console.log("\n📝 بيانات تسجيل الدخول / Login Credentials:");
    console.log("- البريد الإلكتروني / Email: admin@educational-platform.com");
    console.log("- كلمة المرور / Password: admin123");
    console.log("- الدور / Role: Super Administrator (مدير عام)");

    console.log("\n🌐 للوصول إلى لوحة التحكم / To access admin panel:");
    console.log("1. اذهب إلى الموقع / Go to website: http://localhost:5173");
    console.log("2. انقر على تسجيل الدخول / Click login");
    console.log('3. اختر "مدرس" / Select "Teacher"');
    console.log("4. أدخل بيانات تسجيل الدخول / Enter credentials");
  } else {
    console.log("\n📚 راجع دليل الإعداد في الملفات التالية:");
    console.log("📚 Check setup guide in these files:");
    console.log("- SUPABASE_ADMIN_SETUP_GUIDE.md");
    console.log("- supabase-admin-setup.sql");
    console.log("- create-admin-user.js");

    await checkUserExists();
  }

  console.log("\n" + "=".repeat(50));
  console.log("✨ انتهى التحقق");
  console.log("✨ Verification complete");
}

// تشغيل الملف
main().catch(console.error);

// تصدير الدوال للاستخدام اليدوي
export { verifyAdminLogin, checkUserExists };
