import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ToriiGate from './ToriiGate';

const Home: React.FC = () => {
  const { getThemeClasses, isDarkMode } = useTheme();
  const themeClasses = getThemeClasses();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative torii gates */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <ToriiGate 
          className="absolute top-1/4 -left-16 transform -rotate-12" 
          size="large" 
          opacity={0.1} 
        />
        <ToriiGate 
          className="absolute bottom-1/4 -right-16 transform rotate-12" 
          size="large" 
          opacity={0.1} 
        />
        <ToriiGate 
          className="absolute top-1/2 right-1/4 transform rotate-45" 
          size="small" 
          opacity={0.08} 
        />
        <ToriiGate 
          className="absolute bottom-1/3 left-1/4 transform -rotate-45" 
          size="small" 
          opacity={0.08} 
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-4xl font-bold mb-8 text-center ${themeClasses.text.primary}`}>
            Welcome to Japanese Vocabulary Learning
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              to="/writing" 
              className={`p-6 rounded-xl ${themeClasses.card} border ${themeClasses.border} ${isDarkMode ? 'hover:shadow-[0_0_20px_rgba(0,149,255,0.3)]' : ''} transition-all duration-300`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✍️</span>
                <h2 className={`text-lg font-semibold ${themeClasses.text.primary}`}>Writing Practice</h2>
              </div>
              <p className={`mt-2 ${themeClasses.text.secondary}`}>Practice writing Japanese characters</p>
            </Link>

            <Link 
              to="/anime" 
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-neon-pink/20 to-neon-blue/20' : 'bg-gradient-to-br from-pink-500 to-purple-600'} 
                ${isDarkMode ? 'border border-neon-pink/30' : 'border-0'} 
                ${isDarkMode ? 'text-neon-pink' : 'text-white'} 
                hover:shadow-[0_0_20px_rgba(255,0,128,0.3)] transition-all duration-300`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎌</span>
                <h2 className={`text-lg font-semibold`}>Anime & Manga</h2>
              </div>
              <p className={`mt-2 ${isDarkMode ? 'text-neon-blue' : 'text-white/80'}`}>
                Learn phrases from your favorite shows
              </p>
            </Link>

            <Link 
              to="/trivia" 
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-neon-green/20 to-neon-yellow/20' : 'bg-gradient-to-br from-green-500 to-yellow-500'} 
                ${isDarkMode ? 'border border-neon-green/30' : 'border-0'} 
                ${isDarkMode ? 'text-neon-green' : 'text-white'} 
                hover:shadow-[0_0_20px_rgba(0,255,128,0.3)] transition-all duration-300`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎯</span>
                <h2 className={`text-lg font-semibold`}>Japanese Trivia</h2>
              </div>
              <p className={`mt-2 ${isDarkMode ? 'text-neon-yellow' : 'text-white/80'}`}>
                Discover fascinating facts about Japanese culture, history, and more
              </p>
            </Link>

            <Link 
              to="/games" 
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-neon-purple/20 to-neon-orange/20' : 'bg-gradient-to-br from-purple-500 to-orange-500'} 
                ${isDarkMode ? 'border border-neon-purple/30' : 'border-0'} 
                ${isDarkMode ? 'text-neon-purple' : 'text-white'} 
                hover:shadow-[0_0_20px_rgba(128,0,255,0.3)] transition-all duration-300`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎮</span>
                <h2 className={`text-lg font-semibold`}>Learning Games</h2>
              </div>
              <p className={`mt-2 ${isDarkMode ? 'text-neon-orange' : 'text-white/80'}`}>
                Practice Japanese through fun interactive games
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 