import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import cityscapeSvg from '../assets/cityscape.svg';
import noiseSvg from '../assets/noise.svg';
import toriiSvg from '../assets/torii.svg';

const Home: React.FC = () => {
  const { getThemeClasses, theme } = useTheme();
  const themeClasses = getThemeClasses();
  const isDarkMode = theme === 'dark';
  const isNeonMode = theme === 'neon';

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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-12">
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent h-1 -bottom-4 ${isNeonMode ? 'via-neon-pink/20' : ''}`}></div>
            <h1 className={`text-5xl md:text-6xl font-extrabold text-center tracking-tight ${
              isNeonMode 
                ? 'text-neon-pink drop-shadow-[0_0_16px_#ff00c8]' 
                : themeClasses.text.primary
            }`}>
              Welcome to Japanese Vocabulary Learning
            </h1>
            <p className={`text-xl text-center mt-6 max-w-2xl mx-auto ${
              isNeonMode 
                ? 'text-neon-blue drop-shadow-[0_0_12px_#00f7ff]' 
                : themeClasses.text.secondary
            }`}>
              Your journey to mastering Japanese starts here
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { to: '/writing', icon: '✍️', title: 'Writing Practice', desc: 'Practice writing Japanese characters' },
              { to: '/anime', icon: '🎌', title: 'Anime & Manga', desc: 'Learn phrases from your favorite shows' },
              { to: '/vocabulary', icon: '📚', title: 'Vocabulary', desc: 'Build your Japanese vocabulary' },
              { to: '/kanji', icon: '漢字', title: 'Kanji Study', desc: 'Master Japanese characters' },
              { to: '/dictionary', icon: '📖', title: 'Dictionary', desc: 'Look up Japanese words and phrases' },
              { to: '/romaji', icon: '🔤', title: 'Romaji Practice', desc: 'Learn Japanese pronunciation' },
              { to: '/srs', icon: '🔄', title: 'SRS Learning', desc: 'Optimize your learning with spaced repetition' },
              { to: '/games', icon: '🎮', title: 'Games', desc: 'Learn through fun interactive games' },
              { to: '/progress', icon: '📊', title: 'Progress', desc: 'Track your learning journey' },
              { to: '/word-levels', icon: '📈', title: 'Word Levels', desc: 'Progress through vocabulary levels' },
              { to: '/achievements', icon: '🏆', title: 'Achievements', desc: 'Earn badges and track your accomplishments' }
            ].map((item, index) => (
              <Link 
                key={item.to}
                to={item.to} 
                className={`p-6 rounded-xl transition-all duration-300 ${
                  isNeonMode
                    ? index % 2 === 0
                      ? 'bg-neon-pink/10 border-2 border-neon-pink hover:shadow-[0_0_20px_rgba(255,0,200,0.3)]'
                      : 'bg-neon-blue/10 border-2 border-neon-blue hover:shadow-[0_0_20px_rgba(0,247,255,0.3)]'
                    : `${themeClasses.card} border ${themeClasses.border} ${isDarkMode ? 'hover:shadow-[0_0_20px_rgba(0,149,255,0.3)]' : ''}`
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <h2 className={`text-lg font-semibold ${
                    isNeonMode
                      ? index % 2 === 0 ? 'text-neon-pink' : 'text-neon-blue'
                      : themeClasses.text.primary
                  }`}>{item.title}</h2>
                </div>
                <p className={`mt-2 ${
                  isNeonMode
                    ? index % 2 === 0 ? 'text-neon-blue/80' : 'text-neon-pink/80'
                    : themeClasses.text.secondary
                }`}>{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 