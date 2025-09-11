import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Section } from '../lib/types';

interface CoursesPageProps {
  onStart: () => void;
  onNavigateHome?: () => void;
}

interface StudentSection extends Section {
  granted_at: string;
}

const CoursesPage: React.FC<CoursesPageProps> = ({ onStart, onNavigateHome }) => {
  const [sections, setSections] = useState<StudentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentSections();
  }, []);

  const fetchStudentSections = async () => {
    try {
      setLoading(true);
      
      // الحصول على المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('يجب تسجيل الدخول أولاً');
        return;
      }

      // جلب الأقسام المخصصة للطالب
      const { data, error: fetchError } = await supabase
        .from('student_section_access')
        .select(`
          granted_at,
          sections (
            id,
            title,
            description,
            thumbnail,
            status,
            featured,
            created_at,
            updated_at
          )
        `)
        .eq('student_id', user.id)
        .eq('sections.status', 'published');

      if (fetchError) {
        console.error('خطأ في جلب الأقسام:', fetchError);
        setError('حدث خطأ في جلب الكورسات');
        return;
      }

      // تحويل البيانات للشكل المطلوب
      const studentSections = data
        ?.filter(item => item.sections) // التأكد من وجود بيانات القسم
        .map(item => ({
          ...item.sections,
          granted_at: item.granted_at
        })) as StudentSection[] || [];

      setSections(studentSections);
    } catch (err) {
      console.error('خطأ غير متوقع:', err);
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل الكورسات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">خطأ</h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchStudentSections}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 max-w-md">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لا توجد كورسات متاحة</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">لم يتم تخصيص أي كورسات لك بعد.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">يرجى التواصل مع الإدارة لتخصيص الكورسات المناسبة لك.</p>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                العودة للرئيسية
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">كورساتي</h1>
          <p className="text-gray-600 dark:text-gray-400">الكورسات المخصصة لك من قبل الإدارة</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {section.thumbnail && (
                <img
                  src={section.thumbnail}
                  alt={section.title}
                  className="w-full h-48 object-cover"
                />
              )}
              {!section.thumbnail && (
                <div className="w-full h-48 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h3>
                  {section.featured && (
                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-semibold px-2 py-1 rounded-full">
                      مميز
                    </span>
                  )}
                </div>
                
                {section.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {section.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>تم التخصيص: {new Date(section.granted_at).toLocaleDateString('ar-SA')}</span>
                </div>
                
                <button
                  onClick={onStart}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  بدء الكورس
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;