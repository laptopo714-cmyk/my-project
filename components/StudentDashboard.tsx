import React, { useState, useEffect } from 'react';
import type { Course, Notification } from '../types';
import { BookOpenIcon, BellIcon, ClipboardListIcon, UserCircleIcon } from './Icons';
import { supabase } from '../lib/supabaseClient';

// --- Mock Data ---
// سيتم استبداله بالبيانات الحقيقية من قاعدة البيانات
const courses: Course[] = [
  { id: 1, title: "مقدمة في علوم الحاسب", description: "أساسيات البرمجة وهياكل البيانات.", progress: 75, thumbnail: "https://picsum.photos/seed/course1/400/200" },
  { id: 2, title: "التصميم الجرافيكي للمبتدئين", description: "تعلم أساسيات Adobe Photoshop و Illustrator.", progress: 40, thumbnail: "https://picsum.photos/seed/course2/400/200" },
  { id: 3, title: "التسويق الرقمي المتقدم", description: "استراتيجيات SEO, SEM, والتسويق عبر المحتوى.", progress: 90, thumbnail: "https://picsum.photos/seed/course3/400/200" },
  { id: 4, title: "تطوير تطبيقات الويب", description: "بناء تطبيقات تفاعلية باستخدام React.", progress: 20, thumbnail: "https://picsum.photos/seed/course4/400/200" },
];
const notifications: Notification[] = [
    { id: 1, message: "تمت إضافة واجب جديد في كورس علوم الحاسب.", time: "منذ 5 دقائق", isRead: false },
    { id: 2, message: "حصلت على درجة 95% في اختبار التصميم.", time: "منذ ساعتين", isRead: false },
    { id: 3, message: "رسالة ترحيب من المدرب خالد.", time: "بالأمس", isRead: true },
    { id: 4, message: "تذكير: محاضرة مباشرة اليوم الساعة 8 مساءً.", time: "بالأمس", isRead: true },
];

const totalProgress = Math.round(courses.reduce((acc, course) => acc + course.progress, 0) / courses.length);
const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

// --- Helper Components (Defined outside main component to prevent re-renders) ---

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

const CourseCardComponent: React.FC<{ course: Course }> = ({ course }) => (
  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-white/30 dark:border-gray-700 rounded-2xl shadow-lg dark:shadow-gray-900/50 overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out">
    <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover" />
    <div className="p-5">
      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">{course.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10">{course.description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">التقدم</span>
        <span className="font-semibold text-violet-600 dark:text-violet-400">{course.progress}%</span>
      </div>
      <ProgressBar progress={course.progress} heightClass="h-1.5 mt-2" />
    </div>
  </div>
);

// --- Main Dashboard Component ---

const StudentDashboard: React.FC = () => {
  const [activeItem, setActiveItem] = useState('كورساتي');
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  useEffect(() => {
    // جلب بيانات الطالب الحالي عند تحميل الصفحة
    async function fetchStudentData() {
      try {
        // الحصول على المستخدم الحالي
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setStudentEmail(user.email || "");
          
          // الحصول على بيانات الطالب من جدول الطلاب
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
            // إذا لم يتم العثور على بيانات الطالب، استخدم البيانات من المستخدم
            setStudentName(user.user_metadata?.full_name || "الطالب");
          }
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات المستخدم:', error);
      }
    }

    fetchStudentData();
  }, []);

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => <CourseCardComponent key={course.id} course={course} />)}
              </div>
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
            <li key={notif.id} className={`p-3 my-1 rounded-lg ${!notif.isRead ? 'bg-sky-50 dark:bg-sky-900/40' : ''}`}>
              <div className="flex items-start gap-3">
                 <span className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-sky-400' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                 <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
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