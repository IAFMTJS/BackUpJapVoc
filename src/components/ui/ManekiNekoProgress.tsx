import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ManekiNekoProgressProps {
  current: number;
  total: number;
  label: string;
  size?: 'small' | 'medium' | 'large';
  showManeki?: boolean;
  className?: string;
}

const ManekiNekoProgress: React.FC<ManekiNekoProgressProps> = ({
  current,
  total,
  label,
  size = 'medium',
  showManeki = true,
  className = ''
}) => {
  const { theme } = useTheme();
  const percentage = Math.min((current / total) * 100, 100);
  
  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };

  const manekiSize = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10'
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-medium ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          {label}
        </span>
        {showManeki && (
          <div className={`${manekiSize[size]} bg-japanese-red rounded-full flex items-center justify-center shadow-sm`}>
            <span className="text-white text-xs">🐱</span>
          </div>
        )}
      </div>
      
      <div className={`relative ${sizeClasses[size]} bg-light-tertiary dark:bg-dark-tertiary rounded-full overflow-hidden`}>
        <div 
          className={`h-full bg-gradient-to-r from-japanese-red to-accent-orange rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
        
        {/* Maneki Neko paw prints along the progress bar */}
        {percentage > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="text-white text-xs opacity-60"
              style={{ left: `${Math.min(percentage - 5, 85)}%` }}
            >
              🐾
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <span className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
          {current}/{total}
        </span>
        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

export default ManekiNekoProgress; 