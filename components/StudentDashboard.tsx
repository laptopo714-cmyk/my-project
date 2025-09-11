import React, { useState, useEffect } from 'react';
import type { Notification } from '../types';
import { BookOpenIcon, BellIcon, ClipboardListIcon, UserCircleIcon } from './Icons';
import { supabase } from '../lib/supabaseClient';

// --- Types ---
interface StudentSection {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  granted_at: string;
  progress?: number; // سيتم إضافة نظام التقدم لاحقاً
}

// --- Mock Notifications (سيتم استبدالها لاحقاً) ---
const notifications: Notification[] = [
    { id: "1", title: "إشعار جديد", message: "تمت إضافة واجب جديد في كورس علوم الحاسب.", type: "info", read: false, created_at: new Date().toISOString() },
    { id: "2", title: "نتيجة اختبار", message: "حصلت على درجة 95% في اختبار التصميم.", type: "success", read: false, created_at: new Date().toISOString() },
    { id: "3", title: "رسالة ترحيب", message: "رسالة ترحيب من المدرب خالد.", type: "info", read: true, created_at: new Date().toISOString() },
    { id: "4", title: "تذكير", message: "تذكير: محاضرة مباشرة اليوم الساعة 8 مساءً.", type: "warning", read: true, created_at: new Date().toISOString() },
];

const unreadNotificationsCount = notifications.filter(n => !n.read).length;

// --- Helper Components ---
interface ProgressBarProps {
  progress: number;
  colorClass?: string;
  heightClass?: string;
}
const ProgressBar: React.FC<ProgressBarProps> = ({ progress, colorClass = 'bg-violet-500', heightClass = 'h-2' }) => (
  <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${heightClass} overflow-hidden`}>
    <div
      className={`${colorClass} rounded-full transition-all duration-500`}
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

const SectionCardComponent: React.FC<{ section: StudentSection }> = ({ section }) => (
  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-white/30 dark:border-gray-700 rounded-2xl shadow-lg dark:shadow-gray-900/50 overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out">
    {section.thumbnail ? (
      <img src={section.thumbnail} alt={section.title} className="w-full h-32 object-cover" />
    ) : (
      <div className="w-full h-32 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
        <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
    )}
    <div className="p-5">
      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">{section.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10">{section.description || "لا يوجد وصف متاح"}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">التقدم</span>
        <span className="font-semibold text-violet-600 dark:text-violet-400">{section.progress || 0}%</span>
      </div>
      <ProgressBar progress={section.progress || 0} heightClass="h-1.5 mt-2" />
      <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        تم التخصيص: {new Date(section.granted_at).toLocaleDateString('ar-SA')}
      </div>
    </div>
  </div>
);

// --- Main Dashboard Component ---
const StudentDashboard: React.FC = () => {
  const [activeItem, setActiveItem] = useState('كورساتي');
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [sections, setSections] = useState<StudentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentData();
    fetchStudentSections();
  }, []);

  const fetchStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setStudentEmail(user.email || "");
        
        const { data, error } = await supabase
          .from('students')
          .select('full_name')
          .eq('auth_user_id', user.id)
          .single();

        if (error) {
          console.error('خطأ في جلب بيانات الطالب:', error);
        } else if (data) {
          setStudentName(data.full_name);
        } else {
          setStudentName(user.user_metadata?.full_name || "الطالب");
        }
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
    }
  };

  const fetchStudentSections = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('يجب تسجيل الدخول أولاً');
        return;
      }

      // First, get the student's section access records
      const { data: accessRecords, error: accessError } = await supabase
        .from('student_section_access')
        .select('section_id, granted_at')
        .eq('student_id', user.id);

      if (accessError) {
        console.error('خطأ في جلب صلاحيات الوصول:', accessError);
        // If there's an error with access records, show all published sections
        const { data: allSections, error: sectionsError } = await supabase
          .from('sections')
          .select('id, title, description, thumbnail')
          .eq('status', 'published');
          
        if (sectionsError) {
          console.error('خطأ في جلب الأقسام المنشورة:', sectionsError);
          setError('حدث خطأ في جلب الكورسات');
          return;
        }
        
        const studentSections = (allSections || []).map(section => ({
          ...section,
          granted_at: new Date().toISOString(),
          progress: Math.floor(Math.random() * 100)
        })) as StudentSection[];
        
        setSections(studentSections);
        return;
      }

      if (!accessRecords || accessRecords.length === 0) {
        // No access records found, show all published sections as available
        const { data: allSections, error: sectionsError } = await supabase
          .from('sections')
          .select('id, title, description, thumbnail')
          .eq('status', 'published');
          
        if (sectionsError) {
          console.error('خطأ في جلب الأقسام المنشورة:', sectionsError);
          setError('حدث خطأ في جلب الكورسات');
          return;
        }
        
        const studentSections = (allSections || []).map(section => ({
          ...section,
          granted_at: new Date().toISOString(),
          progress: Math.floor(Math.random() * 100)
        })) as StudentSection[];
        
        setSections(studentSections);
        return;
      }

      // Get section IDs that the student has access to
      const sectionIds = accessRecords.map(record => record.section_id);
      
      // Now get the actual section details
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('id, title, description, thumbnail, status')
        .in('id', sectionIds)
        .eq('status', 'published');

      if (sectionsError) {
        console.error('خطأ في جلب تفاصيل الأقسام:', sectionsError);
        setError('حدث خطأ في جلب تفاصيل الكورسات');
        return;
      }

      // Combine section data with access information
      const studentSections = (sectionsData || []).map(section => {
        const accessRecord = accessRecords.find(record => record.section_id === section.id);
        return {
          ...section,
          granted_at: accessRecord?.granted_at || new Date().toISOString(),
          progress: Math.floor(Math.random() * 100) // تقدم عشوائي مؤقت
        };
      }) as StudentSection[];

      setSections(studentSections);
    } catch (err) {
      console.error('خطأ غير متوقع:', err);
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  // حساب التقدم الإجمالي
  const totalProgress = sections.length > 0 
    ? Math.round(sections.reduce((acc, section) => acc + (section.progress || 0), 0) / sections.length)
    : 0;

  const sidebarItems = [
    { name: 'كورساتي', icon: <BookOpenIcon /> },
    { name: 'الإشعارات', icon: <BellIcon />, badge: unreadNotificationsCount },
    { name: 'الواجبات', icon: <ClipboardListIcon /> },
    { name: 'ملفي الشخصي', icon: <UserCircleIcon /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-68px)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-800 shadow-md md:h-[calc(100vh-68px)] md:sticky md:top-[68px] border-e border-gray-200 dark:border-gray-700">
        <nav className="p-4">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.name === 'الإشعارات') {
                      setNotificationsOpen(!isNotificationsOpen);
                    } else {
                       setActiveItem(item.name);
                       setNotificationsOpen(false);
                    }
                  }}
                  className={`flex items-center gap-4 px-4 py-3 my-1 rounded-lg text-lg font-semibold transition-all duration-200 ${
                    activeItem === item.name ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ms-auto bg-yellow-400 text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="animate-fade-in">
          <header className="mb-8">
            <h1 className="text-4xl font-black text-gray-800 dark:text-gray-100">أهلاً بك{studentName ? ` يا ${studentName}` : ""}!</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">نحن سعداء بعودتك. لنكمل رحلتنا التعليمية.</p>
          </header>

          <div className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
             <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">مستوى تقدمك الإجمالي</h2>
                <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{totalProgress}%</span>
            </div>
            <ProgressBar progress={totalProgress} colorClass="bg-gradient-to-r from-sky-400 to-violet-500" heightClass="h-3" />
          </div>

          {activeItem === 'كورساتي' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">كورساتك الحالية</h2>
              
              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">جاري تحميل الكورسات...</p>
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
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
              ) : sections.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-3xl p-12 max-w-2xl mx-auto">
                    <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-2xl shadow-lg">
                      <BookOpenIcon />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">لا توجد كورسات متاحة</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">لم يتم تخصيص أي كورسات لك بعد.</p>
                    <p className="text-gray-600 dark:text-gray-300">يرجى التواصل مع الإدارة لتخصيص الكورسات المناسبة لك.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sections.map(section => <SectionCardComponent key={section.id} section={section} />)}
                </div>
              )}
            </div>
          )}
          
          {activeItem === 'الواجبات' && (
            <div className="text-center py-16">
              <div className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 border border-gray-200 dark:border-gray-700 rounded-3xl p-12 max-w-2xl mx-auto">
                <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-2xl shadow-lg">
                  <ClipboardListIcon />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">صفحة الواجبات قيد التطوير</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">سيتم إضافة نظام الواجبات والمهام قريباً.</p>
                <p className="text-gray-600 dark:text-gray-300">ستتمكن من متابعة واجباتك وتسليمها من هنا.</p>
              </div>
            </div>
          )}
          
          {activeItem === 'ملفي الشخصي' && (
            <div className="text-center py-16">
              <div className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 border border-gray-200 dark:border-gray-700 rounded-3xl p-12 max-w-2xl mx-auto">
                <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-2xl shadow-lg">
                  <UserCircleIcon />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">الملف الشخصي</h3>
                <div className="text-right mb-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">الاسم</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{studentName || "غير متوفر"}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">البريد الإلكتروني</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{studentEmail || "غير متوفر"}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">سيتم إضافة المزيد من إعدادات الملف الشخصي قريباً.</p>
                <p className="text-gray-600 dark:text-gray-300">ستتمكن من تحديث بياناتك الشخصية وإعداداتك من هنا.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Notifications Panel */}
      <div className={`fixed top-0 end-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isNotificationsOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">مركز الإشعارات</h3>
            <button onClick={() => setNotificationsOpen(false)} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">&times;</button>
          </div>
        </div>
        <ul className="divide-y divide-gray-100 dark:divide-gray-700 p-2">
          {notifications.map(notif => (
            <li key={notif.id} className={`p-3 my-1 rounded-lg ${!notif.read ? 'bg-sky-50 dark:bg-sky-900/40' : ''}`}>
              <div className="flex items-start gap-3">
                 <span className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-sky-400' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                 <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(notif.created_at).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
       {isNotificationsOpen && <div onClick={() => setNotificationsOpen(false)} className="fixed inset-0 bg-black/30 z-40"></div>}

    </div>
  );
};

export default StudentDashboard;