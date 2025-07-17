import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { playAudio } from '../utils/audio';
import { EmotionalCategory, MoodWord, EMOTIONAL_CATEGORIES } from '../types/mood';
import MoodSelector from '../components/MoodSelector';
import MoodStats from '../components/MoodStats';
import {
  getAllMoodWords as loadAllMoodWords,
  markWordAsMastered as updateWordMastery,
  getMoodWordsByCategory,
  getMasteredWords,
  updateMoodWord,
  deleteMoodWord
} from '../utils/moodWordOperations';
import { generateMoodWordAudio } from '../utils/audio';
import { openDB } from '../utils/indexedDB';
import { initializeMoodWords, getMoodWordsStatus } from '../utils/initMoodWords';
import { forceDatabaseReset } from '../utils/forceDatabaseReset';
import HybridMascots from '../components/ui/HybridMascots';
import { MOOD_WORDS } from '../data/moodWords';

const MoodPage: React.FC = () => {
  const { theme, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const [words, setWords] = useState<MoodWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'mastered' | 'learning'>('all');
  const [selectedMoods, setSelectedMoods] = useState<EmotionalCategory[]>([]);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentPlayingWord, setCurrentPlayingWord] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and load mood words
  useEffect(() => {
    const initializeAndLoadWords = async () => {
      try {
        setLoading(true);
        console.log('Loading mood words...');
        
        // Load the words - this will automatically initialize if needed
        const moodWords = await loadAllMoodWords();
        console.log(`Loaded ${moodWords.length} mood words`);
        setWords(moodWords);
      } catch (error) {
        console.error('Error loading mood words:', error);
        // Even if there's an error, we can still show the built-in words
        setWords(MOOD_WORDS);
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoadWords();
  }, []);

  const handlePlayAudio = async (word: MoodWord) => {
    // If already playing this word, do nothing
    if (isPlayingAudio && currentPlayingWord === word.japanese) {
      return;
    }

    // If playing a different word, stop it first
    if (isPlayingAudio) {
      try {
        await playAudio(currentPlayingWord);
      } catch (error) {
        console.error('Error stopping previous audio:', error);
      }
    }

    // Clear any existing timeout
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }

    try {
      setIsPlayingAudio(true);
      setCurrentPlayingWord(word.japanese);
      setAudioError(null);
      
      // Always use the Japanese text to play audio
      await playAudio(word.japanese);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioError(error instanceof Error ? error.message : 'Failed to play audio');
    } finally {
      // Add a small delay before allowing next playback
      audioTimeoutRef.current = setTimeout(() => {
        setIsPlayingAudio(false);
        setCurrentPlayingWord(null);
      }, 100);
    }
  };

  const handleMarkAsMastered = async (wordId: string) => {
    try {
      const word = words.find(w => w.id === wordId);
      if (word) {
        await updateWordMastery(wordId, !word.mastered);
        setWords(words.map(w => 
          w.id === wordId 
            ? { ...w, mastered: !w.mastered, lastReviewed: new Date() }
            : w
        ));
      }
    } catch (error) {
      console.error('Error updating word mastery:', error);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      setResetError(null);
      console.log('Resetting mood words...');
      
      // Force reset the database
      await forceDatabaseReset();
      console.log('Database reset complete');
      
      // Reinitialize mood words
      await initializeMoodWords();
      console.log('Mood words reinitialized');
      
      // Reload words
      const moodWords = await loadAllMoodWords();
      console.log(`Loaded ${moodWords.length} mood words`);
      setWords(moodWords);
    } catch (error) {
      console.error('Error resetting mood words:', error);
      setResetError(error instanceof Error ? error.message : 'Failed to reset mood words');
    } finally {
      setLoading(false);
    }
  };

  const filteredWords = words.filter(word => {
    // Safely handle potentially undefined or non-string values
    const searchTermLower = searchTerm.toLowerCase();
    const japaneseLower = (word.japanese || '').toLowerCase();
    const romajiLower = (word.romaji || '').toLowerCase();
    const englishLower = (word.english || '').toLowerCase();

    const matchesSearch = 
      japaneseLower.includes(searchTermLower) ||
      romajiLower.includes(searchTermLower) ||
      englishLower.includes(searchTermLower);
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'mastered' && word.mastered) ||
      (filter === 'learning' && !word.mastered);

    const matchesMoods =
      selectedMoods.length === 0 ||
      (word.emotionalContext?.category && selectedMoods.includes(word.emotionalContext.category));

    return matchesSearch && matchesFilter && matchesMoods;
  });

  // Helper function to safely get category color
  const getCategoryColor = (word: MoodWord) => {
    const category = word.emotionalContext?.category;
    return category && EMOTIONAL_CATEGORIES[category]?.color || '#ccc';
  };

  // Helper function to safely get category emoji
  const getCategoryEmoji = (word: MoodWord) => {
    const category = word.emotionalContext?.category;
    return category && EMOTIONAL_CATEGORIES[category]?.emoji || '❓';
  };

  // Helper function to safely get category name
  const getCategoryName = (word: MoodWord) => {
    const category = word.emotionalContext?.category;
    return category && EMOTIONAL_CATEGORIES[category]?.name || 'Unknown';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-japanese-red"></div>
        <h2 className={`text-xl mt-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          Loading mood words...
        </h2>
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
                Mood & Emotions
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Learn to express feelings and emotions in Japanese
              </p>
            </div>
            <div className="mt-4 lg:mt-0 lg:ml-8">
              <HybridMascots
                type="emotions"
                size="large"
                variant={selectedMoods.length > 0 ? selectedMoods[0] === 'joy' ? "extremelyHappy" : selectedMoods[0] === 'sadness' ? "sad" : selectedMoods[0] === 'anger' ? "angry" : selectedMoods[0] === 'fear' ? "worried" : selectedMoods[0] === 'surprise' ? "surprised" : "neutral" : "supportive"}
                context="mood"
                mood={selectedMoods.length > 0 ? 'positive' : 'neutral'}
              />
            </div>
          </div>
        </div>

        {/* Error Alerts */}
        {audioError && (
          <div className={`p-4 rounded-2xl mb-6 ${theme === 'dark' ? 'bg-japanese-red/10 border border-japanese-red/20' : 'bg-japanese-red/5 border border-japanese-red/20'}`}>
            <div className={`font-semibold text-japanese-red mb-2`}>
              🔊 Audio Error
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {audioError}
            </p>
          </div>
        )}

        {resetError && (
          <div className={`p-4 rounded-2xl mb-6 ${theme === 'dark' ? 'bg-japanese-red/10 border border-japanese-red/20' : 'bg-japanese-red/5 border border-japanese-red/20'}`}>
            <div className={`font-semibold text-japanese-red mb-2`}>
              🔄 Reset Error
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {resetError}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className={`p-6 rounded-2xl mb-8 ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Search Words
              </label>
              <div className="relative">
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
                <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
              </div>
            </div>

            {/* Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Filter
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'mastered' | 'learning')}
                className={`w-full px-4 py-2 rounded-nav border transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-dark border-border-dark-light text-text-dark-primary focus:border-japanese-red' 
                    : 'bg-light border-border-light text-text-primary focus:border-japanese-red'
                }`}
              >
                <option value="all">All Words</option>
                <option value="mastered">Mastered</option>
                <option value="learning">Learning</option>
              </select>
            </div>

            {/* Mood Selector */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Mood Categories
              </label>
              <MoodSelector
                selectedMoods={selectedMoods}
                onMoodSelect={setSelectedMoods}
              />
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={handleReset}
                className={`px-4 py-2 bg-japanese-orange text-white rounded-nav font-semibold hover:bg-japanese-orange-dark transition-colors duration-300`}
              >
                🔄 Reset Data
              </button>
            </div>
          </div>

          {/* Stats */}
          <MoodStats words={words} />
        </div>

        {/* Words Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWords.map((word) => (
            <div
              key={word.id}
              className={`p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-2 ${
                theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'
              } ${word.mastered ? 'ring-2 ring-japanese-green/50' : ''}`}
            >
              {/* Word Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                      {word.japanese}
                    </span>
                    {word.mastered && (
                      <span className="text-japanese-green text-lg">✅</span>
                    )}
                  </div>
                  <div className={`text-lg ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    {word.romaji}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    {word.english}
                  </div>
                </div>
                <button
                  onClick={() => handlePlayAudio(word)}
                  disabled={isPlayingAudio}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isPlayingAudio && currentPlayingWord === word.japanese
                      ? 'bg-japanese-red text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-japanese-red hover:text-white'
                  }`}
                >
                  🔊
                </button>
              </div>

              {/* Category */}
              {word.emotionalContext?.category && (
                <div className="mb-4">
                  <span 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${getCategoryColor(word)}20`,
                      color: getCategoryColor(word)
                    }}
                  >
                    <span className="mr-1">{getCategoryEmoji(word)}</span>
                    {getCategoryName(word)}
                  </span>
                </div>
              )}

              {/* Context */}
              {word.emotionalContext?.description && (
                <div className="mb-4">
                  <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    {word.emotionalContext.description}
                  </div>
                </div>
              )}

              {/* Examples */}
              {word.examples && word.examples.length > 0 && (
                <div className="mb-4">
                  <div className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    Examples:
                  </div>
                  <div className="space-y-1">
                    {word.examples.slice(0, 2).map((example, index) => (
                      <div key={index} className={`text-xs ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                        • {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleMarkAsMastered(word.id)}
                  className={`px-3 py-1 rounded-nav text-sm font-medium transition-colors duration-200 ${
                    word.mastered
                      ? 'bg-japanese-green text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-japanese-green hover:text-white'
                  }`}
                >
                  {word.mastered ? 'Mastered' : 'Mark Mastered'}
                </button>
                <div className={`text-xs ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                  Level {word.level || 1}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredWords.length === 0 && (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold mb-2">No words found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodPage; 