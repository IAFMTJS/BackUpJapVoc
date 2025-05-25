import React, { useState, lazy, Suspense } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import Dictionary from '../components/Dictionary';
import LearningProgress from '../components/LearningProgress';
import { downloadOfflineData } from '../utils/offlineData';
import { useProgress } from '../context/ProgressContext';
import { ProgressItem } from '../types';
import { quizWords } from '../data/quizData';
import { kanjiList } from '../data/kanjiData';
import { beginnerPhrases } from './AnimeSection';
import { romajiWords, romajiSentences, romajiStories } from '../data/romajiWords';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { motion } from 'framer-motion';
import JapaneseCityscape from '../components/visualizations/JapaneseCityscape';

// Lazy load heavy components
const LazyDictionary = lazy(() => import('../components/Dictionary'));
const LazyLearningProgress = lazy(() => import('../components/LearningProgress'));
const LazyProgressVisuals = lazy(() => import('../components/ProgressVisuals'));

// Loading fallback component for lazy-loaded components
const ComponentLoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
    <Typography variant="body1" color="text.secondary">
      Loading component...
    </Typography>
  </Box>
);

type TabType = 'progress' | 'dictionary';

const sections = [
  { 
    id: 'vocabulary', 
    name: 'Vocabulary Quiz', 
    icon: '📝', 
    total: quizWords.filter(item => item.isHiragana).length + quizWords.filter(item => item.isKatakana).length,
    description: 'Test your knowledge of Japanese vocabulary'
  },
  { 
    id: 'dictionary', 
    name: 'Dictionary', 
    icon: '📖', 
    total: quizWords.filter(item => item.isHiragana || item.isKatakana).length + kanjiList.length,
    description: 'Learn and track vocabulary progress'
  },
  { 
    id: 'kanji', 
    name: 'Kanji', 
    icon: '🀄', 
    total: kanjiList.length,
    description: 'Master Japanese characters'
  },
  { 
    id: 'games', 
    name: 'Games', 
    icon: '🎮', 
    total: 50,
    description: 'Learn through interactive games',
    path: '/games'
  },
  { 
    id: 'vocabulary-builder', 
    name: 'Vocabulary Builder', 
    icon: '📚', 
    total: quizWords.length,
    description: 'Build your vocabulary systematically'
  },
  { 
    id: 'anime', 
    name: 'Anime Section', 
    icon: '🎬', 
    total: beginnerPhrases.length,
    description: 'Learn from anime and manga'
  },
  {
    id: 'romaji',
    name: 'Romaji Practice',
    icon: '🔤',
    total: romajiWords.length + romajiSentences.length + romajiStories.length,
    description: 'Master Romaji words, sentences, and stories'
  },
];

// Add type definitions for section stats
type DictionaryStats = {
  masteryLevels: {
    started: number;
    almostMastered: number;
    mastered: number;
  };
  recentActivity: number;
  totalItems: number;
  progressPercentage: number;
};

type OtherSectionStats = {
  completed: number;
  totalItems: number;
  progressPercentage: number;
  recentActivity: number;
};

type SectionStats = DictionaryStats | OtherSectionStats;

const ProgressPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('progress');
  const { getThemeClasses, theme } = useTheme();
  const themeClasses = getThemeClasses();
  const { progress, isLoading, error } = useProgress();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Typography variant="h6" color="text.secondary">
            Loading your progress...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '50vh' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error loading progress
          </Typography>
          <Typography color="text.secondary">
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Decorative cityscape background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <JapaneseCityscape 
          width={1000}
          height={500}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            transform: 'scaleX(-1)',
            filter: theme === 'dark' ? 'brightness(0.6)' : 'brightness(0.9)'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Box sx={{ py: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              textAlign: 'center',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Your Learning Journey
          </Typography>
          
          <Typography 
            variant="h6" 
            component="p" 
            sx={{ 
              textAlign: 'center', 
              mb: 4,
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Track your progress, celebrate achievements, and visualize your Japanese learning journey.
            Every step forward is a milestone in your language learning adventure.
          </Typography>

          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 4,
              background: theme => theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)',
              backdropFilter: 'blur(10px)',
              border: theme => `1px solid ${theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.1)'}`
            }}
          >
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyProgressVisuals />
            </Suspense>
          </Paper>

          {activeTab === 'dictionary' && (
            <Box sx={{ mt: 4 }}>
              <Suspense fallback={<ComponentLoadingFallback />}>
                <LazyDictionary />
              </Suspense>
            </Box>
          )}

          {activeTab === 'progress' && (
            <Box sx={{ mt: 4 }}>
              <Suspense fallback={<ComponentLoadingFallback />}>
                <LazyLearningProgress />
              </Suspense>
            </Box>
          )}
        </Box>
      </motion.div>
    </Container>
  );
};

export default ProgressPage; 