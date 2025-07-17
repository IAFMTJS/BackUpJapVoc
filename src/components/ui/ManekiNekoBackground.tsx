import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ManekiNekoBackgroundProps {
  variant?: 'subtle' | 'moderate' | 'prominent';
  className?: string;
}

const ManekiNekoBackground: React.FC<ManekiNekoBackgroundProps> = ({
  variant = 'subtle',
  className = ''
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getOpacity = () => {
    switch (variant) {
      case 'subtle': return 'opacity-5';
      case 'moderate': return 'opacity-10';
      case 'prominent': return 'opacity-15';
      default: return 'opacity-5';
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Large Maneki Neko silhouette in background */}
      <div className={`absolute -bottom-20 -right-20 w-64 h-64 ${getOpacity()}`}>
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          {/* Maneki Neko silhouette */}
          <path
            d="M100 180 Q80 160 70 140 Q60 120 65 100 Q70 80 85 70 Q100 60 115 70 Q130 80 135 100 Q140 120 130 140 Q120 160 100 180"
            fill={isDark ? '#D45A38' : '#C44536'}
          />
          {/* Ears */}
          <path d="M75 75 L65 55 L85 65 Z" fill={isDark ? '#D45A38' : '#C44536'} />
          <path d="M125 75 L135 55 L115 65 Z" fill={isDark ? '#D45A38' : '#C44536'} />
          {/* Bell */}
          <circle cx="100" cy="110" r="8" fill="#F4B942" />
          <circle cx="100" cy="110" r="3" fill="#8B4513" />
        </svg>
      </div>

      {/* Small floating Maneki Neko elements */}
      <div className={`absolute top-10 left-10 w-8 h-8 ${getOpacity()}`}>
        <span className="text-2xl">🐱</span>
      </div>
      <div className={`absolute top-20 right-20 w-6 h-6 ${getOpacity()}`}>
        <span className="text-xl">🐱</span>
      </div>
      <div className={`absolute bottom-40 left-20 w-4 h-4 ${getOpacity()}`}>
        <span className="text-lg">🐱</span>
      </div>

      {/* Decorative paw prints */}
      <div className={`absolute top-1/3 left-1/4 w-3 h-3 ${getOpacity()}`}>
        <svg viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="10" r="2" />
          <circle cx="6" cy="6" r="1.5" />
          <circle cx="14" cy="6" r="1.5" />
          <circle cx="6" cy="14" r="1.5" />
          <circle cx="14" cy="14" r="1.5" />
        </svg>
      </div>
      <div className={`absolute bottom-1/3 right-1/4 w-2 h-2 ${getOpacity()}`}>
        <svg viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="10" r="2" />
          <circle cx="6" cy="6" r="1.5" />
          <circle cx="14" cy="6" r="1.5" />
          <circle cx="6" cy="14" r="1.5" />
          <circle cx="14" cy="14" r="1.5" />
        </svg>
      </div>
    </div>
  );
};

export default ManekiNekoBackground; 