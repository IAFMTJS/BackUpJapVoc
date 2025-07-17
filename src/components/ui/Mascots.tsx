import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface MascotsProps {
  variant?: 'welcome' | 'loading' | 'achievement' | 'error';
  size?: 'small' | 'medium' | 'large';
  showTorii?: boolean;
  className?: string;
}

const Mascots: React.FC<MascotsProps> = ({
  variant = 'welcome',
  size = 'medium',
  showTorii = true,
  className = ''
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Size mappings
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  };

  // Animation classes based on variant
  const getAnimationClass = () => {
    switch (variant) {
      case 'loading':
        return 'animate-bounce-soft';
      case 'achievement':
        return 'animate-bounce-soft';
      case 'error':
        return 'animate-shake';
      default:
        return 'animate-fade-in';
    }
  };

  // Get the correct image based on theme
  const getMascotImage = () => {
    if (isDark) {
      return '/assets/mascots/Maneki Neko and penguin Dark mode.PNG';
    } else {
      return '/assets/mascots/Maneki Neko and penguin Light mode.PNG';
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Combined Mascots Image */}
      <div className={`${getAnimationClass()} transform scale-75 lg:scale-100`}>
        <img
          src={getMascotImage()}
          alt="Maneki Neko and Penguin Mascots"
          className={`${sizeClasses[size]} object-contain drop-shadow-lg`}
          onError={(e) => {
            console.error('Failed to load mascot image:', e);
            // Fallback to SVG if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        
        {/* Fallback SVG (simplified version) */}
        <svg className={`${sizeClasses[size]} hidden`} viewBox="0 0 200 200" fill="none">
          {/* Torii Gate Background */}
          <path 
            d="M20 180 L20 120 L80 120 L80 100 L120 100 L120 120 L180 120 L180 180 L20 180 Z" 
            fill="#C44536"
            opacity="0.2"
          />
          <path 
            d="M40 100 L40 80 L160 80 L160 100 L40 100 Z" 
            fill="#8B4513"
            opacity="0.2"
          />
          <path 
            d="M60 80 L60 60 L140 60 L140 80 L60 80 Z" 
            fill="#C44536"
            opacity="0.2"
          />
          
          {/* Maneki Neko (simplified) */}
          <circle cx="70" cy="120" r="15" fill="white" />
          <circle cx="70" cy="105" r="12" fill="white" />
          <circle cx="65" cy="100" r="2" fill="black" />
          <circle cx="75" cy="100" r="2" fill="black" />
          <ellipse cx="70" cy="110" rx="2" ry="1" fill="black" />
          <ellipse cx="70" cy="115" rx="10" ry="2" fill="#D45A38" />
          <circle cx="70" cy="114" r="1.5" fill="#F4B942" />
          
          {/* Penguin (simplified) */}
          <ellipse cx="130" cy="120" r="12" ry="20" fill="black" />
          <ellipse cx="130" cy="115" r="6" ry="12" fill="white" />
          <circle cx="130" cy="105" r="10" fill="black" />
          <circle cx="127" cy="103" r="1.5" fill="white" />
          <circle cx="133" cy="103" r="1.5" fill="white" />
          <ellipse cx="130" cy="110" rx="1.5" ry="0.8" fill="#F4B942" />
          <rect x="120" y="115" width="20" height="20" rx="3" fill={isDark ? "#23242A" : "#F5F0E8"} stroke={isDark ? "#3A3B42" : "#E0E0E0"} strokeWidth="1" />
          <rect x="128" y="117" width="4" height="16" fill="#D45A38" />
          <ellipse cx="125" cy="125" rx="2" ry="1" fill="#F4B942" />
          <ellipse cx="135" cy="125" rx="2" ry="1" fill="#F4B942" />
        </svg>
      </div>

      {/* Cultural Elements (optional decorative dots) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-30">
        <div className="w-8 h-8 bg-japanese-red rounded-full"></div>
      </div>
      <div className="absolute top-8 right-4 opacity-20">
        <div className="w-6 h-6 bg-accent-yellow dark:bg-accent-yellow-dark rounded-full"></div>
      </div>
      <div className="absolute bottom-4 left-4 opacity-25">
        <div className="w-4 h-4 bg-japanese-red rounded-full"></div>
      </div>
    </div>
  );
};

export default Mascots; 