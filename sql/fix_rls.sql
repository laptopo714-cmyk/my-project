-- إعداد سياسات RLS للسماح بالوصول إلى جدول students

-- التأكد من تفعيل RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للسماح بالقراءة والكتابة للمستخدمين الإداريين
CREATE POLICY "Allow admin access to students" ON students
FOR ALL USING (true);

-- إذا كان هناك استعلام مع جدول users، نحتاج إلى سياسات مشابهة له
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للسماح بالوصول للمستخدمين الإداريين
CREATE POLICY "Allow admin access to users" ON users
FOR ALL USING (true);

-- إعادة تحميل السياسات
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
