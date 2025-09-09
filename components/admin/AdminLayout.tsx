import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DashboardHomePage from './pages/DashboardHomePage';
import ManageStudentsPage from './pages/ManageStudentsPage';
import ManageCoursesPage from './pages/ManageCoursesPage';
import ManageNotificationsPage from './pages/ManageNotificationsPage';
import ManageSettingsPage from './pages/ManageSettingsPage';
import ManageActivityLogsPage from './pages/ManageActivityLogsPage';
import PlaceholderPage from './pages/PlaceholderPage';
import { getAdminUserInfo, hasPermission } from '../../lib/adminPermissions';

type AdminPage = 'dashboard' | 'students' | 'courses' | 'notifications' | 'settings' | 'logs';
type Theme = 'light' | 'dark';

interface AdminLayoutProps {
  session: Session;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ session, onLogout, theme, toggleTheme }) => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // Get admin user information and permissions
  const userEmail = session.user?.email || '';
  const userMetadata = session.user?.user_metadata || {};
  const { role: adminRole, isDefault } = getAdminUserInfo(userEmail, userMetadata);
  
  // Check permissions before rendering pages
  const canAccessPage = (page: AdminPage): boolean => {
    switch (page) {
      case 'dashboard':
        return hasPermission(userEmail, 'viewDashboard', userMetadata);
      case 'students':
        return hasPermission(userEmail, 'viewStudents', userMetadata);
      case 'courses':
        return hasPermission(userEmail, 'viewCourses', userMetadata);
      case 'notifications':
        return hasPermission(userEmail, 'manageNotifications', userMetadata);
      case 'settings':
        return hasPermission(userEmail, 'manageSettings', userMetadata);
      case 'logs':
        return hasPermission(userEmail, 'viewSystemLogs', userMetadata);
      default:
        return true;
    }
  };

  const renderPage = () => {
    // Check if user has permission to access current page
    if (!canAccessPage(currentPage)) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              غير مخول بالوصول
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">
              ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة.
            </p>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              العودة إلى لوحة التحكم
            </button>
          </div>
        </div>
      );
    }
    
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHomePage theme={theme} adminRole={adminRole} />;
      case 'students':
        return <ManageStudentsPage adminRole={adminRole} />;
      case 'courses':
        return <ManageCoursesPage adminRole={adminRole} />;
       case 'notifications':
        return <ManageNotificationsPage theme={theme} />;
       case 'content':
        return <ManageContentPage theme={theme} />;
       case 'settings':
        return <ManageSettingsPage theme={theme} />;
       case 'logs':
        return <ManageActivityLogsPage theme={theme} />;
      default:
        return <DashboardHomePage theme={theme} adminRole={adminRole} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200" dir="rtl">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isOpen={isSidebarOpen}
        adminRole={adminRole}
        canAccessPage={canAccessPage}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:mr-64' : 'mr-0'}`}>
        <Topbar 
          user={session.user} 
          onLogout={onLogout} 
          theme={theme} 
          toggleTheme={toggleTheme}
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          adminRole={adminRole}
          isDefaultAdmin={isDefault}
        />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
