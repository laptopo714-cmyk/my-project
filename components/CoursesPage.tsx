import React from 'react';
import UnderDevelopmentPage from './UnderDevelopmentPage';

interface CoursesPageProps {
  onStart: () => void;
  onNavigateHome?: () => void;
}

const CoursesPage: React.FC<CoursesPageProps> = ({ onStart, onNavigateHome }) => {
  return (
    <UnderDevelopmentPage title="صفحة الكورسات" onNavigateHome={onNavigateHome} />
  );
};

export default CoursesPage;