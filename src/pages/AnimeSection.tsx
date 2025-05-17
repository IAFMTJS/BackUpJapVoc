import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useApp } from '../context/AppContext';
import { kuroshiroInstance } from '../utils/kuroshiro';
import { AnimePhrase } from '../types/anime';
import AnimeGridView from '../components/AnimeGridView';
import AnimePhraseDetails from '../components/AnimePhraseDetails';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { playAudio, initializeAudioCache } from '../utils/audio';

interface AnimePhrase {
  japanese: string;
  romaji: string;
  english: string;
  context: string;
  example: string;
  difficulty: 'beginner' | 'intermediate';
  category: 'greeting' | 'emotion' | 'action' | 'question' | 'response';
  animeImage?: string;
  characterName?: string;
  animeTitle?: string;
}

const beginnerPhrases: AnimePhrase[] = [
  {
    japanese: "おはようございます",
    romaji: "ohayou gozaimasu",
    english: "Good morning",
    context: "A polite way to greet someone in the morning",
    example: "おはようございます、先生。",
    difficulty: "beginner",
    category: "greeting",
    animeImage: "/anime/naruto-happy.jpg",
    characterName: "Naruto",
    animeTitle: "Naruto"
  },
  {
    japanese: "ありがとうございます",
    romaji: "arigatou gozaimasu",
    english: "Thank you very much",
    context: "A polite way to express gratitude",
    example: "ありがとうございます、助かりました。",
    difficulty: "beginner",
    category: "greeting",
    animeImage: "/anime/gon-happy.jpg",
    characterName: "Gon",
    animeTitle: "Hunter x Hunter"
  },
  {
    japanese: "すみません",
    romaji: "sumimasen",
    english: "I'm sorry / Excuse me",
    context: "Used to apologize or get someone's attention",
    example: "すみません、道を教えていただけますか？",
    difficulty: "beginner",
    category: "greeting",
    animeImage: "/anime/kaneki-sad.jpg",
    characterName: "Kaneki",
    animeTitle: "Tokyo Ghoul"
  },
  {
    japanese: "頑張ってください",
    romaji: "ganbatte kudasai",
    english: "Please do your best",
    context: "Used to encourage someone",
    example: "試験、頑張ってください！",
    difficulty: "beginner",
    category: "emotion",
    animeImage: "/anime/rin-determined.jpg",
    characterName: "Rin",
    animeTitle: "Fate/Stay Night"
  },
  {
    japanese: "大丈夫ですか",
    romaji: "daijoubu desu ka",
    english: "Are you okay?",
    context: "Used to check if someone is alright",
    example: "大丈夫ですか？顔色が悪いですよ。",
    difficulty: "beginner",
    category: "question",
    animeImage: "/anime/lucy-supportive.png",
    characterName: "Lucy",
    animeTitle: "Fairy Tail"
  }
];

// Helper: check if string is kana-only (hiragana/katakana)
const isKanaOnly = (str: string) => /^[\u3040-\u309F\u30A0-\u30FF\u3000-\u303F\uFF66-\uFF9F\s]+$/.test(str);

const AnimeSection: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings } = useApp();
  const { updateProgress } = useProgress();
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<AnimePhrase | null>(null);
  const [showRomaji, setShowRomaji] = useState(settings.showRomaji);
  const [romajiMap, setRomajiMap] = useState<{ [key: string]: string }>({});
  const [selectedCategory, setSelectedCategory] = useState<AnimePhrase['category'] | 'all'>('all');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Initialize audio cache
  useEffect(() => {
    const initAudio = async () => {
      try {
        const success = await initializeAudioCache();
        setAudioInitialized(success);
        if (!success) {
          console.warn('Failed to initialize audio cache, will use Web Speech API fallback');
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };
    initAudio();
  }, []);

  // Show all phrases, not just kana-only
  const allPhrases = beginnerPhrases;

  const filteredPhrases = useMemo(() =>
    (selectedCategory === 'all' ? allPhrases : allPhrases.filter(phrase => phrase.category === selectedCategory)),
    [allPhrases, selectedCategory]
  );

  // Set initial phrase
  useEffect(() => {
    if (filteredPhrases.length > 0) {
      setSelectedPhrase(filteredPhrases[currentPhraseIndex]);
    }
  }, [filteredPhrases, currentPhraseIndex]);

  // Romaji conversion
  useEffect(() => {
    let isMounted = true;
    const updateRomaji = async () => {
      if (showRomaji && selectedPhrase) {
        const text = selectedPhrase.japanese.trim();
        if (!romajiMap[text]) {
          const newRomajiMap = await kuroshiroInstance.convertBatch([text]);
          if (isMounted) {
            setRomajiMap(prev => ({ ...prev, ...newRomajiMap }));
          }
        }
      }
    };
    updateRomaji();
    return () => { isMounted = false; };
  }, [showRomaji, selectedPhrase]);

  // Progress tracking
  const handleNextPhrase = () => {
    setCurrentPhraseIndex(prev => (prev + 1) % filteredPhrases.length);
  };

  const handlePreviousPhrase = () => {
    setCurrentPhraseIndex(prev => (prev - 1 + filteredPhrases.length) % filteredPhrases.length);
  };

  const handlePractice = async () => {
    if (currentUser && selectedPhrase) {
      await updateProgress('anime', selectedPhrase.japanese, true);
    }
  };

  const handlePlayAudio = async (text: string) => {
    if (!audioInitialized) {
      console.warn('Audio not initialized, using Web Speech API fallback');
    }
    await playAudio(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Toggle Button */}
      <button
        onClick={() => setShowDashboard(!showDashboard)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
      >
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Main Content - Single Quote Display */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {selectedPhrase && (
            <motion.div
              key={selectedPhrase.japanese}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
                {/* Image */}
                <div className="relative h-96">
                  <img
                    src={selectedPhrase.animeImage || '/anime/default.JPG'}
                    alt={selectedPhrase.animeTitle || 'Anime'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  
                  {/* Character Info */}
                  {selectedPhrase.characterName && (
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{selectedPhrase.characterName}</h3>
                      {selectedPhrase.animeTitle && (
                        <p className="text-sm opacity-80">{selectedPhrase.animeTitle}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Quote Content */}
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {selectedPhrase.japanese}
                    </h2>
                    <button
                      onClick={() => handlePlayAudio(selectedPhrase.japanese)}
                      className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 
                        dark:hover:text-blue-400 transform hover:scale-110 transition-all
                        bg-gray-100 dark:bg-gray-700 rounded-full"
                      title="Play Audio"
                    >
                      🔊
                    </button>
                  </div>
                  {showRomaji && (
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                      {romajiMap[selectedPhrase.japanese.trim()] || selectedPhrase.romaji}
                    </p>
                  )}
                  <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
                    {selectedPhrase.english}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {selectedPhrase.context}
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700">
                  <button
                    onClick={handlePreviousPhrase}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handlePractice}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Practice
                  </button>
                  <button
                    onClick={handleNextPhrase}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Panel */}
        <AnimatePresence>
          {showDashboard && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl p-6 overflow-y-auto"
            >
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard</h2>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    All
                  </button>
                  {['greeting', 'emotion', 'action', 'question', 'response'].map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category as AnimePhrase['category'])}
                      className={`w-full px-3 py-2 rounded-lg text-left transition-colors capitalize ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Settings</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRomaji}
                    onChange={() => setShowRomaji(r => !r)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Show Romaji</span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimeSection;
export { beginnerPhrases }; 