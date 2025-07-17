import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import HybridMascots from './HybridMascots';

interface MascotCardProps {
  title: string;
  subtitle?: string;
  mascotVariant?: string;
  mascotContext?: string;
  mascotMood?: string;
  children: React.ReactNode;
  showMascot?: boolean;
  mascotSize?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
}

const MascotCard: React.FC<MascotCardProps> = ({
  title,
  subtitle,
  mascotVariant = "supportive",
  mascotContext = "study",
  mascotMood = "positive",
  children,
  showMascot = true,
  mascotSize = "small",
  className = "",
  onClick
}) => {
  const { theme } = useTheme();

  const cardClasses = `
    p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-2 cursor-pointer
    ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {showMascot && (
          <div className="ml-4">
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

export default MascotCard; 