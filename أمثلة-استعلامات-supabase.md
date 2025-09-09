# أمثلة استعلامات Supabase Client

فيما يلي أمثلة لاستخدام Supabase Client للاستعلامات الصحيحة بعد تنفيذ ملف `fix-database-schema.sql`.

## استعلامات الأقسام (Sections)

### 1. جلب جميع الأقسام

```typescript
import { supabase } from './lib/supabaseClient';

async function getAllSections() {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sections:', error);
    return [];
  }

  return data;
}
```

### 2. جلب الأقسام المنشورة فقط

```typescript
async function getPublishedSections() {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published sections:', error);
    return [];
  }

  return data;
}
```

### 3. جلب الأقسام المميزة فقط

```typescript
async function getFeaturedSections() {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching featured sections:', error);
    return [];
  }

  return data;
}
```

### 4. جلب الأقسام المنشورة والمميزة معًا

```typescript
async function getPublishedFeaturedSections() {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published featured sections:', error);
    return [];
  }

  return data;
}
```

## استعلامات الفيديوهات (Videos)

### 1. جلب جميع الفيديوهات مع عنوان القسم المرتبط بها

```typescript
import { supabase } from './lib/supabaseClient';

async function getAllVideosWithSections() {
  const { data, error } = await supabase
    .from('videos')
    .select('*, sections(title)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos with sections:', error);
    return [];
  }

  return data;
}
```

### 2. جلب الفيديوهات المنشورة فقط

```typescript
async function getPublishedVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*, sections(title)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published videos:', error);
    return [];
  }

  return data;
}
```

### 3. جلب الفيديوهات حسب القسم

```typescript
async function getVideosBySection(sectionId: string) {
  const { data, error } = await supabase
    .from('videos')
    .select('*, sections(title)')
    .eq('section_id', sectionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos by section:', error);
    return [];
  }

  return data;
}
```

### 4. جلب الفيديوهات المنشورة في الأقسام المنشورة فقط

```typescript
async function getPublishedVideosInPublishedSections() {
  const { data: publishedSections, error: sectionsError } = await supabase
    .from('sections')
    .select('id')
    .eq('status', 'published');

  if (sectionsError) {
    console.error('Error fetching published sections:', sectionsError);
    return [];
  }

  const publishedSectionIds = publishedSections.map(section => section.id);

  const { data, error } = await supabase
    .from('videos')
    .select('*, sections(title)')
    .eq('status', 'published')
    .in('section_id', publishedSectionIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published videos in published sections:', error);
    return [];
  }

  return data;
}
```

## استعلامات مع التصفية والبحث

### 1. البحث في الفيديوهات حسب العنوان

```typescript
async function searchVideos(searchTerm: string) {
  const { data, error } = await supabase
    .from('videos')
    .select('*, sections(title)')
    .ilike('title', `%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching videos:', error);
    return [];
  }

  return data;
}
```

### 2. البحث في الأقسام حسب العنوان

```typescript
async function searchSections(searchTerm: string) {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .ilike('title', `%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching sections:', error);
    return [];
  }

  return data;
}
```

## استعلامات مع التصفح (Pagination)

### 1. تصفح الفيديوهات

```typescript
async function paginateVideos(page: number, limit: number) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from('videos')
    .select('*, sections(title)', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error paginating videos:', error);
    return { videos: [], total: 0 };
  }

  return { videos: data, total: count || 0 };
}
```

### 2. تصفح الأقسام

```typescript
async function paginateSections(page: number, limit: number) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from('sections')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error paginating sections:', error);
    return { sections: [], total: 0 };
  }

  return { sections: data, total: count || 0 };
}
```

## استعلامات إدارية

### 1. إضافة مستخدم إداري

```typescript
async function addAdminUser(userId: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .insert([{ user_id: userId }])
    .select();

  if (error) {
    console.error('Error adding admin user:', error);
    return null;
  }

  return data[0];
}
```

### 2. التحقق مما إذا كان المستخدم إداريًا

```typescript
async function isUserAdmin(userId: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }

  return !!data;
}
```

## ملاحظات هامة

1. تأكد من تنفيذ ملف `fix-database-schema.sql` في قاعدة البيانات Supabase قبل استخدام هذه الاستعلامات.
2. تأكد من إضافة المستخدمين الإداريين إلى جدول `admin_users` لكي تعمل سياسات RLS بشكل صحيح.
3. استخدم معالجة الأخطاء المناسبة في جميع الاستعلامات.
4. تأكد من استخدام العلاقات بشكل صحيح عند استعلام الفيديوهات مع الأقسام المرتبطة بها.