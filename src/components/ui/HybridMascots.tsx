import React from 'react';
import { useTheme } from '../../context/ThemeContext';

// Import mascot images
import lightMascot from '../../../public/assets/mascots/Maneki Neko and penguin Light mode.PNG';
import darkMascot from '../../../public/assets/mascots/Maneki Neko and penguin Dark mode.PNG';

// Import emotion mascot images
import happyMascot from '../../../public/assets/MascotsEmotions/Happy Maneki Neko.PNG';
import veryHappyMascot from '../../../public/assets/MascotsEmotions/Very Very Happy Maneki Neko.PNG';
import extremelyHappyMascot from '../../../public/assets/MascotsEmotions/Extremele Happy Proud Maneki Neko.PNG';
import goodJobMascot from '../../../public/assets/MascotsEmotions/Good Job Maneki Neko.PNG';
import veryGoodJobMascot from '../../../public/assets/MascotsEmotions/Very Good Job Maneki Neko.PNG';
import averageGoodJobMascot from '../../../public/assets/MascotsEmotions/Average good job Maneki Neko.PNG';
import congratulationsMascot from '../../../public/assets/MascotsEmotions/Congratulations Both.PNG';
import successMascot from '../../../public/assets/MascotsEmotions/Together Succes.PNG';
import confidentMascot from '../../../public/assets/MascotsEmotions/Confident Maneki Neko.PNG';
import smugMascot from '../../../public/assets/MascotsEmotions/Smug Maneki Neko.PNG';
import loveMascot from '../../../public/assets/MascotsEmotions/Love Maneki Neko.PNG';
import inLoveMascot from '../../../public/assets/MascotsEmotions/In Love Both.PNG';
import angryMascot from '../../../public/assets/MascotsEmotions/Angry Maneki Neko.PNG';
import disappointedMascot from '../../../public/assets/MascotsEmotions/Dissapointed Maneki Neko.PNG';
import veryDisappointedMascot from '../../../public/assets/MascotsEmotions/Very Dissapointed Maneki Neko.PNG';
import bothDisappointedMascot from '../../../public/assets/MascotsEmotions/Both Dissapointed.PNG';
import cryingMascot from '../../../public/assets/MascotsEmotions/Crying Maneki Neko.PNG';
import shockedMascot from '../../../public/assets/MascotsEmotions/Shocked Maneki Neko.PNG';
import sadPenguinMascot from '../../../public/assets/MascotsEmotions/Sad Penguin.PNG';
import verySadPenguinMascot from '../../../public/assets/MascotsEmotions/Very Sad Penguin.PNG';
import verySadPenguinsMascot from '../../../public/assets/MascotsEmotions/Very Sad Penguins.PNG';
import confusedPenguinMascot from '../../../public/assets/MascotsEmotions/Confused Penguin.PNG';
import disappointedPenguinMascot from '../../../public/assets/MascotsEmotions/Dissapointed Penguin.PNG';
import annoyedPenguinMascot from '../../../public/assets/MascotsEmotions/Annoyed Penguin.PNG';
import smugPenguinMascot from '../../../public/assets/MascotsEmotions/Smug Penguin.PNG';
import goodJobPenguinMascot from '../../../public/assets/MascotsEmotions/Good Job Penguin.PNG';
import neutralPenguinMascot from '../../../public/assets/MascotsEmotions/Neutral Penguin.PNG';

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
    light: lightMascot,
    dark: darkMascot
  };

  // Comprehensive emotion mapping for mascots
  const emotionMascotImages = {
    // Happy emotions
    happy: {
      light: happyMascot,
      dark: happyMascot
    },
    veryHappy: {
      light: veryHappyMascot,
      dark: veryHappyMascot
    },
    extremelyHappy: {
      light: extremelyHappyMascot,
      dark: extremelyHappyMascot
    },
    
    // Success/Achievement emotions
    goodJob: {
      light: goodJobMascot,
      dark: goodJobMascot
    },
    veryGoodJob: {
      light: veryGoodJobMascot,
      dark: veryGoodJobMascot
    },
    averageGoodJob: {
      light: averageGoodJobMascot,
      dark: averageGoodJobMascot
    },
    congratulations: {
      light: congratulationsMascot,
      dark: congratulationsMascot
    },
    success: {
      light: successMascot,
      dark: successMascot
    },
    
    // Confident emotions
    confident: {
      light: confidentMascot,
      dark: confidentMascot
    },
    smug: {
      light: smugMascot,
      dark: smugMascot
    },
    
    // Love emotions
    love: {
      light: loveMascot,
      dark: loveMascot
    },
    inLove: {
      light: inLoveMascot,
      dark: inLoveMascot
    },
    
    // Negative emotions
    angry: {
      light: angryMascot,
      dark: angryMascot
    },
    disappointed: {
      light: disappointedMascot,
      dark: disappointedMascot
    },
    veryDisappointed: {
      light: veryDisappointedMascot,
      dark: veryDisappointedMascot
    },
    bothDisappointed: {
      light: bothDisappointedMascot,
      dark: bothDisappointedMascot
    },
    crying: {
      light: cryingMascot,
      dark: cryingMascot
    },
    shocked: {
      light: shockedMascot,
      dark: shockedMascot
    },
    
    // Penguin emotions
    sadPenguin: {
      light: sadPenguinMascot,
      dark: sadPenguinMascot
    },
    verySadPenguin: {
      light: verySadPenguinMascot,
      dark: verySadPenguinMascot
    },
    verySadPenguins: {
      light: verySadPenguinsMascot,
      dark: verySadPenguinsMascot
    },
    confusedPenguin: {
      light: confusedPenguinMascot,
      dark: confusedPenguinMascot
    },
    disappointedPenguin: {
      light: disappointedPenguinMascot,
      dark: disappointedPenguinMascot
    },
    annoyedPenguin: {
      light: annoyedPenguinMascot,
      dark: annoyedPenguinMascot
    },
    smugPenguin: {
      light: smugPenguinMascot,
      dark: smugPenguinMascot
    },
    goodJobPenguin: {
      light: goodJobPenguinMascot,
      dark: goodJobPenguinMascot
    },
    neutralPenguin: {
      light: neutralPenguinMascot,
      dark: neutralPenguinMascot
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