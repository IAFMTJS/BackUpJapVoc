import React, { useState } from 'react';
import { WordLevelProvider, useWordLevel } from '../context/WordLevelContext';
import WordLevelManager from '../components/WordLevelManager';
import WordLevelPractice from '../components/WordLevelPractice';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { ExamSection } from '../components/ExamSection';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`word-level-tabpanel-${index}`}
      aria-labelledby={`word-level-tab-${index}`}
      className={themeClasses.container}
      {...other}
    >
      {value === index && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
}

const WordLevelsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { userProgress, updateUserProgress } = useWordLevel();
  const [currentLevel, setCurrentLevel] = useState(userProgress.currentLevel || 1);
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLevelUp = (newLevel: number) => {
    updateUserProgress({
      currentLevel: newLevel,
      levels: userProgress.levels.map(level => 
        level.level === newLevel
          ? { ...level, unlockedAt: new Date() }
          : level
      )
    });
    setCurrentLevel(newLevel);
  };

  return (
    <div className={themeClasses.container}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className={themeClasses.nav.link.default}>
            ← Back to Home
          </Link>
          <h1 className={themeClasses.text.primary}>Word Levels</h1>
        </div>
      </div>

      <div className={themeClasses.card}>
        <div className="flex border-b">
          {['Word Levels', 'Practice', 'Exam'].map((label, index) => (
            <button
              key={label}
              onClick={() => handleTabChange(null, index)}
              className={`px-4 py-2 ${
                activeTab === index
                  ? themeClasses.button.primary
                  : themeClasses.button.secondary
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <TabPanel value={activeTab} index={0}>
          <WordLevelManager 
            userProgress={userProgress}
            onLevelUp={handleLevelUp}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <WordLevelPractice />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <ExamSection
            level={currentLevel}
            onAdvanceLevel={() => handleLevelUp(currentLevel + 1)}
          />
        </TabPanel>
      </div>
    </div>
  );
};

const WordLevelsPage: React.FC = () => {
  return (
    <WordLevelProvider>
      <WordLevelsContent />
    </WordLevelProvider>
  );
};

export default WordLevelsPage; 