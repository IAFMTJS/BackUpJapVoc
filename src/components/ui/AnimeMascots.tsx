import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface AnimeMascotsProps {
  variant?: 'welcome' | 'loading' | 'achievement' | 'error' | 'motivation' | 'support' | 'determination' | 'happy' | 'angry' | 'sad';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  character?: 'naruto' | 'gon' | 'kaneki' | 'natsu' | 'rin' | 'lucy' | 'sasuke' | 'tanjiro' | 'hisoka' | 'hide' | 'random';
}

const AnimeMascots: React.FC<AnimeMascotsProps> = ({
  variant = 'welcome',
  size = 'medium',
  className = '',
  character = 'random'
}) => {
  const { theme } = useTheme();

  // Size mappings
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  // Character image mappings
  const characterImages = {
    naruto: '/anime/naruto-happy.jpg',
    gon: '/anime/gon-happy.jpg',
    kaneki: '/anime/kaneki-angry.jpg',
    natsu: '/anime/natsu-happy.jpg',
    rin: '/anime/rin-determined.jpg',
    lucy: '/anime/lucy-supportive.png',
    sasuke: '/anime/sasuke-angry.jpg',
    tanjiro: '/anime/tanjiro-demonslayer.JPG',
    hisoka: '/anime/hisoka-hxh.JPG',
    hide: '/anime/hide-tokyoghoul.JPG'
  };

  // Get character image
  const getCharacterImage = () => {
    if (character === 'random') {
      const chars = Object.keys(characterImages);
      const randomChar = chars[Math.floor(Math.random() * chars.length)];
      return characterImages[randomChar as keyof typeof characterImages];
    }
    return characterImages[character] || characterImages.naruto;
  };

  // Animation classes
  const getAnimationClass = () => {
    switch (variant) {
      case 'loading':
        return 'animate-pulse';
      case 'achievement':
        return 'animate-bounce';
      case 'error':
        return 'animate-pulse';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div className={`${getAnimationClass()} transform scale-75 lg:scale-100`}>
        <div className={`${sizeClasses[size]} relative overflow-hidden rounded-full border-4 border-japanese-red shadow-lg`}>
          <img
            src={getCharacterImage()}
            alt={`${character} character`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load anime mascot image:', e);
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          {/* Fallback emoji */}
          <div className={`${sizeClasses[size]} hidden flex items-center justify-center bg-gradient-to-br from-japanese-red to-japanese-earth text-white text-2xl`}>
            🐱
          </div>
        </div>
      </div>
      
      {/* Character name */}
      <div className="mt-2 text-center">
        <p className="text-xs font-medium text-text-primary dark:text-text-dark-primary capitalize">
          {character === 'random' ? 'anime' : character}
        </p>
      </div>
    </div>
  );
};

export default AnimeMascots; 