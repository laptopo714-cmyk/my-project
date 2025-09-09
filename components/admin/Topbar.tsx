import React from 'react';
import { User } from '@supabase/supabase-js';
import { SunIcon, MoonIcon, LogoutIcon } from '../Icons';
import type { AdminRole } from '../../lib/adminPermissions';

type Theme = 'light' | 'dark';

interface TopbarProps {
  user: User | null;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  adminRole: AdminRole;
  isDefaultAdmin: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ user, onLogout, theme, toggleTheme, toggleSidebar, adminRole, isDefaultAdmin }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Sidebar Toggle for mobile */}
        <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          
          <div className="relative">
            <div className="flex items-center gap-3">
              {/* Admin Avatar and Info */}
              <div className="flex items-center gap-2">
                <img 
                    src={`https://ui-avatars.com/api/?name=${user?.email?.charAt(0)}&background=random`} 
                    alt="Admin Avatar"
                    className="w-10 h-10 rounded-full border-2 border-violet-500"
                />
                <div className="hidden md:block">
                  <div className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
                    {user?.user_metadata?.full_name || user?.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{adminRole.nameArabic}</span>
                    {isDefaultAdmin && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        مدير أساسي
                      </span>
                    )}
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      title={`مستوى الصلاحية: ${adminRole.level}`}
                    >
                      L{adminRole.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label="تسجيل الخروج"
          >
            <LogoutIcon className="w-5 h-5"/>
            <span className="hidden md:block">خروج</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
