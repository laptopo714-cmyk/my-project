import React from 'react';

interface RoleSelectionPageProps {
  onSelectStudent: () => void;
  onSelectAdmin: () => void;
}

const RoleButton: React.FC<{ onClick: () => void; children: React.ReactNode; className: string }> = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`w-full max-w-xs text-center p-8 rounded-2xl shadow-xl border border-white/30 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 ${className}`}
  >
    <span className="text-4xl font-black">{children}</span>
  </button>
);

const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onSelectStudent, onSelectAdmin }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-violet-600 to-sky-400 p-4 text-white">
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl font-black mb-12">من أنت؟</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <RoleButton onClick={onSelectStudent} className="bg-sky-500/80 backdrop-blur-lg focus:ring-sky-300">
            طالب
          </RoleButton>
          <RoleButton onClick={onSelectAdmin} className="bg-violet-700/80 backdrop-blur-lg focus:ring-violet-400">
            مدرّس
          </RoleButton>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
