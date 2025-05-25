import React, { useState } from 'react';
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
import { Box, Container, Typography, Paper } from '@mui/material';
import ProgressVisuals from '../components/ProgressVisuals';
import { motion } from 'framer-motion';

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
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { progress } = useProgress();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
            <ProgressVisuals />
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default ProgressPage; 