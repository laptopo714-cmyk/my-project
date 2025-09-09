import React from 'react';
import { Cog6ToothIcon } from '../../Icons';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 animate-fade-in-up">
      <Cog6ToothIcon />
      <h1 className="text-4xl font-black text-gray-800 dark:text-gray-100 mt-4">{title}</h1>
      <p className="text-lg mt-2">هذه الصفحة قيد التطوير حاليًا.</p>
      <p className="mt-1">سيتم إضافة الوظائف والميزات قريبًا.</p>
    </div>
  );
};

export default PlaceholderPage;
