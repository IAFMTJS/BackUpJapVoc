import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import HybridMascots from './HybridMascots';

interface MascotHeaderProps {
  title: string;
  subtitle?: string;
  mascotVariant?: string;
  mascotContext?: string;
  mascotMood?: string;
  mascotSize?: 'small' | 'medium' | 'large';
  showMascot?: boolean;
  className?: string;
}

const MascotHeader: React.FC<MascotHeaderProps> = ({
  title,
  subtitle,
  mascotVariant = "supportive",
  mascotContext = "study",
  mascotMood = "positive",
  mascotSize = "large",
  showMascot = true,
  className = ""
}) => {
  const { theme } = useTheme();

  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between">
        <div className="flex-1">
          <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-lg ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {showMascot && (
          <div className="mt-4 lg:mt-0 lg:ml-8">
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
    </div>
  );
};

export default MascotHeader; 