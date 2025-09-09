import React, { useState, useEffect } from 'react';
import StudentDashboard from './components/StudentDashboard';
import LoginPage from './components/LoginPage';
import RoleSelectionPage from './components/RoleSelectionPage';
import HomePage from './components/LandingPage';
import Header from './components/Header';
import Footer from './components/Footer';
import FeaturesPage from './components/FeaturesPage';
import CoursesPage from './components/CoursesPage';
import ContactPage from './components/ContactPage';
import StartLearningPage from './components/StartLearningPage';
import SupportPage from './components/SupportPage';
import HelpCenterPage from './components/HelpCenterPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import AdminLayout from './components/admin/AdminLayout';
import { supabase } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';


type Role = 'student' | 'admin';
type AuthScreen = 'roleSelection' | 'login' | 'dashboard';
type PublicPage = 'home' | 'features' | 'courses' | 'contact' | 'start' | 'support' | 'help' | 'privacy';
type Page = PublicPage | 'auth';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('roleSelection');
  const [role, setRole] = useState<Role | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize theme based on the class set by the script in index.html
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setLoading(true);
    
    // Get current Supabase session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch(error => console.error("Error getting session:", error))
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleNavigate = (targetPage: PublicPage) => {
    setPage(targetPage);
    window.scrollTo(0, 0);
  };
  
  const handleStartAuth = () => {
    setPage('auth');
    setAuthScreen('roleSelection');
    setRole(null);
  };

  const handleSelectRole = (selectedRole: Role) => {
    setRole(selectedRole);
    setAuthScreen('login');
  };

  const handleLoginSuccess = () => {
      // Session change will be handled by Supabase auth state change
      // This function is kept for compatibility with LoginPage component
      // No need to do anything here as the session state will trigger the appropriate UI
  };
  
  const handleLogout = async () => {
    if (session) {
      await supabase.auth.signOut();
    }
    setRole(null);
    setAuthScreen('roleSelection');
    setPage('home');
  };

  const handleBackToRoleSelection = () => {
      setRole(null);
      setAuthScreen('roleSelection');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-violet-500"></div>
      </div>
    );
  }

  // Handle authenticated users (both admin and students)
  if (session) {
    // Debug session information
    console.log('Session user:', session.user);
    console.log('User metadata:', session.user.user_metadata);
    
    // Check user metadata to determine role
    const userRole = session.user.user_metadata?.role;
    console.log('User role from metadata:', userRole);
    
    if (userRole === 'admin') {
      return <AdminLayout session={session} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
    } else if (userRole === 'student') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
          {/* Simplified header for student dashboard */}
          <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
              <h1 className="text-xl font-bold text-violet-600 dark:text-violet-400">منصة دروسنا</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm">{session.user.email}</span>
                <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </header>
          <main>
            <StudentDashboard />
          </main>
        </div>
      );
    } else {
      // If role is missing or not recognized, try to determine from email domain
      // This is a fallback for existing accounts that might not have role metadata
      console.log('Role not found in metadata, checking email domain');
      const email = session.user.email;
      
      if (email && email.endsWith('@educational-platform.com')) {
        // Admin email pattern
        console.log('Detected admin email pattern');
        return <AdminLayout session={session} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
      } else {
        // Default to student for all other emails
        console.log('Defaulting to student role based on email');
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
              <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold text-violet-600 dark:text-violet-400">منصة دروسنا</h1>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">{email}</span>
                  <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </header>
            <main>
              <StudentDashboard />
            </main>
          </div>
        );
      }
    }
  }

  // Public pages and student auth flow
  if (page === 'auth') {
    if (authScreen === 'roleSelection') {
        return <RoleSelectionPage 
                  onSelectStudent={() => handleSelectRole('student')}
                  onSelectAdmin={() => handleSelectRole('admin')}
                />;
    }
    
    if (authScreen === 'login' && role) {
        return <LoginPage 
                  role={role}
                  onLoginSuccess={handleLoginSuccess}
                  onBack={handleBackToRoleSelection}
                />;
    }

    // This is for the mock student dashboard
    if (authScreen === 'dashboard' && role === 'student') {
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
             {/* Simplified header for student dashboard */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-violet-600 dark:text-violet-400">منصة دروسنا</h1>
                    <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                        تسجيل الخروج
                    </button>
                </div>
            </header>
            <main>
              <StudentDashboard />
            </main>
          </div>
        );
    }
    return <RoleSelectionPage onSelectStudent={() => handleSelectRole('student')} onSelectAdmin={() => handleSelectRole('admin')} />;
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-x-hidden">
        <Header onNavigate={handleNavigate} onStart={handleStartAuth} theme={theme} toggleTheme={toggleTheme} />
        <main>
            {page === 'home' && <HomePage onStart={handleStartAuth} />}
            {page === 'features' && <FeaturesPage onNavigateHome={() => handleNavigate('home')} />}
            {page === 'courses' && <CoursesPage onStart={handleStartAuth} onNavigateHome={() => handleNavigate('home')} />}
            {page === 'contact' && <ContactPage />}
            {page === 'start' && <StartLearningPage onStart={handleStartAuth} />}
            {page === 'support' && <SupportPage />}
            {page === 'help' && <HelpCenterPage />}
            {page === 'privacy' && <PrivacyPolicyPage />}
        </main>
        <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;