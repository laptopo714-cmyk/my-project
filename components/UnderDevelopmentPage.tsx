import React from 'react';
import { Cog6ToothIcon } from './Icons';

interface UnderDevelopmentPageProps {
  title?: string;
  showIcon?: boolean;
  onNavigateHome?: () => void;
}

const UnderDevelopmentPage: React.FC<UnderDevelopmentPageProps> = ({ 
  title = "هذه الصفحة", 
  showIcon = true,
  onNavigateHome
}) => {
  return (
    <div className="py-20 md:py-32 min-h-[calc(100vh-200px)] flex items-center justify-center section-glow">
      <div className="container mx-auto px-6">
        <div className="text-center animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 md:p-16 shadow-2xl shadow-violet-500/10 dark:shadow-violet-400/10 backdrop-blur-xl max-w-2xl mx-auto">
            
            {showIcon && (
              <div className="mx-auto w-20 h-20 mb-8 flex items-center justify-center bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-3xl shadow-lg animate-bounce">
                <Cog6ToothIcon />
              </div>
            )}
            
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6">
              {title} <span className="text-gradient bg-gradient-to-r from-blue-400 via-violet-500 to-amber-400">قيد التطوير حاليًا</span>
            </h1>
            
            <div className="space-y-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              <p className="font-semibold">هذه الصفحة قيد التطوير حاليًا.</p>
              <p>سيتم إضافة الوظائف والميزات قريبًا.</p>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                نعمل بجد لتطوير هذه الصفحة وإضافة المزيد من الميزات المفيدة. 
                تابعونا للحصول على آخر التحديثات والإعلانات.
              </p>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.history.back()} 
                className="px-8 py-3 font-bold rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-violet-500/20 focus:ring-violet-400"
              >
                العودة للخلف
              </button>
              <button 
                onClick={() => {
                  if (onNavigateHome) {
                    onNavigateHome();
                  } else {
                    window.location.reload();
                  }
                }} 
                className="px-8 py-3 font-bold rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 bg-amber-400 text-gray-900 shadow-lg shadow-amber-500/30 dark:shadow-amber-400/20 focus:ring-amber-300"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopmentPage;