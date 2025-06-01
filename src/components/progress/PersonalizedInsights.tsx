import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, Chip, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
  Psychology as PsychologyIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  AutoGraph as AutoGraphIcon
} from '@mui/icons-material';
import { useProgress } from '../../context/ProgressContext';

interface Insight {
  type: 'achievement' | 'recommendation' | 'warning' | 'tip';
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: number;
  category: 'study' | 'performance' | 'habits' | 'goals';
}

const PersonalizedInsights: React.FC = () => {
  const theme = useTheme();
  const { progress } = useProgress();

  const insights = useMemo(() => {
    const words = progress.words || {};
    const sessions = progress.statistics?.studySessions || [];
    const insights: Insight[] = [];

    // Calculate basic metrics
    const totalWords = Object.keys(words).length;
    const masteredWords = Object.values(words).filter((word: any) => word.mastery >= 0.8).length;
    const learningWords = Object.values(words).filter((word: any) => word.mastery > 0 && word.mastery < 0.8).length;
    const notStartedWords = totalWords - masteredWords - learningWords;

    // Study streak insights
    const currentStreak = progress.statistics?.currentStreak || 0;
    const longestStreak = progress.statistics?.longestStreak || 0;

    if (currentStreak > 0) {
      insights.push({
        type: 'achievement',
        title: 'Maintaining Your Streak!',
        description: `You've been studying for ${currentStreak} days in a row. Keep up the great work!`,
        icon: <TrophyIcon />,
        priority: 1,
        category: 'habits'
      });
    }

    if (currentStreak > 0 && currentStreak < longestStreak * 0.8) {
      insights.push({
        type: 'tip',
        title: 'Streak Milestone Ahead',
        description: `You're ${Math.round(longestStreak * 0.8 - currentStreak)} days away from reaching 80% of your longest streak!`,
        icon: <TrendingUpIcon />,
        priority: 2,
        category: 'habits'
      });
    }

    // Word mastery insights
    const masteryRate = masteredWords / totalWords;
    if (masteryRate > 0.7) {
      insights.push({
        type: 'achievement',
        title: 'Mastery Milestone',
        description: `You've mastered over 70% of your vocabulary! Consider adding more challenging words.`,
        icon: <StarIcon />,
        priority: 1,
        category: 'performance'
      });
    } else if (masteryRate < 0.3 && totalWords > 10) {
      insights.push({
        type: 'warning',
        title: 'Focus on Mastery',
        description: 'Less than 30% of your words are mastered. Consider reviewing difficult words more frequently.',
        icon: <WarningIcon />,
        priority: 3,
        category: 'performance'
      });
    }

    // Study time insights
    const recentSessions = sessions.slice(-5);
    const averageSessionDuration = recentSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / recentSessions.length;
    
    if (averageSessionDuration < 15) {
      insights.push({
        type: 'recommendation',
        title: 'Short Study Sessions',
        description: 'Your recent sessions are quite short. Longer sessions (20-30 minutes) can improve retention.',
        icon: <TimerIcon />,
        priority: 2,
        category: 'study'
      });
    }

    // Learning pattern insights
    const timeOfDayPerformance = sessions.reduce((acc: any, session) => {
      const hour = new Date(session.startTime).getHours();
      const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
      if (!acc[timeSlot]) {
        acc[timeSlot] = { total: 0, count: 0 };
      }
      acc[timeSlot].total += session.accuracy || 0;
      acc[timeSlot].count++;
      return acc;
    }, {});

    const bestTimeSlot = Object.entries(timeOfDayPerformance)
      .sort(([, a]: any, [, b]: any) => (b.total / b.count) - (a.total / a.count))[0]?.[0];

    if (bestTimeSlot) {
      insights.push({
        type: 'tip',
        title: 'Optimal Study Time',
        description: `You perform best during ${bestTimeSlot.toLowerCase()} sessions. Try to schedule more study time during this period.`,
        icon: <ScheduleIcon />,
        priority: 2,
        category: 'habits'
      });
    }

    // Word difficulty insights
    const difficultWords = Object.entries(words)
      .filter(([, data]: [string, any]) => data.mastery < 0.4)
      .map(([word]) => word);

    if (difficultWords.length > 5) {
      insights.push({
        type: 'recommendation',
        title: 'Challenging Words',
        description: `You have ${difficultWords.length} words with low mastery. Consider focusing on these in your next session.`,
        icon: <SchoolIcon />,
        priority: 2,
        category: 'study'
      });
    }

    // Progress rate insights
    const recentProgress = sessions.slice(-10).reduce((sum, session) => sum + (session.wordsLearned || 0), 0);
    const previousProgress = sessions.slice(-20, -10).reduce((sum, session) => sum + (session.wordsLearned || 0), 0);
    
    if (recentProgress > previousProgress * 1.2) {
      insights.push({
        type: 'achievement',
        title: 'Accelerated Learning',
        description: 'Your learning speed has increased by 20% in recent sessions!',
        icon: <AutoGraphIcon />,
        priority: 1,
        category: 'performance'
      });
    }

    // Sort insights by priority and type
    return insights.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const typeOrder = { warning: 0, recommendation: 1, tip: 2, achievement: 3 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }, [progress.words, progress.statistics?.studySessions, progress.statistics?.currentStreak, progress.statistics?.longestStreak]);

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'achievement':
        return theme.palette.success.main;
      case 'recommendation':
        return theme.palette.primary.main;
      case 'warning':
        return theme.palette.error.main;
      case 'tip':
        return theme.palette.info.main;
      default:
        return theme.palette.text.primary;
    }
  };

  const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => (
    <Paper
      sx={{
        p: 2,
        borderLeft: `4px solid ${getInsightColor(insight.type)}`,
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
        <Box sx={{ color: getInsightColor(insight.type), mr: 1, mt: 0.5 }}>
          {insight.icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ color: getInsightColor(insight.type) }}>
            {insight.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {insight.description}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Chip
          size="small"
          label={insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
          sx={{ bgcolor: getInsightColor(insight.type), color: 'white' }}
        />
        <Chip
          size="small"
          label={insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
          variant="outlined"
        />
      </Box>
    </Paper>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LightbulbIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
        <Typography variant="h6">
          Personalized Learning Insights
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {insights.map((insight, index) => (
          <Grid item xs={12} md={6} key={index}>
            <InsightCard insight={insight} />
          </Grid>
        ))}
      </Grid>

      {insights.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <PsychologyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Insights Available Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete more study sessions to receive personalized insights and recommendations.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default PersonalizedInsights; 