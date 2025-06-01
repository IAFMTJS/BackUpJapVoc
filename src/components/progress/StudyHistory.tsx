import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  useTheme
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { StudySession } from '../../../types/progress';

interface StudyHistoryProps {
  sessions: (StudySession & {
    date: Date;
    duration: number;
  })[];
}

export const StudyHistory: React.FC<StudyHistoryProps> = ({ sessions }) => {
  const theme = useTheme();

  const getReviewTypeColor = (type: StudySession['reviewType']) => {
    switch (type) {
      case 'learning':
        return theme.palette.primary.main;
      case 'review':
        return theme.palette.secondary.main;
      case 'quiz':
        return theme.palette.warning.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getReviewTypeIcon = (type: StudySession['reviewType']) => {
    switch (type) {
      case 'learning':
        return <SchoolIcon />;
      case 'review':
        return <TrendingUpIcon />;
      case 'quiz':
        return <StarIcon />;
      default:
        return <SchoolIcon />;
    }
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Recent Study Sessions
      </Typography>
      {sessions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No study sessions recorded yet
        </Typography>
      ) : (
        <List>
          {sessions.map((session, index) => (
            <ListItem
              key={session.timestamp}
              sx={{
                borderBottom: index < sessions.length - 1 ? 1 : 0,
                borderColor: 'divider',
                py: 1.5
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getReviewTypeIcon(session.reviewType)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {format(session.date, 'MMM d, h:mm a')}
                    </Typography>
                    <Chip
                      label={session.reviewType}
                      size="small"
                      sx={{
                        bgcolor: getReviewTypeColor(session.reviewType),
                        color: 'white',
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(session.duration)} min
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {session.wordsLearned} words
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(session.accuracy * 100)}% accuracy
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}; 