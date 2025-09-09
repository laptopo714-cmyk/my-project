import { createClient } from "@supabase/supabase-js";

// رابط المشروع و Service Role Key
const supabaseAdmin = createClient(
  "https://vzuuzpcpaskvrhyafuqx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2VsX3JvbGUiLCJpYXQiOjE3NTY1NzExNDEsImV4cCI6MjA3MjE0NzE0MX0.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY"
);

async function deleteAllUsersExceptAdmin() {
  try {
    // استرجاع كل المستخدمين ما عدا الادمن
    const { data: users, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .neq("email", "admin@educational-platform.com");

    if (fetchError) throw fetchError;

    if (users.length === 0) {
      console.log("لا يوجد مستخدمين للحذف.");
      return;
    }

    for (const user of users) {
      const { error: deleteError } = await supabaseAdmin
        .from("users")
        .delete()
        .eq("id", user.id);

      if (deleteError) {
        console.log(`فشل حذف المستخدم: ${user.email}`, deleteError);
      } else {
        console.log(`تم حذف المستخدم: ${user.email}`);
      }
    }

    console.log("تم الانتهاء من حذف جميع المستخدمين ما عدا الادمن.");
  } catch (err) {
    console.error("حدث خطأ:", err);
  }
}

deleteAllUsersExceptAdmin();
