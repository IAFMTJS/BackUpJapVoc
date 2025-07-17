import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface HybridMascotsProps {
  variant?: 'welcome' | 'loading' | 'achievement' | 'error' | 'motivation' | 'support' | 'determination' | 'happy' | 'angry' | 'sad' | 'proud' | 'excited' | 'confused' | 'disappointed' | 'love' | 'shocked' | 'smug' | 'confident' | 'crying' | 'annoyed' | 'neutral' | 'success' | 'celebration';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
  type?: 'anime' | 'emoji' | 'hybrid' | 'original' | 'emotions';
  character?: 'naruto' | 'gon' | 'kaneki' | 'natsu' | 'rin' | 'lucy' | 'sasuke' | 'tanjiro' | 'hisoka' | 'hide' | 'random';
  // New props for emotion-based selection
  progress?: number; // 0-100 for progress-based emotions
  performance?: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
  context?: 'quiz' | 'study' | 'achievement' | 'streak' | 'goal' | 'welcome' | 'error' | 'motivation';
  mood?: 'positive' | 'negative' | 'neutral' | 'mixed';
}

const HybridMascots: React.FC<HybridMascotsProps> = ({
  variant = 'welcome',
  size = 'medium',
  className = '',
  type = 'hybrid',
  character = 'random',
  progress,
  performance,
  context,
  mood
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Size mappings
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
    xlarge: 'w-48 h-48'
  };

  // Original mascot images (Maneki Neko + Penguin)
  const originalMascotImages = {
    light: './assets/mascots/Maneki Neko and penguin Light mode.PNG',
    dark: './assets/mascots/Maneki Neko and penguin Dark mode.PNG'
  };

  // Comprehensive emotion mapping for mascots
  const emotionMascotImages = {
    // Happy emotions
    happy: {
      light: './assets/MascotsEmotions/Happy Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Happy Maneki Neko.PNG'
    },
    veryHappy: {
      light: './assets/MascotsEmotions/Very Very Happy Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Very Very Happy Maneki Neko.PNG'
    },
    extremelyHappy: {
      light: './assets/MascotsEmotions/Extremele Happy Proud Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Extremele Happy Proud Maneki Neko.PNG'
    },
    
    // Success/Achievement emotions
    goodJob: {
      light: './assets/MascotsEmotions/Good Job Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Good Job Maneki Neko.PNG'
    },
    veryGoodJob: {
      light: './assets/MascotsEmotions/Very Good Job Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Very Good Job Maneki Neko.PNG'
    },
    averageGoodJob: {
      light: './assets/MascotsEmotions/Average good job Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Average good job Maneki Neko.PNG'
    },
    congratulations: {
      light: './assets/MascotsEmotions/Congratulations Both.PNG',
      dark: './assets/MascotsEmotions/Congratulations Both.PNG'
    },
    success: {
      light: './assets/MascotsEmotions/Together Succes.PNG',
      dark: './assets/MascotsEmotions/Together Succes.PNG'
    },
    
    // Confident emotions
    confident: {
      light: './assets/MascotsEmotions/Confident Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Confident Maneki Neko.PNG'
    },
    smug: {
      light: './assets/MascotsEmotions/Smug Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Smug Maneki Neko.PNG'
    },
    
    // Love emotions
    love: {
      light: './assets/MascotsEmotions/Love Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Love Maneki Neko.PNG'
    },
    inLove: {
      light: './assets/MascotsEmotions/In Love Both.PNG',
      dark: './assets/MascotsEmotions/In Love Both.PNG'
    },
    
    // Negative emotions
    angry: {
      light: './assets/MascotsEmotions/Angry Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Angry Maneki Neko.PNG'
    },
    disappointed: {
      light: './assets/MascotsEmotions/Dissapointed Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Dissapointed Maneki Neko.PNG'
    },
    veryDisappointed: {
      light: './assets/MascotsEmotions/Very Dissapointed Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Very Dissapointed Maneki Neko.PNG'
    },
    bothDisappointed: {
      light: './assets/MascotsEmotions/Both Dissapointed.PNG',
      dark: './assets/MascotsEmotions/Both Dissapointed.PNG'
    },
    crying: {
      light: './assets/MascotsEmotions/Crying Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Crying Maneki Neko.PNG'
    },
    shocked: {
      light: './assets/MascotsEmotions/Shocked Maneki Neko.PNG',
      dark: './assets/MascotsEmotions/Shocked Maneki Neko.PNG'
    },
    
    // Penguin emotions
    sadPenguin: {
      light: './assets/MascotsEmotions/Sad Penguin.PNG',
      dark: './assets/MascotsEmotions/Sad Penguin.PNG'
    },
    verySadPenguin: {
      light: './assets/MascotsEmotions/Very Sad Penguin.PNG',
      dark: './assets/MascotsEmotions/Very Sad Penguin.PNG'
    },
    verySadPenguins: {
      light: './assets/MascotsEmotions/Very Sad Penguins.PNG',
      dark: './assets/MascotsEmotions/Very Sad Penguins.PNG'
    },
    confusedPenguin: {
      light: './assets/MascotsEmotions/Confused Penguin.PNG',
      dark: './assets/MascotsEmotions/Confused Penguin.PNG'
    },
    disappointedPenguin: {
      light: './assets/MascotsEmotions/Dissapointed Penguin.PNG',
      dark: './assets/MascotsEmotions/Dissapointed Penguin.PNG'
    },
    annoyedPenguin: {
      light: './assets/MascotsEmotions/Annoyed Penguin.PNG',
      dark: './assets/MascotsEmotions/Annoyed Penguin.PNG'
    },
    smugPenguin: {
      light: './assets/MascotsEmotions/Smug Penguin.PNG',
      dark: './assets/MascotsEmotions/Smug Penguin.PNG'
    },
    goodJobPenguin: {
      light: './assets/MascotsEmotions/Good Job Penguin.PNG',
      dark: './assets/MascotsEmotions/Good Job Penguin.PNG'
    },
    neutralPenguin: {
      light: './assets/MascotsEmotions/Neutral Penguin.PNG',
      dark: './assets/MascotsEmotions/Neutral Penguin.PNG'
    }
  };

  // Anime character images
  const animeCharacterImages = {
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

  // Emoji mascots
  const emojiMascots = {
    maneki: '🐱',
    penguin: '🐧',
    torii: '⛩️',
    cat: '🐱',
    sensei: '👨‍🏫',
    student: '👨‍🎓'
  };

  // Smart emotion selection based on context and performance
  const getEmotionBasedOnContext = () => {
    // If specific emotion is provided, use it
    if (variant && emotionMascotImages[variant as keyof typeof emotionMascotImages]) {
      return variant;
    }

    // Performance-based emotions
    if (performance) {
      switch (performance) {
        case 'excellent':
          return 'extremelyHappy';
        case 'good':
          return 'veryGoodJob';
        case 'average':
          return 'averageGoodJob';
        case 'poor':
          return 'disappointed';
        case 'terrible':
          return 'crying';
        default:
          return 'neutralPenguin';
      }
    }

    // Progress-based emotions
    if (progress !== undefined) {
      if (progress >= 90) return 'extremelyHappy';
      if (progress >= 80) return 'veryGoodJob';
      if (progress >= 70) return 'goodJob';
      if (progress >= 50) return 'averageGoodJob';
      if (progress >= 30) return 'disappointed';
      return 'crying';
    }

    // Context-based emotions
    if (context) {
      switch (context) {
        case 'achievement':
          return 'congratulations';
        case 'success':
          return 'success';
        case 'quiz':
          return 'confident';
        case 'study':
          return 'goodJob';
        case 'streak':
          return 'love';
        case 'goal':
          return 'veryGoodJob';
        case 'welcome':
          return 'happy';
        case 'error':
          return 'shocked';
        case 'motivation':
          return 'confident';
        default:
          return 'happy';
      }
    }

    // Mood-based emotions
    if (mood) {
      switch (mood) {
        case 'positive':
          return 'happy';
        case 'negative':
          return 'disappointed';
        case 'neutral':
          return 'neutralPenguin';
        case 'mixed':
          return 'confusedPenguin';
        default:
          return 'happy';
      }
    }

    // Default fallback
    return 'happy';
  };

  // Get the appropriate mascot based on type
  const getMascotContent = () => {
    switch (type) {
      case 'emotions':
        const emotionKey = getEmotionBasedOnContext();
        const emotionImage = emotionMascotImages[emotionKey as keyof typeof emotionMascotImages];
        return {
          type: 'image',
          src: isDark ? emotionImage.dark : emotionImage.light,
          alt: `${emotionKey} mascot emotion`,
          fallback: '🐱🐧'
        };
      
      case 'original':
        return {
          type: 'image',
          src: isDark ? originalMascotImages.dark : originalMascotImages.light,
          alt: 'Maneki Neko and Penguin Mascots',
          fallback: '🐱🐧'
        };
      
      case 'anime':
        const animeImage = character === 'random' 
          ? Object.values(animeCharacterImages)[Math.floor(Math.random() * Object.values(animeCharacterImages).length)]
          : animeCharacterImages[character] || animeCharacterImages.naruto;
        return {
          type: 'image',
          src: animeImage,
          alt: `${character} character`,
          fallback: '🐱'
        };
      
      case 'emoji':
        return {
          type: 'emoji',
          content: `${emojiMascots.maneki} ${emojiMascots.penguin} ${emojiMascots.torii}`,
          fallback: '🐱🐧⛩️'
        };
      
      case 'hybrid':
      default:
        // Use emotion-based mascots for hybrid type
        const hybridEmotionKey = getEmotionBasedOnContext();
        const hybridEmotionImage = emotionMascotImages[hybridEmotionKey as keyof typeof emotionMascotImages];
        return {
          type: 'image',
          src: isDark ? hybridEmotionImage.dark : hybridEmotionImage.light,
          alt: `${hybridEmotionKey} mascot emotion`,
          fallback: '🐱🐧'
        };
    }
  };

  const mascotContent = getMascotContent();
  const currentEmotionKey = getEmotionBasedOnContext();

  // Enhanced animation classes
  const getAnimationClass = () => {
    // Emotion-specific animations
    if (currentEmotionKey.includes('Happy') || currentEmotionKey.includes('Good') || currentEmotionKey.includes('Success')) {
      return 'animate-bounce';
    }
    if (currentEmotionKey.includes('Crying') || currentEmotionKey.includes('Sad') || currentEmotionKey.includes('Disappointed')) {
      return 'animate-pulse';
    }
    if (currentEmotionKey.includes('Shocked') || currentEmotionKey.includes('Confused')) {
      return 'animate-pulse';
    }
    if (currentEmotionKey.includes('Love') || currentEmotionKey.includes('Congratulations')) {
      return 'animate-bounce';
    }
    
    // Fallback to variant-based animations
    switch (variant) {
      case 'loading':
        return 'animate-pulse';
      case 'achievement':
        return 'animate-bounce';
      case 'error':
        return 'animate-pulse';
      case 'motivation':
        return 'animate-pulse';
      case 'support':
        return 'animate-fade-in';
      case 'determination':
        return 'animate-pulse';
      case 'happy':
        return 'animate-bounce';
      case 'angry':
        return 'animate-pulse';
      case 'sad':
        return 'animate-fade-in';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div className={`${getAnimationClass()} transform scale-75 lg:scale-100`}>
        {mascotContent.type === 'image' ? (
          <div className={`${sizeClasses[size]} relative overflow-hidden rounded-full border-4 border-japanese-red shadow-lg`}>
            <img
              src={mascotContent.src}
              alt={mascotContent.alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load mascot image:', e);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            {/* Fallback emoji */}
            <div className={`${sizeClasses[size]} hidden flex items-center justify-center bg-gradient-to-br from-japanese-red to-japanese-earth text-white text-2xl`}>
              {mascotContent.fallback}
            </div>
          </div>
        ) : (
          <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-japanese-red to-japanese-earth rounded-full border-4 border-japanese-red shadow-lg text-white text-2xl`}>
            {mascotContent.content}
          </div>
        )}
      </div>
      
      {/* Mascot label */}
      <div className="mt-2 text-center">
        <p className="text-xs font-medium text-text-primary dark:text-text-dark-primary capitalize">
          {type === 'emotions' ? currentEmotionKey.replace(/([A-Z])/g, ' $1').toLowerCase() :
           type === 'original' ? 'mascots' : 
           type === 'anime' ? (character === 'random' ? 'anime' : character) :
           type === 'emoji' ? 'friends' : 'companions'}
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-yellow dark:bg-accent-yellow-dark rounded-full opacity-60"></div>
      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-japanese-red rounded-full opacity-40"></div>
    </div>
  );
};

export default HybridMascots; 