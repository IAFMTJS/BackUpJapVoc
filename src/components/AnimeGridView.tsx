import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AnimePhrase } from '../types/anime';
import { playAudio } from '../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimeGridViewProps {
  phrases: AnimePhrase[];
  onPhraseSelect: (phrase: AnimePhrase) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const AnimeGridView: React.FC<AnimeGridViewProps> = ({
  phrases,
  onPhraseSelect,
  viewMode,
  onViewModeChange
}) => {
  const [hoveredPhrase, setHoveredPhrase] = useState<string | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorite-phrases', []);

  const toggleFavorite = (japanese: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(japanese)
        ? prev.filter(p => p !== japanese)
        : [...prev, japanese]
    );
  };

  const handlePlayAudio = (japanese: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playAudio(japanese);
  };

  return (
    <div className="w-full">
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-6">
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-nav">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-nav transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-dark-elevated dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-card dark:shadow-dark-card'
                : 'text-text-muted dark:text-text-dark-muted dark:text-text-secondary dark:text-text-dark-secondary hover:bg-white dark:bg-dark-elevated dark:hover:bg-gray-600'
            }`}
            title="Grid View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-nav transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-white dark:bg-dark-elevated dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-card dark:shadow-dark-card'
                : 'text-text-muted dark:text-text-dark-muted dark:text-text-secondary dark:text-text-dark-secondary hover:bg-white dark:bg-dark-elevated dark:hover:bg-gray-600'
            }`}
            title="List View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid/List View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }
        >
          {phrases.map((phrase) => (
            <motion.div
              key={phrase.japanese}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => onPhraseSelect(phrase)}
              onMouseEnter={() => setHoveredPhrase(phrase.japanese)}
              onMouseLeave={() => setHoveredPhrase(null)}
              className={`
                relative bg-white dark:bg-dark-elevated dark:bg-gray-800 rounded-card shadow-lg overflow-hidden
                transition-all duration-300 cursor-pointer group
                ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row items-center gap-4'}
                ${favorites.includes(phrase.japanese) ? 'ring-2 ring-pink-500' : ''}
                hover:shadow-xl dark:hover:shadow-gray-700/50
              `}
            >
              {/* Image Container */}
              <div className={`
                ${viewMode === 'grid' ? 'w-full h-48' : 'w-32 h-32 flex-shrink-0'}
                relative overflow-hidden
              `}>
                <img
                  src={phrase.animeImage || '/anime/default.JPG'}
                  alt={phrase.animeTitle || 'Anime'}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(phrase.japanese, e)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white dark:bg-dark-elevated/90 dark:bg-gray-800/90 
                    backdrop-blur-sm shadow-card dark:shadow-dark-card transform hover:scale-110 transition-all
                    hover:bg-white dark:bg-dark-elevated dark:hover:bg-gray-700"
                >
                  <svg
                    className={`w-5 h-5 transition-colors ${
                      favorites.includes(phrase.japanese)
                        ? 'text-pink-500 fill-current'
                        : 'text-gray-400 group-hover:text-pink-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className={`flex-1 p-4 ${viewMode === 'list' ? 'flex flex-col justify-center' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary dark:text-text-dark-primary dark:text-text-primary dark:text-text-dark-primary mb-1">
                      {phrase.japanese}
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary dark:text-text-secondary dark:text-text-dark-secondary">
                      {phrase.romaji}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handlePlayAudio(phrase.japanese, e)}
                    className="p-2 text-text-secondary dark:text-text-dark-secondary hover:text-blue-600 dark:text-text-secondary dark:text-text-dark-secondary 
                      dark:hover:text-blue-400 transform hover:scale-110 transition-all
                      bg-gray-200 dark:bg-gray-700 rounded-full"
                    title="Play Audio"
                  >
                    🔊
                  </button>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-800 dark:text-text-secondary dark:text-text-dark-secondary line-clamp-2">
                    {phrase.english}
                  </p>
                  {phrase.animeTitle && (
                    <p className="text-xs text-text-muted dark:text-text-dark-muted dark:text-gray-400 mt-1 font-medium">
                      {phrase.animeTitle}
                    </p>
                  )}
                </div>

                {/* Category Badge */}
                <div className="mt-3">
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold
                    bg-japanese-red text-text-primary dark:text-text-dark-primary dark:bg-blue-900 dark:text-blue-200
                    capitalize">
                    {phrase.category}
                  </span>
                </div>

                {/* Hover Preview */}
                <AnimatePresence>
                  {hoveredPhrase === phrase.japanese && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/70 
                        backdrop-blur-sm text-text-primary dark:text-text-dark-primary p-4 flex flex-col justify-center items-center
                        text-center"
                    >
                      <p className="text-sm mb-3">{phrase.context}</p>
                      <div className="flex gap-2">
                        <span className="text-xs bg-japanese-red/90 px-3 py-1 rounded-full">
                          {phrase.category}
                        </span>
                        {phrase.characterName && (
                          <span className="text-xs bg-purple-500/90 px-3 py-1 rounded-full">
                            {phrase.characterName}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimeGridView; 