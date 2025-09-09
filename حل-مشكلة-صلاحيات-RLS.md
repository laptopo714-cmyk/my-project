# حل مشكلة صلاحيات RLS وعلاقات الجداول في Supabase

## المشكلة

تواجه المنصة التعليمية العربية عدة مشاكل في استعلامات قاعدة البيانات Supabase:

1. خطأ `PGRST200` عند محاولة الاستعلام عن العلاقة بين جدولي `videos` و `sections`
2. خطأ `400 Bad Request` عند تصفية البيانات باستخدام حقول مثل `status` و `featured`

## سبب المشكلة

1. **عدم وجود جدول `admin_users`**: تستخدم سياسات RLS استعلامات تعتمد على جدول `admin_users` الذي لم يتم إنشاؤه في قاعدة البيانات
2. **عدم تنفيذ ملف `fix-database-schema.sql`**: يحتوي هذا الملف على التعريفات الصحيحة للجداول والعلاقات، لكن لم يتم تنفيذه في قاعدة البيانات

## الحل

### 1. تنفيذ ملف fix-database-schema.sql في قاعدة البيانات Supabase

يجب تنفيذ ملف `fix-database-schema.sql` في محرر SQL الخاص بـ Supabase. هذا الملف يقوم بما يلي:

- إنشاء جداول `sections` و `videos` إذا لم تكن موجودة
- إنشاء جدول `admin_users` الضروري لسياسات RLS
- تعريف العلاقات بين الجداول بشكل صحيح
- إنشاء سياسات RLS المناسبة للتحكم في الوصول

**خطوات التنفيذ:**

1. قم بتسجيل الدخول إلى لوحة تحكم Supabase
2. انتقل إلى قسم SQL Editor
3. انسخ محتوى ملف `fix-database-schema.sql` وألصقه في محرر SQL
4. قم بتنفيذ الاستعلام

### 2. إضافة مستخدمين إداريين إلى جدول admin_users

بعد إنشاء الجداول، يجب إضافة المستخدمين الإداريين إلى جدول `admin_users`:

```sql
-- إضافة مستخدم إداري (استبدل USER_UUID بمعرف المستخدم الإداري)
INSERT INTO admin_users (user_id) VALUES ('USER_UUID');
```

### 3. استخدام الاستعلامات الصحيحة في الواجهة الأمامية

#### استعلامات REST الصحيحة:

1. **جلب جميع الفيديوهات مع عنوان القسم المرتبط بها:**

```http
GET https://<project>.supabase.co/rest/v1/videos?select=*,sections(title)&order=created_at.desc
```

2. **جلب الأقسام المنشورة فقط:**

```http
GET https://<project>.supabase.co/rest/v1/sections?select=*&status=eq.published
```

3. **جلب الأقسام المميزة فقط:**

```http
GET https://<project>.supabase.co/rest/v1/sections?select=*&featured=eq.true
```

4. **جلب الفيديوهات المنشورة فقط:**

```http
GET https://<project>.supabase.co/rest/v1/videos?select=*&status=eq.published
```

#### أمثلة استخدام Supabase Client في React:

```typescript
// جلب الفيديوهات مع عنوان القسم المرتبط بها
async function fetchVideosWithSections() {
  const { data, error } = await supabase
    .from('videos')
    .select('*, sections(title)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }

  return data;
}

// جلب الأقسام المنشورة فقط
async function fetchPublishedSections() {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching published sections:', error);
    return [];
  }

  return data;
}

// جلب الأقسام المميزة فقط
async function fetchFeaturedSections() {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('featured', true);

  if (error) {
    console.error('Error fetching featured sections:', error);
    return [];
  }

  return data;
}

// جلب الفيديوهات المنشورة فقط
async function fetchPublishedVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching published videos:', error);
    return [];
  }

  return data;
}
```

## تعديلات مقترحة على ملف sectionVideoService.ts

يجب تعديل الدوال الموجودة في ملف `sectionVideoService.ts` للتعامل مع العلاقات بشكل صحيح. على سبيل المثال:

```typescript
// تعديل دالة جلب الفيديوهات
async getVideos({ page = 1, limit = 10, search, status, sectionId }: { page?: number; limit?: number; search?: string; status?: string; sectionId?: string }) {
  try {
    let query = supabase
      .from('videos')
      .select('*, sections(title)', { count: 'exact' })

    // تطبيق الفلاتر إذا تم توفيرها
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (sectionId) {
      query = query.eq('section_id', sectionId)
    }

    // تطبيق الصفحات
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data: videos, count, error } = await query

    if (error) throw error;

    return { videos, count };
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}
```

## ملاحظات هامة

1. **تأكد من إضافة المستخدمين الإداريين**: بعد إنشاء جدول `admin_users`، يجب إضافة المستخدمين الإداريين إليه لكي يتمكنوا من إدارة المحتوى
2. **تحقق من صلاحيات RLS**: تأكد من أن سياسات RLS تعمل بشكل صحيح بعد تنفيذ التغييرات
3. **اختبار الاستعلامات**: قم باختبار جميع الاستعلامات للتأكد من أنها تعمل بشكل صحيح

## الخلاصة

المشكلة الرئيسية كانت عدم وجود جدول `admin_users` الذي تعتمد عليه سياسات RLS. بتنفيذ ملف `fix-database-schema.sql` وإضافة المستخدمين الإداريين إلى الجدول، ستعمل الاستعلامات بشكل صحيح وستتمكن من استخدام العلاقات بين الجداول.