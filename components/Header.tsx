import React from 'react';
import { SunIcon, MoonIcon } from './Icons';

type PublicPage = 'home' | 'features' | 'courses' | 'contact' | 'start';
type Theme = 'light' | 'dark';

interface HeaderProps {
  onNavigate: (page: PublicPage) => void;
  onStart: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const NavLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button onClick={onClick} className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-300 font-semibold text-lg">
    {children}
  </button>
);

const CtaButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-8 py-3 font-bold rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${className}`}
  >
    {children}
  </button>
);

const Header: React.FC<HeaderProps> = ({ onNavigate, onStart, theme, toggleTheme }) => {
  return (
    <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button onClick={() => onNavigate('home')} className="text-3xl font-black text-gradient bg-gradient-to-r from-blue-400 to-violet-500">دروسنا</button>
        <div className="hidden md:flex items-center space-x-8">
          <NavLink onClick={() => onNavigate('home')}>الرئيسية</NavLink>
          <NavLink onClick={() => onNavigate('features')}>المميزات</NavLink>
          <NavLink onClick={() => onNavigate('courses')}>الكورسات</NavLink>
          <NavLink onClick={() => onNavigate('contact')}>تواصل معنا</NavLink>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <CtaButton onClick={onStart} className="bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-violet-500/20 focus:ring-violet-400">
                ابدأ الآن
            </CtaButton>
        </div>
      </nav>
    </header>
  );
};

export default Header;