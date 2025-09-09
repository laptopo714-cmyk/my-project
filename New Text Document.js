import { createClient } from "@supabase/supabase-js";

// افتح الاتصال مع الـ Service Role Key
const supabase = createClient(
  "https://vzuuzpcpaskvrhyafuqx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXV6cGNwYXNrdnJoeWFmdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3MTE0MSwiZXhwIjoyMDcyMTQ3MTQxfQ.R9jTYx4Ijq_emUR-pFNQ1HvXTHDG5C4_4yQrWjc50PY"
);

async function deleteAllExceptAdmin() {
  const { data, error } = await supabase
    .from("users")
    .delete()
    .neq("email", "admin@educational-platform.com");

  if (error) {
    console.error("حدث خطأ:", error);
  } else {
    console.log("تم حذف المستخدمين بنجاح:", data);
  }
}

deleteAllExceptAdmin();
