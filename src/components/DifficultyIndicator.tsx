import React from 'react';
import { Tooltip } from '@mui/material';
import { motion } from 'framer-motion';

type Difficulty = 'easy' | 'medium' | 'hard' | 'neutral';

interface DifficultyIndicatorProps {
  difficulty: Difficulty;
}

const difficultyColors = {
  easy: {
    light: 'bg-green-100 text-green-800',
    dark: 'bg-green-900/30 text-green-400',
    icon: '🌱'
  },
  medium: {
    light: 'bg-yellow-100 text-yellow-800',
    dark: 'bg-yellow-900/30 text-yellow-400',
    icon: '🌿'
  },
  hard: {
    light: 'bg-red-100 text-red-800',
    dark: 'bg-red-900/30 text-red-400',
    icon: '🌳'
  },
  neutral: {
    light: 'bg-gray-100 text-gray-800',
    dark: 'bg-gray-900/30 text-gray-400',
    icon: '❓'
  }
};

const difficultyLabels = {
  easy: 'Easy - You know this well!',
  medium: 'Medium - Keep practicing!',
  hard: 'Hard - Needs more review',
  neutral: 'Not yet practiced'
};

export const DifficultyIndicator: React.FC<DifficultyIndicatorProps> = ({ difficulty }) => {
  const colors = difficultyColors[difficulty];
  const label = difficultyLabels[difficulty];

  return (
    <Tooltip title={label} arrow>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
          colors.light
        } dark:${colors.dark}`}
      >
        <span className="mr-1">{colors.icon}</span>
        <span className="capitalize">{difficulty}</span>
      </motion.div>
    </Tooltip>
  );
}; 