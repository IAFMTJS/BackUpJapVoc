import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showPercentage = true,
  size = 'md',
}) => {
  const { isDarkMode, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const percentage = Math.round((value / max) * 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${themeClasses.text}`}>{label}</span>
          {showPercentage && (
            <span className={`text-sm font-medium ${isDarkMode ? 'text-neon-pink' : themeClasses.text}`}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${sizeClasses[size]} rounded-full ${isDarkMode ? 'bg-black/50' : 'bg-gray-200'} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-neon-blue to-neon-pink shadow-[0_0_10px_rgba(0,149,255,0.5)]' 
              : 'bg-blue-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar; 