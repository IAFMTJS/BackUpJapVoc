import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import HybridMascots from './HybridMascots';

interface MascotSectionProps {
  title: string;
  description: string;
  mascotVariant?: string;
  mascotContext?: string;
  mascotMood?: string;
  children: React.ReactNode;
  showMascot?: boolean;
  mascotSize?: 'small' | 'medium' | 'large';
}

const MascotSection: React.FC<MascotSectionProps> = ({
  title,
  description,
  mascotVariant = "supportive",
  mascotContext = "study",
  mascotMood = "positive",
  children,
  showMascot = true,
  mascotSize = "medium"
}) => {
  const { theme } = useTheme();

  return (
    <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
      <div className="flex flex-col lg:flex-row items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
            {title}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            {description}
          </p>
        </div>
        {showMascot && (
          <div className="mt-4 lg:mt-0 lg:ml-6">
            <HybridMascots
              type="emotions"
              size={mascotSize}
              variant={mascotVariant}
              context={mascotContext}
              mood={mascotMood}
            />
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default MascotSection; 