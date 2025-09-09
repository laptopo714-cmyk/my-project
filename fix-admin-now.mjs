#!/usr/bin/env node
/**
 * Quick Admin Fix Script
 * سكريبت الإصلاح السريع للمدير
 *
 * This script specifically addresses the ON CONFLICT error
 * and creates the admin user safely
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

const SUPABASE_URL = "https://vzuuzpcpaskvrhyafuqx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3MTE0MSwiZXhwIjoyMDcyMTQ3MTQxfQ.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.UE6EESSrqDRmQoOIfq9EOSXoGm1jMkJTwEXfPFvtIog";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const log = (message, type = "info") => {
  const colors = {
    info: "\x1b[36m🔵",
    success: "\x1b[32m✅",
    warning: "\x1b[33m⚠️",
    error: "\x1b[31m❌",
    reset: "\x1b[0m",
  };
  console.log(`${colors[type]} ${message}${colors.reset}`);
};

async function createAdminDirectly() {
  log("بدء الإصلاح السريع للمدير... / Starting quick admin fix...");

  // Generate the safe SQL that doesn't use ON CONFLICT
  const safeSQL = `
    -- Safe Admin Creation Script (No ON CONFLICT)
    DO $$
    DECLARE
        existing_user_id UUID;
        new_user_id UUID;
        existing_identity_id UUID;
    BEGIN
        -- Step 1: Check for existing user
        SELECT id INTO existing_user_id FROM auth.users WHERE email = 'admin@educational-platform.com';
        
        IF existing_user_id IS NOT NULL THEN
            -- Update existing user
            RAISE NOTICE 'تحديث المستخدم الموجود / Updating existing user';
            UPDATE auth.users 
            SET 
                encrypted_password = crypt('admin123', gen_salt('bf')),
                raw_user_meta_data = '{"role": "admin", "is_super_admin": true, "full_name": "مدير المنصة التعليمية", "arabic_name": "مدير عام", "permissions_level": 100, "created_by": "quick_fix"}',
                email_confirmed_at = COALESCE(email_confirmed_at, now()),
                updated_at = now(),
                raw_app_meta_data = '{"provider": "email", "providers": ["email"], "role": "admin"}'
            WHERE id = existing_user_id;
            
            new_user_id := existing_user_id;
        ELSE
            -- Create new user
            RAISE NOTICE 'إنشاء مستخدم جديد / Creating new user';
            new_user_id := gen_random_uuid();
            
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password,
                email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                created_at, updated_at, confirmation_token, recovery_token,
                email_change_token_new, email_change, is_super_admin
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                new_user_id,
                'authenticated',
                'authenticated', 
                'admin@educational-platform.com',
                crypt('admin123', gen_salt('bf')),
                now(),
                '{"provider": "email", "providers": ["email"], "role": "admin"}',
                '{"role": "admin", "is_super_admin": true, "full_name": "مدير المنصة التعليمية", "arabic_name": "مدير عام", "permissions_level": 100, "created_by": "quick_fix"}',
                now(),
                now(),
                '',
                '',
                '',
                '',
                false
            );
        END IF;
        
        -- Step 2: Handle identity
        SELECT id INTO existing_identity_id FROM auth.identities 
        WHERE user_id = new_user_id AND provider = 'email';
        
        IF existing_identity_id IS NOT NULL THEN
            -- Update existing identity
            UPDATE auth.identities 
            SET 
                identity_data = jsonb_build_object(
                    'sub', new_user_id::text,
                    'email', 'admin@educational-platform.com',
                    'provider', 'email',
                    'email_verified', true
                ),
                updated_at = now()
            WHERE id = existing_identity_id;
        ELSE
            -- Create new identity
            INSERT INTO auth.identities (
                id, user_id, identity_data, provider, created_at, updated_at
            ) VALUES (
                gen_random_uuid(),
                new_user_id,
                jsonb_build_object(
                    'sub', new_user_id::text,
                    'email', 'admin@educational-platform.com',
                    'provider', 'email',
                    'email_verified', true
                ),
                'email',
                now(),
                now()
            );
        END IF;
        
        RAISE NOTICE '✅ تم إعداد المدير بنجاح! / Admin setup completed!';
        RAISE NOTICE 'Email: admin@educational-platform.com';
        RAISE NOTICE 'Password: admin123';
    END $$;
  `;

  // Save SQL to file for manual execution
  writeFileSync("./run-this-in-supabase.sql", safeSQL);
  log("تم إنشاء ملف SQL للتشغيل اليدوي: run-this-in-supabase.sql", "info");

  console.log("\n🎯 SOLUTION / الحل:");
  console.log("================================================");
  console.log("1. Go to Supabase Dashboard → SQL Editor");
  console.log("   اذهب إلى لوحة Supabase → محرر SQL");
  console.log("");
  console.log("2. Copy and paste the content from: run-this-in-supabase.sql");
  console.log("   انسخ والصق المحتوى من: run-this-in-supabase.sql");
  console.log("");
  console.log('3. Click "Run" to execute');
  console.log('   انقر "Run" للتشغيل');
  console.log("");
  console.log("4. Test with: node admin-manager.mjs test");
  console.log("   اختبر بـ: node admin-manager.mjs test");
  console.log("================================================");

  return true;
}

async function testConnection() {
  log("اختبار الاتصال... / Testing connection...");

  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      log(`خطأ في الاتصال: ${error.message}`, "error");
      return false;
    }
    log("الاتصال ناجح! / Connection successful!", "success");
    return true;
  } catch (err) {
    log(`خطأ في الاتصال: ${err.message}`, "error");
    return false;
  }
}

async function testAdminLogin() {
  log("اختبار تسجيل دخول المدير... / Testing admin login...");

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: "admin@educational-platform.com",
      password: "admin123",
    });

    if (error) {
      log(`فشل تسجيل الدخول: ${error.message}`, "error");
      if (error.message.includes("Invalid login credentials")) {
        log("المستخدم غير موجود أو كلمة المرور خاطئة", "warning");
        log("User doesn't exist or wrong password", "warning");
      }
      return false;
    }

    log("نجح تسجيل الدخول! / Login successful!", "success");
    log(`User ID: ${data.user.id}`);
    log(`Email: ${data.user.email}`);

    await supabaseClient.auth.signOut();
    return true;
  } catch (err) {
    log(`خطأ في اختبار تسجيل الدخول: ${err.message}`, "error");
    return false;
  }
}

async function main() {
  console.log("🔧 Quick Admin Fix Tool / أداة الإصلاح السريع للمدير");
  console.log("=".repeat(60));

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    log("فشل الاتصال مع Supabase", "error");
    return;
  }

  // Test current admin login
  const loginWorks = await testAdminLogin();

  if (loginWorks) {
    log(
      "المدير موجود ويعمل بشكل صحيح! / Admin exists and works correctly!",
      "success"
    );
    console.log("\n🎉 يمكنك الوصول إلى لوحة التحكم:");
    console.log("🎉 You can access admin panel at:");
    console.log("   http://localhost:5173");
    console.log("   Email: admin@educational-platform.com");
    console.log("   Password: admin123");
  } else {
    log("المدير غير موجود، إنشاء ملف الإصلاح...", "warning");
    log("Admin not found, creating fix file...", "warning");
    await createAdminDirectly();
  }
}

main().catch((error) => {
  log(`خطأ عام: ${error.message}`, "error");
  process.exit(1);
});
