import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import SRSManager from '../components/SRSManager';
import { Box, Typography, Paper } from '@mui/material';

const SRSPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="py-8">
      <div className="flex items-center mb-8">
        <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
          ← Back to Home
        </Link>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Spaced Repetition Learning
        </h1>
      </div>

      <Paper className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <Box className="mb-6">
          <Typography variant="h6" className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            About Spaced Repetition
          </Typography>
          <Typography variant="body1" className={isDarkMode ? 'text-gray-400' : 'text-gray-700'}>
            Spaced repetition is a learning technique that incorporates increasing intervals of time between 
            subsequent review of previously learned material to exploit the psychological spacing effect. 
            This method helps you remember vocabulary more effectively by reviewing words at optimal intervals.
          </Typography>
        </Box>

        <Box className="mb-6">
          <Typography variant="h6" className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            How it Works
          </Typography>
          <ul className={`list-disc pl-6 space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            <li>Review words at increasing intervals (1h, 6h, 1d, 3d, 1w, 2w)</li>
            <li>Mark words as correct or incorrect to adjust their review schedule</li>
            <li>Words you know well will appear less frequently</li>
            <li>Words you struggle with will appear more often</li>
            <li>Track your progress with each word's mastery level</li>
          </ul>
        </Box>

        <SRSManager />
      </Paper>
    </div>
  );
};

export default SRSPage; 