import React from 'react';
import { Paper, Typography } from '@mui/material';
import { useTheme } from '../context/ThemeContext';

const KanaSection: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  return (
    <div className={themeClasses.container}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
          Kana Learning
        </h1>

        <Paper className={`mb-8 ${themeClasses.card}`}>
          <Typography variant="h6" className={`mb-4 ${themeClasses.text.secondary}`}>
            What are Kana?
          </Typography>
          <Typography variant="body1" className={themeClasses.text.primary}>
            Kana refers to the two syllabic writing systems used in Japanese: Hiragana and Katakana.
            These are essential for reading and writing Japanese.
          </Typography>
          <Typography variant="body1" className={themeClasses.text.primary}>
            Hiragana is used for native Japanese words and grammatical elements,
            while Katakana is used for foreign words and emphasis.
          </Typography>
        </Paper>

        <Paper className={themeClasses.card}>
          <Typography variant="h6" className={`mb-4 ${themeClasses.text.secondary}`}>
            Learning Resources
          </Typography>
          <Typography variant="body1" className={themeClasses.text.primary}>
            Use our interactive tools to learn and practice both Hiragana and Katakana.
            Start with the basics and gradually build your knowledge.
          </Typography>
        </Paper>
      </div>
    </div>
  );
};

export default KanaSection; 