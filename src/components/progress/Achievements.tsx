import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Star as StarIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useProgress } from '../../context/ProgressContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isUnlocked: boolean;
  progress?: number;
  dateUnlocked?: number;
}

export const Achievements: React.FC = () => {
  const { progress } = useProgress();
  const theme = useTheme();

  const {
    statistics,
    words
  } = progress;

  const totalWords = Object.keys(words).length;
  const masteredWords = Object.values(words).filter(w => w.mastery >= 0.8).length;
  const totalStudyTime = statistics.totalStudyTime;
  const currentStreak = statistics.currentStreak;
  const longestStreak = statistics.longestStreak;
  const studySessions = statistics.studySessions.length;

  const achievements: Achievement[] = [
    {
      id: 'first_steps',
      title: 'First Steps',
      description: 'Complete your first study session',
      icon: <SchoolIcon />,
      color: theme.palette.primary.main,
      isUnlocked: studySessions > 0,
      dateUnlocked: studySessions > 0 ? statistics.studySessions[0]?.timestamp : undefined
    },
    {
      id: 'word_master_beginner',
      title: 'Word Master (Beginner)',
      description: 'Master 50 words',
      icon: <StarIcon />,
      color: theme.palette.success.main,
      isUnlocked: masteredWords >= 50,
      progress: (masteredWords / 50) * 100,
      dateUnlocked: masteredWords >= 50 ? statistics.lastStudyDate : undefined
    },
    {
      id: 'word_master_intermediate',
      title: 'Word Master (Intermediate)',
      description: 'Master 200 words',
      icon: <StarIcon />,
      color: theme.palette.success.main,
      isUnlocked: masteredWords >= 200,
      progress: (masteredWords / 200) * 100,
      dateUnlocked: masteredWords >= 200 ? statistics.lastStudyDate : undefined
    },
    {
      id: 'word_master_advanced',
      title: 'Word Master (Advanced)',
      description: 'Master 500 words',
      icon: <StarIcon />,
      color: theme.palette.success.main,
      isUnlocked: masteredWords >= 500,
      progress: (masteredWords / 500) * 100,
      dateUnlocked: masteredWords >= 500 ? statistics.lastStudyDate : undefined
    },
    {
      id: 'streak_7',
      title: '7-Day Streak',
      description: 'Maintain a 7-day study streak',
      icon: <FireIcon />,
      color: theme.palette.warning.main,
      isUnlocked: longestStreak >= 7,
      progress: (currentStreak / 7) * 100,
      dateUnlocked: longestStreak >= 7 ? statistics.lastStudyDate : undefined
    },
    {
      id: 'streak_30',
      title: '30-Day Streak',
      description: 'Maintain a 30-day study streak',
      icon: <FireIcon />,
      color: theme.palette.warning.main,
      isUnlocked: longestStreak >= 30,
      progress: (currentStreak / 30) * 100,
      dateUnlocked: longestStreak >= 30 ? statistics.lastStudyDate : undefined
    },
    {
      id: 'study_time_1h',
      title: 'Dedicated Learner',
      description: 'Study for 1 hour total',
      icon: <TimerIcon />,
      color: theme.palette.info.main,
      isUnlocked: totalStudyTime >= 60,
      progress: (totalStudyTime / 60) * 100,
      dateUnlocked: totalStudyTime >= 60 ? statistics.lastStudyDate : undefined
    },
    {
      id: 'study_time_10h',
      title: 'Language Enthusiast',
      description: 'Study for 10 hours total',
      icon: <TimerIcon />,
      color: theme.palette.info.main,
      isUnlocked: totalStudyTime >= 600,
      progress: (totalStudyTime / 600) * 100,
      dateUnlocked: totalStudyTime >= 600 ? statistics.lastStudyDate : undefined
    },
    {
      id: 'efficiency_master',
      title: 'Efficiency Master',
      description: 'Achieve 90% study efficiency',
      icon: <TrendingUpIcon />,
      color: theme.palette.secondary.main,
      isUnlocked: progress.statistics.studyEfficiency >= 0.9,
      progress: progress.statistics.studyEfficiency * 100,
      dateUnlocked: progress.statistics.studyEfficiency >= 0.9 ? statistics.lastStudyDate : undefined
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Achievements
      </Typography>
      <List>
        {unlockedAchievements.map((achievement) => (
          <ListItem
            key={achievement.id}
            sx={{
              opacity: 1,
              bgcolor: 'background.default',
              borderRadius: 1,
              mb: 1
            }}
          >
            <ListItemIcon sx={{ color: achievement.color }}>
              {achievement.icon}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">
                    {achievement.title}
                  </Typography>
                  <Chip
                    label="Unlocked"
                    size="small"
                    color="success"
                    sx={{ height: 20 }}
                  />
                </Box>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  {achievement.description}
                  {achievement.dateUnlocked && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Unlocked {new Date(achievement.dateUnlocked).toLocaleDateString()}
                    </Typography>
                  )}
                </Typography>
              }
            />
          </ListItem>
        ))}
        {lockedAchievements.map((achievement) => (
          <Tooltip
            key={achievement.id}
            title={`Progress: ${Math.round(achievement.progress || 0)}%`}
            placement="right"
          >
            <ListItem
              sx={{
                opacity: 0.6,
                bgcolor: 'background.default',
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.grey[500] }}>
                {achievement.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {achievement.title}
                    </Typography>
                    <Chip
                      label="Locked"
                      size="small"
                      color="default"
                      sx={{ height: 20 }}
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {achievement.description}
                  </Typography>
                }
              />
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Paper>
  );
}; 