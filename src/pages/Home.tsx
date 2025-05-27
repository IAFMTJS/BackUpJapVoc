import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import cityscapeSvg from '../assets/cityscape.svg';
import noiseSvg from '../assets/noise.svg';
import toriiSvg from '../assets/torii.svg';
import { motion } from 'framer-motion';

// Feature categories for better organization
const FEATURE_CATEGORIES = [
  {
    title: 'Core Learning',
    items: [
      { to: '/vocabulary', icon: '📚', title: 'Vocabulary', desc: 'Build your Japanese vocabulary', color: 'blue' },
      { to: '/new-words', icon: '🆕', title: 'New Words', desc: 'Learn and track new vocabulary', color: 'green' },
      { to: '/kanji', icon: '漢字', title: 'Kanji Study', desc: 'Master Japanese characters', color: 'purple' },
      { to: '/writing', icon: '✍️', title: 'Writing Practice', desc: 'Practice writing Japanese characters', color: 'green' },
      { to: '/romaji', icon: '🔤', title: 'Romaji Practice', desc: 'Learn Japanese pronunciation', color: 'orange' }
    ]
  },
  {
    title: 'Practice & Games',
    items: [
      { to: '/srs', icon: '🔄', title: 'SRS Learning', desc: 'Optimize your learning with spaced repetition', color: 'pink' },
      { to: '/games', icon: '🎮', title: 'Games', desc: 'Learn through fun interactive games', color: 'yellow' },
      { to: '/anime', icon: '🎌', title: 'Anime & Manga', desc: 'Learn phrases from your favorite shows', color: 'red' },
      { to: '/dictionary', icon: '📖', title: 'Dictionary', desc: 'Look up Japanese words and phrases', color: 'indigo' }
    ]
  },
  {
    title: 'Progress & Achievements',
    items: [
      { to: '/progress', icon: '📊', title: 'Progress', desc: 'Track your learning journey', color: 'teal' },
      { to: '/word-levels', icon: '📈', title: 'Word Levels', desc: 'Progress through vocabulary levels', color: 'cyan' },
      { to: '/achievements', icon: '🏆', title: 'Achievements', desc: 'Earn badges and track your accomplishments', color: 'amber' }
    ]
  }
];

// Color mapping for different themes
const COLOR_MAPPING = {
  blue: { light: 'bg-blue-50 text-blue-700', dark: 'bg-blue-900/20 text-blue-300', neon: 'bg-blue-500/10 text-blue-300' },
  purple: { light: 'bg-purple-50 text-purple-700', dark: 'bg-purple-900/20 text-purple-300', neon: 'bg-purple-500/10 text-purple-300' },
  green: { light: 'bg-green-50 text-green-700', dark: 'bg-green-900/20 text-green-300', neon: 'bg-green-500/10 text-green-300' },
  orange: { light: 'bg-orange-50 text-orange-700', dark: 'bg-orange-900/20 text-orange-300', neon: 'bg-orange-500/10 text-orange-300' },
  pink: { light: 'bg-pink-50 text-pink-700', dark: 'bg-pink-900/20 text-pink-300', neon: 'bg-pink-500/10 text-pink-300' },
  yellow: { light: 'bg-yellow-50 text-yellow-700', dark: 'bg-yellow-900/20 text-yellow-300', neon: 'bg-yellow-500/10 text-yellow-300' },
  red: { light: 'bg-red-50 text-red-700', dark: 'bg-red-900/20 text-red-300', neon: 'bg-red-500/10 text-red-300' },
  indigo: { light: 'bg-indigo-50 text-indigo-700', dark: 'bg-indigo-900/20 text-indigo-300', neon: 'bg-indigo-500/10 text-indigo-300' },
  teal: { light: 'bg-teal-50 text-teal-700', dark: 'bg-teal-900/20 text-teal-300', neon: 'bg-teal-500/10 text-teal-300' },
  cyan: { light: 'bg-cyan-50 text-cyan-700', dark: 'bg-cyan-900/20 text-cyan-300', neon: 'bg-cyan-500/10 text-cyan-300' },
  amber: { light: 'bg-amber-50 text-amber-700', dark: 'bg-amber-900/20 text-amber-300', neon: 'bg-amber-500/10 text-amber-300' }
};

const Home: React.FC = () => {
  const { getThemeClasses, theme } = useTheme();
  const themeClasses = getThemeClasses();
  const isDarkMode = theme === 'dark';
  const isNeonMode = theme === 'neon';

  const getColorClasses = (color: string) => {
    const mapping = COLOR_MAPPING[color as keyof typeof COLOR_MAPPING];
    if (isNeonMode) return mapping.neon;
    return isDarkMode ? mapping.dark : mapping.light;
  };

  return (
    <div className={`relative min-h-screen ${isNeonMode ? 'bg-neon-dark' : ''}`}>
      {/* Background elements for neon mode */}
      {isNeonMode && (
        <>
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img 
              src={noiseSvg}
              alt="" 
              className="w-full h-full object-cover opacity-50"
              style={{ mixBlendMode: 'overlay' }}
            />
          </div>
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <img 
              src={cityscapeSvg}
              alt="" 
              className="w-full h-full object-cover"
              style={{ 
                transform: 'translateY(20%)',
                filter: 'brightness(0.8) contrast(1.2)'
              }}
            />
          </div>
          {/* Decorative torii gates */}
          <div className="absolute inset-0 pointer-events-none">
            <img 
              src={toriiSvg}
              alt=""
              className="absolute top-1/4 -left-16 w-32 h-32 transform -rotate-12 opacity-10"
            />
            <img 
              src={toriiSvg}
              alt=""
              className="absolute bottom-1/4 -right-16 w-32 h-32 transform rotate-12 opacity-10"
            />
            <img 
              src={toriiSvg}
              alt=""
              className="absolute top-1/2 right-1/4 w-24 h-24 transform rotate-45 opacity-8"
            />
            <img 
              src={toriiSvg}
              alt=""
              className="absolute bottom-1/3 left-1/4 w-24 h-24 transform -rotate-45 opacity-8"
            />
          </div>
        </>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10"></div>
        <div className="container mx-auto px-4 pt-20 pb-12 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight mb-4 ${
              isNeonMode 
                ? 'text-neon-pink drop-shadow-[0_0_16px_#ff00c8]' 
                : themeClasses.text.primary
            }`}>
              Japanese Vocabulary Learning
            </h1>
            <p className={`text-lg md:text-xl max-w-2xl mx-auto ${
              isNeonMode 
                ? 'text-neon-blue drop-shadow-[0_0_12px_#00f7ff]' 
                : themeClasses.text.secondary
            }`}>
              Your journey to mastering Japanese starts here
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 relative z-20">
        <div className="space-y-12">
          {FEATURE_CATEGORIES.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="space-y-4"
            >
              <h2 className={`text-2xl font-bold ${
                isNeonMode 
                  ? 'text-neon-pink drop-shadow-[0_0_8px_#ff00c8]' 
                  : themeClasses.text.primary
              }`}>
                {category.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      to={item.to}
                      className={`block p-6 rounded-2xl transition-all duration-300 ${
                        isNeonMode
                          ? 'bg-black/20 backdrop-blur-md border border-white/10 hover:border-white/20'
                          : `${getColorClasses(item.color)} hover:shadow-lg`
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <span className={`text-3xl ${isNeonMode ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`}>
                          {item.icon}
                        </span>
                        <div>
                          <h3 className={`text-lg font-semibold mb-1 ${
                            isNeonMode 
                              ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
                              : ''
                          }`}>
                            {item.title}
                          </h3>
                          <p className={`text-sm ${
                            isNeonMode 
                              ? 'text-white/70' 
                              : isDarkMode 
                                ? 'text-gray-300' 
                                : 'text-gray-600'
                          }`}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 