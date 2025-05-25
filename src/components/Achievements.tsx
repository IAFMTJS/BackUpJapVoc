import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAchievements, Achievement, AchievementCategory } from '../context/AchievementContext';
import { Box, Typography, Tabs, Tab, Chip, LinearProgress, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import styled from '@emotion/styled';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`achievement-tabpanel-${index}`}
    aria-labelledby={`achievement-tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const getCategoryColor = (category: AchievementCategory): string => {
  switch (category) {
    case 'learning': return 'var(--accent-blue)';
    case 'mastery': return 'var(--accent-green)';
    case 'streak': return 'var(--accent-red)';
    case 'challenge': return 'var(--accent-purple)';
    case 'social': return 'var(--accent-yellow)';
    case 'special': return 'var(--accent-gold)';
    default: return 'var(--text-primary)';
  }
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'var(--accent-green)';
    case 'medium': return 'var(--accent-yellow)';
    case 'hard': return 'var(--accent-orange)';
    case 'expert': return 'var(--accent-red)';
    default: return 'var(--text-primary)';
  }
};

const AchievementsContainer = styled.div`
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const CategorySection = styled.div`
  margin-bottom: 2rem;
`;

const CategoryTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const AchievementCard = styled.div<{ unlocked: boolean; tier: AchievementTier }>`
  background: ${props => props.unlocked ? '#fff' : '#f5f5f5'};
  border: 2px solid ${props => {
    switch (props.tier) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      case 'platinum': return '#e5e4e2';
      default: return '#ddd';
    }
  }};
  border-radius: 8px;
  padding: 1rem;
  opacity: ${props => props.unlocked ? 1 : 0.7};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const AchievementIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const AchievementTitle = styled.h3`
  font-size: 1.1rem;
  margin: 0.5rem 0;
  color: #333;
`;

const AchievementDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0.5rem 0;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${props => props.progress}%;
    height: 100%;
    background: #4CAF50;
    transition: width 0.3s ease;
  }
`;

const ProgressText = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
  text-align: right;
`;

const UnlockedBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #4CAF50;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
`;

const AchievementCardWrapper = styled.div`
  position: relative;
`;

const categoryLabels: Record<AchievementCategory, string> = {
  vocabulary: 'Vocabulary Achievements',
  kanji: 'Kanji Achievements',
  streak: 'Study Streak Achievements',
  special: 'Special Achievements'
};

const Achievements: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { 
    achievements, 
    unlockedAchievements, 
    inProgressAchievements, 
    totalPoints,
    isLoading,
    error 
  } = useAchievements();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedAchievement(null);
  };

  const renderAchievementCard = (achievement: Achievement) => {
    const progress = (achievement.progress / achievement.maxProgress) * 100;
    const isCompleted = achievement.status === 'completed';
    const isInProgress = achievement.status === 'in_progress';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
          isCompleted ? 'bg-accent-green/10' :
          isInProgress ? 'bg-accent-yellow/10' :
          'bg-dark-lighter'
        }`}
        onClick={() => handleAchievementClick(achievement)}
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="h6" className="text-text-primary">
                {achievement.title}
              </Typography>
              <Chip
                label={achievement.difficulty}
                size="small"
                sx={{
                  backgroundColor: getDifficultyColor(achievement.difficulty),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </div>
            <Typography variant="body2" className="text-text-secondary mb-3">
              {achievement.description}
            </Typography>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Progress:</span>
                <span className="text-text-primary">
                  {achievement.progress} / {achievement.maxProgress}
                </span>
              </div>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'var(--background-lightest)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: isCompleted ? 'var(--accent-green)' :
                                  isInProgress ? 'var(--accent-yellow)' :
                                  'var(--accent-red)',
                    borderRadius: 4
                  }
                }}
              />
              {isCompleted && achievement.unlockedAt && (
                <Typography variant="caption" className="text-text-secondary">
                  Unlocked on {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                </Typography>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-accent-red">
        <Typography variant="h6">Error loading achievements</Typography>
        <Typography variant="body2">{error}</Typography>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Typography variant="h4" className="text-text-primary mb-2">
          Achievements
        </Typography>
        <Typography variant="body1" className="text-text-secondary">
          Total Points: {totalPoints}
        </Typography>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="achievement tabs"
          sx={{
            '& .MuiTab-root': {
              color: 'var(--text-secondary)',
              '&.Mui-selected': {
                color: 'var(--accent-red)'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--accent-red)'
            }
          }}
        >
          <Tab label="All" />
          <Tab label={`In Progress (${inProgressAchievements.length})`} />
          <Tab label={`Completed (${unlockedAchievements.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {achievements.map(achievement => (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {renderAchievementCard(achievement)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {inProgressAchievements.map(achievement => (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {renderAchievementCard(achievement)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {unlockedAchievements.map(achievement => (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {renderAchievementCard(achievement)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </TabPanel>

      <Dialog
        open={showDetails}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'var(--background-lighter)',
            color: 'var(--text-primary)'
          }
        }}
      >
        {selectedAchievement && (
          <>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-4xl">{selectedAchievement.icon}</span>
              <div>
                <Typography variant="h6" className="text-text-primary">
                  {selectedAchievement.title}
                </Typography>
                <Typography variant="subtitle2" className="text-text-secondary">
                  {selectedAchievement.description}
                </Typography>
              </div>
            </DialogTitle>
            <DialogContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Chip
                    label={selectedAchievement.category}
                    sx={{
                      backgroundColor: getCategoryColor(selectedAchievement.category),
                      color: 'white'
                    }}
                  />
                  <Chip
                    label={selectedAchievement.difficulty}
                    sx={{
                      backgroundColor: getDifficultyColor(selectedAchievement.difficulty),
                      color: 'white'
                    }}
                  />
                  <Chip
                    label={`${selectedAchievement.points} points`}
                    sx={{
                      backgroundColor: 'var(--accent-gold)',
                      color: 'white'
                    }}
                  />
                </div>

                <div>
                  <Typography variant="subtitle2" className="text-text-primary mb-2">
                    Requirements:
                  </Typography>
                  <ul className="list-disc list-inside text-text-secondary">
                    {selectedAchievement.requirements.map((req, index) => (
                      <li key={index}>
                        {req.type.replace(/_/g, ' ').toUpperCase()}: {req.value}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Typography variant="subtitle2" className="text-text-primary mb-2">
                    Rewards:
                  </Typography>
                  <ul className="list-disc list-inside text-text-secondary">
                    {selectedAchievement.rewards.map((reward, index) => (
                      <li key={index}>
                        {reward.type.replace(/_/g, ' ').toUpperCase()}: {reward.value}
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedAchievement.unlockedAt && (
                  <Typography variant="body2" className="text-text-secondary">
                    Unlocked on {format(new Date(selectedAchievement.unlockedAt), 'MMMM d, yyyy')}
                  </Typography>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails} sx={{ color: 'var(--text-primary)' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default Achievements; 