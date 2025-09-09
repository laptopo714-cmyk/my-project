import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UsersIcon, BookOpenIcon, ArrowTrendingUpIcon, VideoCameraIcon, AcademicCapIcon } from '../../Icons';
import type { AdminRole } from '../../../lib/adminPermissions';
import { DashboardService } from '../../../lib/supabaseService';
import type { DashboardStats } from '../../../types';

// Mock data for charts
const monthlySignups = [
  { name: 'يناير', students: 120 },
  { name: 'فبراير', students: 210 },
  { name: 'مارس', students: 150 },
  { name: 'أبريل', students: 300 },
  { name: 'مايو', students: 250 },
  { name: 'يونيو', students: 400 },
];

interface DashboardHomePageProps {
  theme: 'light' | 'dark';
  adminRole: AdminRole;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border-l-4" style={{borderColor: color}}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">{title}</p>
                <p className="text-4xl font-black text-gray-800 dark:text-gray-100">{value}</p>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white" style={{backgroundColor: color}}>
                {icon}
            </div>
        </div>
    </div>
);


const DashboardHomePage: React.FC<DashboardHomePageProps> = ({ theme, adminRole }) => {
    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const tooltipStyles = theme === 'dark' 
        ? { backgroundColor: 'rgba(31, 41, 55, 0.9)', border: '1px solid #4b5563', borderRadius: '0.5rem', color: '#f9fafb' }
        : { backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #d1d5db', borderRadius: '0.5rem', color: '#1f2937' };

    // Count permissions for display
    const activePermissions = Object.values(adminRole.permissions).filter(Boolean).length;
    const totalPermissions = Object.keys(adminRole.permissions).length;

  return (
    <div className="animate-fade-in-up space-y-8">
      <header>
        <h1 className="text-4xl font-black text-gray-800 dark:text-gray-100">لوحة التحكم الرئيسية</h1>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg text-gray-500 dark:text-gray-400">مرحباً بعودتك! إليك ملخص أداء منصتك.</p>
          
          {/* Admin Role Info */}
          <div className="hidden md:flex items-center gap-4">
            <div className="bg-violet-100 dark:bg-violet-900/30 p-3 rounded-lg">
              <div className="text-sm font-semibold text-violet-800 dark:text-violet-200">
                {adminRole.nameArabic}
              </div>
              <div className="text-xs text-violet-600 dark:text-violet-400">
                الصلاحيات: {activePermissions}/{totalPermissions}
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <div className="text-sm font-semibold text-green-800 dark:text-green-200">
                مستوى {adminRole.level}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                مدير معتمد
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي الطلاب" value="1,250" icon={<UsersIcon />} color="#3b82f6" />
        <StatCard title="إجمالي الكورسات" value="48" icon={<BookOpenIcon />} color="#8b5cf6" />
        <StatCard title="الطلاب النشطين" value="97%" icon={<ArrowTrendingUpIcon />} color="#10b981" />
        <StatCard title="ساعات المحتوى" value="320+" icon={<VideoCameraIcon />} color="#f59e0b" />
      </div>
      
      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
        <h3 className="font-bold text-2xl mb-6 text-gray-800 dark:text-gray-100">الطلاب الجدد (آخر 6 أشهر)</h3>
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlySignups} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={theme === 'dark' ? 0.1 : 0.3} />
                <XAxis dataKey="name" tick={{ fill: tickColor }} axisLine={{ stroke: tickColor, opacity: 0.5 }} />
                <YAxis tick={{ fill: tickColor }} axisLine={{ stroke: tickColor, opacity: 0.5 }} />
                <Tooltip 
                    contentStyle={tooltipStyles}
                    cursor={{fill: 'rgba(139, 92, 246, 0.1)'}}
                />
                <Legend wrapperStyle={{color: tickColor}}/>
                <Bar dataKey="students" fill="#8b5cf6" name="طالب جديد" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default DashboardHomePage;
