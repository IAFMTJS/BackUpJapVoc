import React from 'react';
import { Box, Paper, Typography, Grid, LinearProgress, useTheme } from '@mui/material';
import {
  School as SchoolIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';
import { useProgress } from '../../context/ProgressContext';

interface ProgressSummaryProps {
  variant?: 'compact' | 'detailed';
  showCharts?: boolean;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({ 
  variant = 'detailed',
  showCharts = true 
}) => {
  const { progress } = useProgress();
  const theme = useTheme();

  // Calculate core statistics
  const totalWords = Object.keys(progress.words || {}).length;
  const masteredWords = Object.values(progress.words || {}).filter((word: any) => word.mastery >= 0.8).length;
  const learningWords = Object.values(progress.words || {}).filter((word: any) => word.mastery > 0 && word.mastery < 0.8).length;
  const notStartedWords = totalWords - masteredWords - learningWords;

  const totalStudyTime = progress.statistics?.totalStudyTime || 0;
  const currentStreak = progress.statistics?.currentStreak || 0;
  const longestStreak = progress.statistics?.longestStreak || 0;
  const averageMastery = progress.statistics?.averageMastery || 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  const coreStats = [
    {
      label: 'Total Study Time',
      value: formatTime(totalStudyTime),
      icon: <TimerIcon />,
      color: theme.palette.primary.main
    },
    {
      label: 'Current Streak',
      value: `${currentStreak} days`,
      icon: <FireIcon />,
      color: theme.palette.error.main
    },
    {
      label: 'Words Mastered',
      value: `${masteredWords}/${totalWords}`,
      icon: <StarIcon />,
      color: theme.palette.warning.main
    },
    {
      label: 'Average Mastery',
      value: formatPercent(averageMastery),
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main
    }
  ];

  if (variant === 'compact') {
    return (
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {coreStats.map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ color: stat.color, mr: 1 }}>{stat.icon}</Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
              <Typography variant="h6" component="div">
                {stat.value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <SchoolIcon sx={{ mr: 1 }} />
        Learning Progress
      </Typography>

      {/* Core Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {coreStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Box sx={{ 
              p: 2, 
              borderRadius: 1,
              bgcolor: 'background.default',
              height: '100%'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ color: stat.color, mr: 1 }}>{stat.icon}</Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                {stat.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Word Mastery Progress */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Word Mastery Distribution
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Mastered ({formatPercent(masteredWords / totalWords)})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {masteredWords} / {totalWords} words
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(masteredWords / totalWords) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  In Progress ({formatPercent(learningWords / totalWords)})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {learningWords} words
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(learningWords / totalWords) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Not Started ({formatPercent(notStartedWords / totalWords)})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {notStartedWords} words
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(notStartedWords / totalWords) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Section Progress */}
      {showCharts && progress.sections && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Section Progress
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(progress.sections).map(([section, data]: [string, any]) => (
              <Grid item xs={12} sm={6} md={4} key={section}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 1,
                  bgcolor: 'background.default'
                }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Mastery
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatPercent(data.averageMastery)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={data.averageMastery * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {data.masteredItems} mastered / {data.totalItems} total
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default ProgressSummary; 