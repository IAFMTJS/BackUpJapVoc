import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ManekiNekoCardProps {
  title: string;
  description: string;
  icon?: string;
  color?: 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'yellow';
  badge?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const ManekiNekoCard: React.FC<ManekiNekoCardProps> = ({
  title,
  description,
  icon = '🐱',
  color = 'red',
  badge,
  onClick,
  className = '',
  children
}) => {
  const { theme } = useTheme();
  
  const colorClasses = {
    red: 'border-japanese-red bg-japanese-red/5 dark:bg-japanese-red/10',
    blue: 'border-japanese-blue bg-japanese-blue/5 dark:bg-japanese-blue/10',
    green: 'border-japanese-green bg-japanese-green/5 dark:bg-japanese-green/10',
    orange: 'border-japanese-orange bg-japanese-orange/5 dark:bg-japanese-orange/10',
    purple: 'border-japanese-purple bg-japanese-purple/5 dark:bg-japanese-purple/10',
    yellow: 'border-japanese-yellow bg-japanese-yellow/5 dark:bg-japanese-yellow/10'
  };

  const badgeColorClasses = {
    red: 'bg-japanese-red text-white',
    blue: 'bg-japanese-blue text-white',
    green: 'bg-japanese-green text-white',
    orange: 'bg-japanese-orange text-white',
    purple: 'bg-japanese-purple text-white',
    yellow: 'bg-japanese-yellow text-white'
  };

  return (
    <div 
      className={`
        relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1
        ${colorClasses[color]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Maneki Neko corner decoration */}
      <div className="absolute top-2 right-2 w-8 h-8 bg-japanese-red rounded-full flex items-center justify-center opacity-20">
        <span className="text-white text-sm">🐱</span>
      </div>
      
      {/* Header */}
      <div className="flex items-start mb-4">
        <div className={`w-12 h-12 rounded-nav flex items-center justify-center mr-4 text-white text-xl ${
          color === 'red' ? 'bg-japanese-red' :
          color === 'blue' ? 'bg-japanese-blue' :
          color === 'green' ? 'bg-japanese-green' :
          color === 'orange' ? 'bg-japanese-orange' :
          color === 'purple' ? 'bg-japanese-purple' :
          'bg-japanese-yellow'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
              {title}
            </h3>
            {badge && (
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${badgeColorClasses[color]}`}>
                {badge}
              </span>
            )}
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            {description}
          </p>
        </div>
      </div>
      
      {/* Content */}
      {children}
      
      {/* Maneki Neko paw print decoration */}
      <div className="absolute bottom-2 left-2 opacity-10">
        <span className="text-lg">🐾</span>
      </div>
    </div>
  );
};

export default ManekiNekoCard; 