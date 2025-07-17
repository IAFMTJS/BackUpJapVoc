import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDictionary } from '../context/DictionaryContext';
import { DictionaryItem } from '../types/dictionary';
import SimpleQuiz from './SimpleQuiz';
import { motion } from 'framer-motion';
import { openDB } from 'idb';
import { importDictionaryData } from '../utils/importDictionaryData';
import { Link } from 'react-router-dom';

// Add database check function
const isDictionaryInitialized = async (): Promise<boolean> => {
  try {
    const db = await openDB('DictionaryDB', 3);
    const tx = db.transaction('words', 'readonly');
    const store = tx.objectStore('words');
    const count = await store.count();
    return count > 0;
  } catch (error) {
    console.error('Error checking dictionary initialization:', error);
    return false;
  }
};

interface QuizSettings {
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
}

const SimpleQuizWrapper: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const { words, isLoading: isDictionaryLoading } = useDictionary();
  const [settings, setSettings] = useState<QuizSettings>({
    category: 'all',
    difficulty: 'beginner',
    questionCount: 10
  });
  const [selectedWords, setSelectedWords] = useState<DictionaryItem[]>([]);
  const [quizState, setQuizState] = useState<'settings' | 'quiz' | 'results'>('settings');
  const [results, setResults] = useState<{ correct: number; total: number } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const themeClasses = getThemeClasses();

  // Available categories
  const categories = [
    'all',
    'verb',
    'adjective',
    'noun',
    'adverb',
    'particle',
    'pronoun',
    'number',
    'time',
    'family',
    'food',
    'animal',
    'weather',
    'body',
    'work',
    'school',
    'transportation',
    'shopping',
    'emotion',
    'direction',
    'color',
    'language',
    'other'
  ];

  // Initialize dictionary and load words
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setIsInitializing(true);
        console.log('Initializing quiz...');
        
        // Check if dictionary is initialized
        const isInitialized = await isDictionaryInitialized();
        if (!isInitialized) {
          console.log('Dictionary not initialized, importing data...');
          const result = await importDictionaryData();
          if (!result.success) {
            throw new Error(result.error || 'Failed to import dictionary data');
          }
          console.log(`Successfully imported ${result.count} words`);
        }
        
        setIsInitializing(false);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error initializing quiz:', error);
        setError(error instanceof Error ? error.message : 'Failed to load quiz words. Please refresh the page.');
        setIsInitializing(false);
      }
    };

    initializeQuiz();
  }, []);

  // Load words based on settings
  useEffect(() => {
    if (isDictionaryLoading || isInitializing) return;

    let filteredWords = [...words];
    
    // Filter by category
    if (settings.category !== 'all') {
      filteredWords = filteredWords.filter(word => word.category === settings.category);
    }
    
    // Filter by difficulty
    filteredWords = filteredWords.filter(word => {
      const level = word.level || 1;
      if (settings.difficulty === 'beginner') return level <= 3;
      if (settings.difficulty === 'intermediate') return level > 3 && level <= 6;
      return level > 6;
    });

    // Shuffle and select the requested number of words
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    setSelectedWords(shuffled.slice(0, settings.questionCount));
  }, [words, settings, isDictionaryLoading, isInitializing]);

  const handleStartQuiz = () => {
    if (selectedWords.length < settings.questionCount) {
      setError(`Not enough words available for the selected settings. Please try a different category or difficulty.`);
      return;
    }
    setQuizState('quiz');
    setError(null);
  };

  const handleQuizComplete = (correct: number, total: number) => {
    setResults({ correct, total });
    setQuizState('results');
  };

  const handleRestart = () => {
    setQuizState('settings');
    setResults(null);
    setError(null);
  };

  if (isInitializing || isDictionaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className={`ml-3 text-lg ${themeClasses.text.primary}`}>Loading quiz...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-nav ${themeClasses.card} bg-red-50 dark:bg-red-900/20`}>
        <p className={`text-red-600 dark:text-red-400 ${themeClasses.text.primary}`}>{error}</p>
        <button
          onClick={handleRestart}
          className={`mt-4 px-4 py-2 rounded-nav ${themeClasses.button.primary}`}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (quizState === 'quiz') {
    return (
      <SimpleQuiz
        words={selectedWords}
        onComplete={handleQuizComplete}
        onCancel={handleRestart}
      />
    );
  }

  if (quizState === 'results' && results) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-nav ${themeClasses.card}`}
      >
        <h2 className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}>
          Quiz Results
        </h2>
        <p className={`text-lg mb-4 ${themeClasses.text.secondary}`}>
          You got {results.correct} out of {results.total} questions correct!
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleRestart}
            className={`px-4 py-2 rounded-nav ${themeClasses.button.primary}`}
          >
            Try Again
          </button>
          <button
            onClick={() => setQuizState('settings')}
            className={`px-4 py-2 rounded-nav ${themeClasses.button.secondary}`}
          >
            Change Settings
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-nav ${themeClasses.card}`}
    >
      <h2 className={`text-2xl font-bold mb-6 ${themeClasses.text.primary}`}>
        Quiz Settings
      </h2>
      <div className="space-y-4">
        <div>
          <label className={`block mb-2 ${themeClasses.text.primary}`}>
            Category
          </label>
          <select
            value={settings.category}
            onChange={(e) => setSettings(prev => ({ ...prev, category: e.target.value }))}
            className={`w-full p-2 rounded-nav ${themeClasses.input}`}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block mb-2 ${themeClasses.text.primary}`}>
            Difficulty
          </label>
          <select
            value={settings.difficulty}
            onChange={(e) => setSettings(prev => ({ ...prev, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
            className={`w-full p-2 rounded-nav ${themeClasses.input}`}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className={`block mb-2 ${themeClasses.text.primary}`}>
            Number of Questions
          </label>
          <select
            value={settings.questionCount}
            onChange={(e) => setSettings(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
            className={`w-full p-2 rounded-nav ${themeClasses.input}`}
          >
            <option value="5">5 Questions</option>
            <option value="10">10 Questions</option>
            <option value="15">15 Questions</option>
            <option value="20">20 Questions</option>
          </select>
        </div>
        <button
          onClick={handleStartQuiz}
          disabled={selectedWords.length < settings.questionCount}
          className={`w-full py-3 rounded-nav ${themeClasses.button.primary} ${
            selectedWords.length < settings.questionCount ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Start Quiz
        </button>
        {selectedWords.length < settings.questionCount && (
          <p className={`text-sm mt-2 ${themeClasses.text.muted}`}>
            Not enough words available for the selected settings. Please try a different category or difficulty.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default SimpleQuizWrapper; 