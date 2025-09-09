# إصلاح مشاكل قاعدة البيانات

هذا الملف يشرح كيفية إصلاح مشاكل قاعدة البيانات المتعلقة بجداول `sections` و `videos`.

## المشاكل الحالية

1. خطأ 400 (Bad Request) عند الاستعلام عن جدول "sections":
   ```
   HEAD `https://xxxx.supabase.co/rest/v1/sections?select=*&status=eq.published` 400 (Bad Request)
   ```

2. خطأ 404 (Not Found) لجدول "videos":
   ```
   Could not find the table 'public.videos' in the schema cache
   ```

## الحل

### 1. تشغيل سكريبت إصلاح قاعدة البيانات

قم بتشغيل السكريبت التالي لإنشاء الجداول المفقودة:

```bash
node fix-database.mjs
```

إذا واجهت مشكلة مع هذا السكريبت، يمكنك تنفيذ الخطوات التالية يدويًا:

### 2. تنفيذ استعلامات SQL يدويًا

1. افتح لوحة تحكم Supabase وانتقل إلى SQL Editor
2. قم بنسخ محتوى ملف `fix-database-schema.sql` وتنفيذه

## هيكل الجداول

### جدول Sections

```sql
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### جدول Videos

```sql
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  section_id UUID NOT NULL REFERENCES sections(id),
  duration_minutes INTEGER,
  thumbnail TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## تعديلات الكود

تم تعديل الكود في الملفات التالية لتوفير بيانات وهمية في حالة فشل الاتصال بقاعدة البيانات:

1. `lib/sectionVideoService.ts`
   - تم تحسين دوال `getSections` و `getVideos` و `getStats` لتوفير بيانات وهمية في حالة حدوث أخطاء

## ملاحظات إضافية

- تأكد من وجود ملف `.env.local` يحتوي على متغيرات البيئة الصحيحة:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```

- إذا كنت تستخدم Supabase CLI، يمكنك تنفيذ الترحيلات باستخدام:
  ```bash
  supabase db push
  ```