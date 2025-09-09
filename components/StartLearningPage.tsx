import React from 'react';
import { AcademicCapIcon, BookOpenIcon, UsersIcon } from './Icons';

interface StartLearningPageProps {
  onStart: () => void;
}

const BenefitCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="text-center">
        <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-amber-500 dark:text-amber-400 rounded-2xl shadow-lg">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{children}</p>
    </div>
);


const StartLearningPage: React.FC<StartLearningPageProps> = ({ onStart }) => {
  return (
    <div className="py-20 md:py-40 min-h-[calc(100vh-160px)] flex items-center justify-center section-glow">
      <div className="container mx-auto px-6 text-center">
        <div className="animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-100 to-violet-100 dark:from-blue-900/50 dark:to-violet-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-3xl p-8 md:p-16 shadow-2xl shadow-violet-500/10 dark:shadow-violet-400/10 backdrop-blur-xl">
                 <h1 className="text-4xl md:text-6xl font-black mb-4">هل أنت مستعد لبدء رحلتك؟</h1>
                 <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-gray-600 dark:text-gray-300">انضم الآن إلى آلاف المتعلمين والمبدعين في أكبر مجتمع تعليمي عربي، وافتح أبوابًا جديدة لمستقبلك.</p>
                 <button 
                    onClick={onStart} 
                    className="px-12 py-5 font-bold rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 bg-amber-400 text-gray-900 shadow-lg shadow-amber-500/30 dark:shadow-amber-400/20 text-xl focus:ring-amber-300"
                >
                    انضم كطالب الآن!
                </button>
            </div>

            <div className="mt-20">
                 <div className="grid md:grid-cols-3 gap-12">
                     <BenefitCard icon={<BookOpenIcon/>} title="محتوى حصري">
                        كورسات عالية الجودة لن تجدها في أي مكان آخر.
                     </BenefitCard>
                     <BenefitCard icon={<AcademicCapIcon/>} title="شهادات معتمدة">
                        عزز سيرتك الذاتية بشهادات موثوقة من منصتنا.
                     </BenefitCard>
                      <BenefitCard icon={<UsersIcon/>} title="مجتمع تفاعلي">
                        تواصل مع زملائك والمدربين واحصل على الدعم.
                     </BenefitCard>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StartLearningPage;