import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
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
    japanese: "俺は負けない",
    romaji: "ore wa makenai",
    english: "I won't lose",
    context: "A determined declaration of not giving up",
    example: "俺は負けない、絶対に！",
    difficulty: "beginner",
    category: "emotion",
    animeImage: "/anime/naruto.JPG",
    characterName: "Naruto",
    animeTitle: "Naruto"
  },
  {
    japanese: "憎しみは憎しみを生む",
    romaji: "nikushimi wa nikushimi wo umu",
    english: "Hatred breeds hatred",
    context: "A profound statement about the cycle of hatred",
    example: "憎しみは憎しみを生むだけだ。",
    difficulty: "intermediate",
    category: "emotion",
    animeImage: "/anime/sasuke-angry.jpg",
    characterName: "Sasuke",
    animeTitle: "Naruto"
  },
  {
    japanese: "ありがとう",
    romaji: "arigatou",
    english: "Thank you",
    context: "A simple expression of gratitude",
    example: "ありがとう、友達。",
    difficulty: "beginner",
    category: "greeting",
    animeImage: "/anime/gon-happy.jpg",
    characterName: "Gon",
    animeTitle: "Hunter x Hunter"
  },
  {
    japanese: "強くなりたい",
    romaji: "tsuyoku naritai",
    english: "I want to become stronger",
    context: "Expressing a desire for self-improvement",
    example: "強くなりたい、もっと強く。",
    difficulty: "beginner",
    category: "emotion",
    animeImage: "/anime/gon-angry.JPG",
    characterName: "Gon",
    animeTitle: "Hunter x Hunter"
  },
  {
    japanese: "面白いね",
    romaji: "omoshiroi ne",
    english: "How interesting",
    context: "An expression of fascination or amusement",
    example: "面白いね、君の力。",
    difficulty: "beginner",
    category: "emotion",
    animeImage: "/anime/hisoka-hxh.JPG",
    characterName: "Hisoka",
    animeTitle: "Hunter x Hunter"
  },
  {
    japanese: "人間は食べ物だ",
    romaji: "ningen wa tabemono da",
    english: "Humans are food",
    context: "A dark realization about the nature of ghouls",
    example: "人間は食べ物だ、それが現実だ。",
    difficulty: "intermediate",
    category: "emotion",
    animeImage: "/anime/kaneki-angry.jpg",
    characterName: "Kaneki",
    animeTitle: "Tokyo Ghoul"
  },
  {
    japanese: "一人じゃない",
    romaji: "hitori janai",
    english: "You're not alone",
    context: "A comforting phrase to show support",
    example: "一人じゃない、私がいる。",
    difficulty: "beginner",
    category: "emotion",
    animeImage: "/anime/hide-tokyoghoul.JPG",
    characterName: "Hide",
    animeTitle: "Tokyo Ghoul"
  },
  {
    japanese: "火を食らえ",
    romaji: "hi wo kurae",
    english: "Eat my fire",
    context: "A battle cry before using fire magic",
    example: "火を食らえ、ドラゴン！",
    difficulty: "beginner",
    category: "action",
    animeImage: "/anime/natsu-angry.jpg",
    characterName: "Natsu",
    animeTitle: "Fairy Tail"
  },
  {
    japanese: "一緒に冒険しよう",
    romaji: "issho ni bouken shiyou",
    english: "Let's go on an adventure together",
    context: "An invitation to join on a journey",
    example: "一緒に冒険しよう、ルーシー！",
    difficulty: "beginner",
    category: "action",
    animeImage: "/anime/lucy-supportive.png",
    characterName: "Lucy",
    animeTitle: "Fairy Tail"
  },
  {
    japanese: "魔術は神秘だ",
    romaji: "majutsu wa shinpi da",
    english: "Magic is mysterious",
    context: "A statement about the nature of magic",
    example: "魔術は神秘だ、理解できないものだ。",
    difficulty: "intermediate",
    category: "emotion",
    animeImage: "/anime/rin-determined.jpg",
    characterName: "Rin",
    animeTitle: "Fate/Stay Night"
  },
  {
    japanese: "家族を守る",
    romaji: "kazoku wo mamoru",
    english: "I will protect my family",
    context: "A declaration of protection for loved ones",
    example: "家族を守る、それが私の使命だ。",
    difficulty: "beginner",
    category: "emotion",
    animeImage: "/anime/tanjiro-demonslayer.JPG",
    characterName: "Tanjiro",
    animeTitle: "Demon Slayer"
  },
  {
    japanese: "レベルアップ",
    romaji: "reberu appu",
    english: "Level up",
    context: "A gaming term for becoming stronger",
    example: "レベルアップ、次のステージへ。",
    difficulty: "beginner",
    category: "action",
    animeImage: "/anime/sololeveling.JPG",
    characterName: "Sung Jin-Woo",
    animeTitle: "Solo Leveling"
  },
  {
    japanese: "風を感じる",
    romaji: "kaze wo kanjiru",
    english: "Feel the wind",
    context: "A phrase about experiencing freedom",
    example: "風を感じる、自由な気持ち。",
    difficulty: "beginner",
    category: "emotion",
    animeImage: "/anime/windbreaker.JPG",
    characterName: "Haruka",
    animeTitle: "Wind Breaker"
  }
];

// Helper: check if string is kana-only (hiragana/katakana)
const isKanaOnly = (str: string) => /^[\u3040-\u309F\u30A0-\u30FF\u3000-\u303F\uFF66-\uFF9F\s]+$/.test(str);

const AnimeSection: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings } = useApp();
  const { updateProgress } = useProgress();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
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
    <div className={themeClasses.container}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
              ← Back to Home
            </Link>
            <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
              Anime Section
            </h1>
          </div>
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className={`${themeClasses.button.secondary} p-2 rounded-full`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {selectedPhrase && (
            <motion.div
              key={selectedPhrase.japanese}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className={themeClasses.card}>
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
                    <div className="absolute bottom-4 left-4 text-text-primary dark:text-text-dark-primary">
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
                    <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>
                      {selectedPhrase.japanese}
                    </h2>
                    <button
                      onClick={() => handlePlayAudio(selectedPhrase.japanese)}
                      className={`${themeClasses.button.secondary} p-2 rounded-full transform hover:scale-110 transition-all`}
                      title="Play Audio"
                    >
                      🔊
                    </button>
                  </div>
                  {showRomaji && (
                    <p className={`text-xl ${themeClasses.text.secondary} mb-4`}>
                      {romajiMap[selectedPhrase.japanese.trim()] || selectedPhrase.romaji}
                    </p>
                  )}
                  <p className={`text-lg ${themeClasses.text.primary} mb-6`}>
                    {selectedPhrase.english}
                  </p>
                  <p className={`text-sm ${themeClasses.text.muted} italic`}>
                    {selectedPhrase.context}
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between p-6 border-t border-dark-border">
                  <button
                    onClick={handlePreviousPhrase}
                    className={`${themeClasses.button.secondary} p-2 rounded-full`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handlePractice}
                    className={themeClasses.button.primary}
                  >
                    Practice
                  </button>
                  <button
                    onClick={handleNextPhrase}
                    className={`${themeClasses.button.secondary} p-2 rounded-full`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className={`fixed top-0 right-0 h-full w-80 ${themeClasses.card} shadow-xl p-6 overflow-y-auto`}
            >
              <h2 className={`text-xl font-bold mb-6 ${themeClasses.text.primary}`}>Dashboard</h2>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-3 ${themeClasses.text.primary}`}>Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full px-3 py-2 rounded-nav text-left transition-colors ${
                      selectedCategory === 'all'
                        ? themeClasses.button.primary
                        : themeClasses.button.secondary
                    }`}
                  >
                    All
                  </button>
                  {['greeting', 'emotion', 'action', 'question', 'response'].map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category as AnimePhrase['category'])}
                      className={`w-full px-3 py-2 rounded-nav text-left transition-colors capitalize ${
                        selectedCategory === category
                          ? themeClasses.button.primary
                          : themeClasses.button.secondary
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-3 ${themeClasses.text.primary}`}>Settings</h3>
                <label className={`flex items-center gap-2 cursor-pointer ${themeClasses.text.secondary}`}>
                  <input
                    type="checkbox"
                    checked={showRomaji}
                    onChange={() => setShowRomaji(r => !r)}
                    className="form-checkbox h-4 w-4 text-accent-blue"
                  />
                  <span>Show Romaji</span>
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