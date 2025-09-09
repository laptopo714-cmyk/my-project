import React from 'react';
import UnderDevelopmentPage from './UnderDevelopmentPage';

interface FeaturesPageProps {
  onNavigateHome?: () => void;
}

const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigateHome }) => {
  return (
    <UnderDevelopmentPage title="صفحة المميزات" onNavigateHome={onNavigateHome} />
  );
};

export default FeaturesPage;