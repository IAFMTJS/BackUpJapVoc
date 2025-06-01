import React from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  useTheme
} from '@mui/material';

interface MasteryDistributionProps {
  mastered: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

export const MasteryDistribution: React.FC<MasteryDistributionProps> = ({
  mastered,
  inProgress,
  notStarted,
  total
}) => {
  const theme = useTheme();

  const getPercentage = (value: number) => (value / total) * 100;

  const sections = [
    {
      label: 'Mastered',
      value: mastered,
      color: theme.palette.success.main,
      percentage: getPercentage(mastered)
    },
    {
      label: 'In Progress',
      value: inProgress,
      color: theme.palette.warning.main,
      percentage: getPercentage(inProgress)
    },
    {
      label: 'Not Started',
      value: notStarted,
      color: theme.palette.grey[400],
      percentage: getPercentage(notStarted)
    }
  ];

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Word Mastery Distribution
      </Typography>
      <Box sx={{ mt: 2 }}>
        {sections.map((section) => (
          <Box key={section.label} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {section.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {section.value} ({Math.round(section.percentage)}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={section.percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  bgcolor: section.color,
                  borderRadius: 4
                }
              }}
            />
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Total Words: {total}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Mastery Rate: {Math.round((mastered / total) * 100)}%
        </Typography>
      </Box>
    </Paper>
  );
}; 