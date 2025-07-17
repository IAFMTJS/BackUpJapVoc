import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import { SimpleDictionaryItem } from '../types/dictionary';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`favorites-tabpanel-${index}`}
      aria-labelledby={`favorites-tab-${index}`}
      {...other}
    >
      {value === index && <div className="py-6">{children}</div>}
    </div>
  );
};

const FavoritesPage: React.FC = () => {
  const { theme, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { progress, toggleFavorite } = useProgress();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterLevel, setFilterLevel] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  const favoritedWords = useMemo(() => {
    return Object.entries(progress.words)
      .filter(([_, word]) => word.favorite)
      .map(([id, word]) => ({
        id,
        ...word,
      })) as SimpleDictionaryItem[];
  }, [progress.words]);

  const filteredWords = useMemo(() => {
    return favoritedWords.filter((word) => {
      const matchesSearch =
        word.japanese.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.romaji.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = filterLevel === 'all' || word.level === filterLevel;

      return matchesSearch && matchesLevel;
    });
  }, [favoritedWords, searchTerm, filterLevel]);

  const sortedWords = useMemo(() => {
    return [...filteredWords].sort((a, b) => {
      switch (sortBy) {
        case 'japanese':
          return a.japanese.localeCompare(b.japanese);
        case 'english':
          return a.english.localeCompare(b.english);
        case 'level':
          return (a.level || '').localeCompare(b.level || '');
        case 'recent':
        default:
          return (b.lastStudied || 0) - (a.lastStudied || 0);
      }
    });
  }, [filteredWords, sortBy]);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterLevel(event.target.value);
  };

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  const playAudio = (word: SimpleDictionaryItem) => {
    // TODO: Implement audio playback
    console.log('Playing audio for:', word.japanese);
  };

  const WordCard: React.FC<{ word: SimpleDictionaryItem }> = ({ word }) => (
    <div className={`p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-2 ${
      theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          {word.japanese}
        </h3>
        <button
          onClick={() => toggleFavorite(word.id)}
          className={`p-2 rounded-full transition-colors duration-200 ${
            theme === 'dark' ? 'bg-gray-700 hover:bg-japanese-red hover:text-white' : 'bg-gray-100 hover:bg-japanese-red hover:text-white'
          } text-japanese-red`}
        >
          ⭐
        </button>
      </div>
      <div className={`text-lg mb-2 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
        {word.romaji}
      </div>
      <div className={`text-base mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
        {word.english}
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {word.level && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            theme === 'dark' ? 'bg-japanese-red/20 text-japanese-red' : 'bg-japanese-red/10 text-japanese-red'
          }`}>
            Level: {word.level}
          </span>
        )}
        {word.category && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            theme === 'dark' ? 'bg-japanese-blue/20 text-japanese-blue' : 'bg-japanese-blue/10 text-japanese-blue'
          }`}>
            {word.category}
          </span>
        )}
        {word.jlptLevel && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            theme === 'dark' ? 'bg-japanese-green/20 text-japanese-green' : 'bg-japanese-green/10 text-japanese-green'
          }`}>
            JLPT {word.jlptLevel}
          </span>
        )}
      </div>
      {word.examples && word.examples.length > 0 && (
        <div className={`p-4 rounded-nav mb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            Example:
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
            {word.examples[0].japanese} - {word.examples[0].english}
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={() => playAudio(word)}
          className={`p-2 rounded-full transition-colors duration-200 ${
            theme === 'dark' ? 'bg-gray-700 hover:bg-japanese-red hover:text-white' : 'bg-gray-100 hover:bg-japanese-red hover:text-white'
          }`}
        >
          🔊
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
            Favorites
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            Your favorite Japanese words and phrases
          </p>
        </div>

        {/* Stats */}
        <div className={`p-6 rounded-2xl mb-8 ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold text-japanese-red ${theme === 'dark' ? 'text-japanese-red' : 'text-japanese-red'}`}>
                {favoritedWords.length}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Total Favorites
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold text-japanese-green ${theme === 'dark' ? 'text-japanese-green' : 'text-japanese-green'}`}>
                {filteredWords.length}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Filtered Results
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold text-japanese-blue ${theme === 'dark' ? 'text-japanese-blue' : 'text-japanese-blue'}`}>
                {new Set(favoritedWords.map(w => w.category)).size}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Categories
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={`p-6 rounded-2xl mb-8 ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Search Favorites
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Japanese, English, or Romaji..."
                className={`w-full px-4 py-2 rounded-nav border transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-dark border-border-dark-light text-text-dark-primary placeholder-text-dark-secondary focus:border-japanese-red' 
                    : 'bg-light border-border-light text-text-primary placeholder-text-secondary focus:border-japanese-red'
                }`}
              />
            </div>

            {/* Sort */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className={`w-full px-4 py-2 rounded-nav border transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-dark border-border-dark-light text-text-dark-primary focus:border-japanese-red' 
                    : 'bg-light border-border-light text-text-primary focus:border-japanese-red'
                }`}
              >
                <option value="recent">Recently Studied</option>
                <option value="japanese">Japanese (A-Z)</option>
                <option value="english">English (A-Z)</option>
                <option value="level">Level</option>
              </select>
            </div>

            {/* Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Filter by Level
              </label>
              <select
                value={filterLevel}
                onChange={handleFilterChange}
                className={`w-full px-4 py-2 rounded-nav border transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-dark border-border-dark-light text-text-dark-primary focus:border-japanese-red' 
                    : 'bg-light border-border-light text-text-primary focus:border-japanese-red'
                }`}
              >
                <option value="all">All Levels</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-nav p-1">
            {[
              { label: 'All Favorites', icon: '⭐' },
              { label: 'Recently Added', icon: '🕒' },
              { label: 'By Level', icon: '📊' }
            ].map((tab, index) => (
              <button
                key={tab.label}
                onClick={() => handleTabChange(index)}
                className={`flex-1 px-4 py-2 rounded-nav text-sm font-medium transition-colors duration-200 ${
                  tabValue === index
                    ? 'bg-japanese-red text-white'
                    : `${theme === 'dark' ? 'text-text-dark-secondary hover:text-text-dark-primary' : 'text-text-secondary hover:text-text-primary'}`
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedWords.map((word) => (
              <WordCard key={word.id} word={word} />
            ))}
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedWords
              .filter(word => word.lastStudied && word.lastStudied > Date.now() - 7 * 24 * 60 * 60 * 1000)
              .map((word) => (
                <WordCard key={word.id} word={word} />
              ))}
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map(level => {
              const levelWords = sortedWords.filter(word => word.level === level.toString());
              if (levelWords.length === 0) return null;
              
              return (
                <div key={level} className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
                  <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    Level {level} ({levelWords.length} words)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {levelWords.map((word) => (
                      <WordCard key={word.id} word={word} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabPanel>

        {/* Empty State */}
        {sortedWords.length === 0 && (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">No favorites found</h3>
            <p>Start adding words to your favorites to see them here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage; 