import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { playAudio } from '../utils/audio';
import { getDatabase, getAllFromStore, forceDatabaseReset } from '../utils/databaseConfig';
import { JapVocDB } from '../types/database';
import safeLocalStorage from '../utils/safeLocalStorage';
import { importDictionaryData } from '../utils/importDictionaryData';
import { DictionaryItem } from '../types/dictionary';
import HybridMascots from '../components/ui/HybridMascots';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`dictionary-tabpanel-${index}`}
    aria-labelledby={`dictionary-tab-${index}`}
    className="py-6"
  >
    {value === index && children}
  </div>
);

const WordCard: React.FC<{ 
  word: DictionaryItem;
  onMarkAsRead: (wordId: string) => void;
  isRead: boolean;
}> = ({ word, onMarkAsRead, isRead }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handlePlayAudio = async () => {
    try {
      await playAudio(word.japanese);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(word.id);
  };

  return (
    <div className={`p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-2 ${
      theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'
    } ${isRead ? 'ring-2 ring-japanese-green/50' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
              {word.japanese}
            </h3>
            {word.kanji && word.kanji !== word.japanese && (
              <span className={`text-lg ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                ({word.kanji})
              </span>
            )}
          </div>
          <div className={`text-lg mb-2 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            {word.romaji}
          </div>
          <div className={`text-base mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
            {word.english}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePlayAudio}
            className={`p-2 rounded-full transition-colors duration-200 ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-japanese-red hover:text-white' : 'bg-gray-100 hover:bg-japanese-red hover:text-white'
            }`}
            title="Play pronunciation"
          >
            🔊
          </button>
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full transition-colors duration-200 ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-japanese-red hover:text-white' : 'bg-gray-100 hover:bg-japanese-red hover:text-white'
            } ${isFavorite ? 'text-japanese-red' : ''}`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
          <button
            onClick={handleMarkAsRead}
            className={`p-2 rounded-full transition-colors duration-200 ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-japanese-green hover:text-white' : 'bg-gray-100 hover:bg-japanese-green hover:text-white'
            } ${isRead ? 'text-japanese-green' : ''}`}
            title={isRead ? "Mark as unread" : "Mark as read"}
          >
            {isRead ? '✅' : '⭕'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          theme === 'dark' ? 'bg-japanese-blue/20 text-japanese-blue' : 'bg-japanese-blue/10 text-japanese-blue'
        }`}>
          📂 {word.category || 'other'}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          theme === 'dark' ? 'bg-japanese-purple/20 text-japanese-purple' : 'bg-japanese-purple/10 text-japanese-purple'
        }`}>
          ⭐ {getDifficultyFromLevel(word.level)}
        </span>
      </div>

      {word.examples && word.examples.length > 0 && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-3 py-1 rounded-nav text-sm font-medium transition-colors duration-200 mb-2 ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {isExpanded ? 'Hide Examples' : 'Show Examples'}
            <span className="ml-2">{isExpanded ? '▼' : '▶'}</span>
          </button>
          {isExpanded && (
            <div className={`p-4 rounded-nav ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              {word.examples.map((example, index) => (
                <div key={index} className={`mb-2 ${index < word.examples.length - 1 ? 'border-b border-gray-300 dark:border-gray-600 pb-2' : ''}`}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    {example}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const isDictionaryInitialized = async (): Promise<boolean> => {
  try {
    const db = await getDatabase();
    const words = await getAllFromStore(db, 'dictionary');
    return words.length > 0;
  } catch (error) {
    console.error('Error checking dictionary initialization:', error);
    return false;
  }
};

const getDifficultyFromLevel = (level: number): string => {
  if (level <= 1) return 'Beginner';
  if (level <= 3) return 'Intermediate';
  if (level <= 5) return 'Advanced';
  return 'Expert';
};

const Dictionary: React.FC = () => {
  const { theme, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const [words, setWords] = useState<DictionaryItem[]>([]);
  const [filteredWords, setFilteredWords] = useState<DictionaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState(0);
  const [readWords, setReadWords] = useState<Set<string>>(new Set());
  const [showReadOnly, setShowReadOnly] = useState(false);

  // Load words from database
  useEffect(() => {
    const loadWords = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if dictionary is initialized
        const isInitialized = await isDictionaryInitialized();
        
        if (!isInitialized) {
          console.log('Dictionary not initialized, importing data...');
          await importDictionaryData();
        }

        // Load words from database
        const db = await getDatabase();
        const loadedWords = await getAllFromStore(db, 'dictionary') as DictionaryItem[];
        
        // Sort words by level and then by japanese
        const sortedWords = loadedWords.sort((a, b) => {
          if (a.level !== b.level) {
            return a.level - b.level;
          }
          return a.japanese.localeCompare(b.japanese);
        });

        setWords(sortedWords);
        setFilteredWords(sortedWords);

        // Load read words from localStorage
        const savedReadWords = safeLocalStorage.getItem('readWords');
        if (savedReadWords) {
          try {
            const readWordsArray = JSON.parse(savedReadWords);
            setReadWords(new Set(readWordsArray));
          } catch (error) {
            console.error('Error parsing read words:', error);
          }
        }

      } catch (error) {
        console.error('Error loading dictionary:', error);
        setError('Failed to load dictionary. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, []);

  // Filter words based on search and filters
  useEffect(() => {
    let filtered = words;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(word =>
        word.japanese.toLowerCase().includes(searchLower) ||
        word.romaji.toLowerCase().includes(searchLower) ||
        word.english.toLowerCase().includes(searchLower) ||
        (word.kanji && word.kanji.toLowerCase().includes(searchLower))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(word => word.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(word => {
        const difficulty = getDifficultyFromLevel(word.level);
        return difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      });
    }

    // Filter by read status
    if (showReadOnly) {
      filtered = filtered.filter(word => readWords.has(word.id));
    }

    setFilteredWords(filtered);
  }, [words, searchTerm, selectedCategory, selectedDifficulty, showReadOnly, readWords]);

  const handleMarkAsRead = (wordId: string) => {
    const newReadWords = new Set(readWords);
    if (newReadWords.has(wordId)) {
      newReadWords.delete(wordId);
    } else {
      newReadWords.add(wordId);
    }
    setReadWords(newReadWords);
    
    // Save to localStorage
    safeLocalStorage.setItem('readWords', JSON.stringify(Array.from(newReadWords)));
  };

  const handleTabChange = (newValue: number) => {
    setSelectedTab(newValue);
  };

  const categories = useMemo(() => {
    const cats = new Set(words.map(word => word.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [words]);

  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-japanese-red"></div>
        <h2 className={`text-xl mt-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          Loading dictionary...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-japanese-red/10 border border-japanese-red/20' : 'bg-japanese-red/5 border border-japanese-red/20'}`}>
            <div className={`font-semibold text-japanese-red mb-2`}>
              ❌ Error
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Mascot */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex-1">
              <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Japanese Dictionary
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Explore and learn Japanese vocabulary
              </p>
            </div>
            <div className="mt-4 lg:mt-0 lg:ml-8">
              <HybridMascots
                type="emotions"
                size="large"
                progress={(readWords.size / words.length) * 100}
                performance={(readWords.size / words.length) >= 0.8 ? 'excellent' : (readWords.size / words.length) >= 0.6 ? 'good' : (readWords.size / words.length) >= 0.4 ? 'average' : (readWords.size / words.length) >= 0.2 ? 'poor' : 'terrible'}
                context="study"
                mood={readWords.size > 0 ? 'positive' : 'neutral'}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`p-6 rounded-2xl mb-8 ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold text-japanese-red ${theme === 'dark' ? 'text-japanese-red' : 'text-japanese-red'}`}>
                {words.length}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Total Words
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold text-japanese-green ${theme === 'dark' ? 'text-japanese-green' : 'text-japanese-green'}`}>
                {readWords.size}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Read Words
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold text-japanese-blue ${theme === 'dark' ? 'text-japanese-blue' : 'text-japanese-blue'}`}>
                {categories.length}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Categories
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold text-japanese-purple ${theme === 'dark' ? 'text-japanese-purple' : 'text-japanese-purple'}`}>
                {filteredWords.length}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Filtered
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-6 rounded-2xl mb-8 ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Search Words
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Japanese, Romaji, or English..."
                className={`w-full px-4 py-2 rounded-nav border transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-dark border-border-dark-light text-text-dark-primary placeholder-text-dark-secondary focus:border-japanese-red' 
                    : 'bg-light border-border-light text-text-primary placeholder-text-secondary focus:border-japanese-red'
                }`}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-4 py-2 rounded-nav border transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-dark border-border-dark-light text-text-dark-primary focus:border-japanese-red' 
                    : 'bg-light border-border-light text-text-primary focus:border-japanese-red'
                }`}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={`w-full px-4 py-2 rounded-nav border transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-dark border-border-dark-light text-text-dark-primary focus:border-japanese-red' 
                    : 'bg-light border-border-light text-text-primary focus:border-japanese-red'
                }`}
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>

            {/* Read Filter */}
            <div className="flex items-end">
              <button
                onClick={() => setShowReadOnly(!showReadOnly)}
                className={`px-4 py-2 rounded-nav font-semibold transition-colors duration-300 ${
                  showReadOnly
                    ? 'bg-japanese-green text-white'
                    : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {showReadOnly ? 'Show All' : 'Show Read Only'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-nav p-1">
            {[
              { label: 'All Words', icon: '📚' },
              { label: 'Beginner', icon: '🌱' },
              { label: 'Intermediate', icon: '🌿' },
              { label: 'Advanced', icon: '🌳' }
            ].map((tab, index) => (
              <button
                key={tab.label}
                onClick={() => handleTabChange(index)}
                className={`flex-1 px-4 py-2 rounded-nav text-sm font-medium transition-colors duration-200 ${
                  selectedTab === index
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
        <TabPanel value={selectedTab} index={0}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onMarkAsRead={handleMarkAsRead}
                isRead={readWords.has(word.id)}
              />
            ))}
          </div>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.filter(word => getDifficultyFromLevel(word.level) === 'Beginner').map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onMarkAsRead={handleMarkAsRead}
                isRead={readWords.has(word.id)}
              />
            ))}
          </div>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.filter(word => getDifficultyFromLevel(word.level) === 'Intermediate').map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onMarkAsRead={handleMarkAsRead}
                isRead={readWords.has(word.id)}
              />
            ))}
          </div>
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.filter(word => getDifficultyFromLevel(word.level) === 'Advanced').map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onMarkAsRead={handleMarkAsRead}
                isRead={readWords.has(word.id)}
              />
            ))}
          </div>
        </TabPanel>

        {/* Empty State */}
        {filteredWords.length === 0 && (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold mb-2">No words found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dictionary; 