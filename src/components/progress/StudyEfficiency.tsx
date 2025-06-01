import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface StudyEfficiencyProps {
  efficiency: number;
  averageAccuracy: number;
  averageStudyTime: number;
  totalStudyTime: number;
}

export const StudyEfficiency: React.FC<StudyEfficiencyProps> = ({
  efficiency,
  averageAccuracy,
  averageStudyTime,
  totalStudyTime
}) => {
  const theme = useTheme();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const metrics = [
    {
      label: 'Study Efficiency',
      value: efficiency * 100,
      icon: <SpeedIcon />,
      color: theme.palette.primary.main,
      description: 'Based on consistency, accuracy, and mastery gains'
    },
    {
      label: 'Average Accuracy',
      value: averageAccuracy * 100,
      icon: <StarIcon />,
      color: theme.palette.success.main,
      description: 'Average accuracy across all study sessions'
    },
    {
      label: 'Average Study Time',
      value: (averageStudyTime / 60) * 100, // Convert to percentage of 1 hour
      icon: <TimerIcon />,
      color: theme.palette.secondary.main,
      description: 'Average daily study time'
    },
    {
      label: 'Total Study Time',
      value: (totalStudyTime / (24 * 60)) * 100, // Convert to percentage of 24 hours
      icon: <TrendingUpIcon />,
      color: theme.palette.warning.main,
      description: 'Total time spent studying'
    }
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Study Efficiency
      </Typography>
      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.label}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: metric.color,
                    color: 'white',
                    mr: 1
                  }}
                >
                  {metric.icon}
                </Box>
                <Typography variant="subtitle1">
                  {metric.label}
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {metric.label.includes('Time')
                  ? formatTime(metric.value * (metric.label.includes('Average') ? 60 : 24 * 60) / 100)
                  : `${Math.round(metric.value)}%`}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(metric.value, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: metric.color,
                    borderRadius: 3
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {metric.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}; 