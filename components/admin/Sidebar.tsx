import React from 'react';
import { 
    HomeIcon, 
    UsersIcon, 
    BookOpenIcon, 
    UserGroupIcon, 
    BellIcon, 
    DocumentTextIcon, 
    AcademicCapIcon, 
    Cog6ToothIcon, 
    ClipboardDocumentListIcon 
} from '../Icons';
import type { AdminRole } from '../../lib/adminPermissions';

type AdminPage = 'dashboard' | 'students' | 'courses' | 'notifications' | 'content' | 'settings' | 'logs';

interface SidebarProps {
  currentPage: AdminPage;
  setCurrentPage: (page: AdminPage) => void;
  isOpen: boolean;
  adminRole: AdminRole;
  canAccessPage: (page: AdminPage) => boolean;
}

const NavItem: React.FC<{
    page: AdminPage;
    label: string;
    icon: React.ReactNode;
    currentPage: AdminPage;
    setCurrentPage: (page: AdminPage) => void;
    disabled?: boolean;
}> = ({ page, label, icon, currentPage, setCurrentPage, disabled = false }) => {
  const isActive = currentPage === page;
  return (
    <li>
      <button
        onClick={() => !disabled && setCurrentPage(page)}
        disabled={disabled}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 ${
          disabled
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
            : isActive
            ? 'bg-violet-600 text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        {icon}
        <span className="whitespace-nowrap overflow-hidden">{label}</span>
        {disabled && (
          <svg className="w-4 h-4 mr-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
      </button>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, adminRole, canAccessPage }) => {
  // FIX: Explicitly type the navItems array to ensure `page` is of type `AdminPage`.
  const navItems: { page: AdminPage; label: string; icon: React.ReactNode }[] = [
    { page: 'dashboard', label: 'لوحة التحكم', icon: <HomeIcon /> },
    { page: 'students', label: 'إدارة الطلاب', icon: <UsersIcon /> },
    { page: 'courses', label: 'الأقسام والفيديوهات', icon: <BookOpenIcon /> },
    { page: 'notifications', label: 'الإشعارات', icon: <BellIcon /> },
    { page: 'settings', label: 'الإعدادات', icon: <Cog6ToothIcon /> },
    { page: 'logs', label: 'سجل النشاط', icon: <ClipboardDocumentListIcon /> },
  ];

  return (
    <aside className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-30 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-black text-center text-gradient bg-gradient-to-r from-blue-500 to-violet-600">
          دروسنا
        </h1>
        {/* Admin Role Badge */}
        <div className="mt-3 text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200 rounded-full">
            {adminRole.nameArabic}
          </span>
        </div>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map(item => {
            const hasAccess = canAccessPage(item.page);
            return (
              <NavItem 
                key={item.page} 
                {...item} 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                disabled={!hasAccess}
              />
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
