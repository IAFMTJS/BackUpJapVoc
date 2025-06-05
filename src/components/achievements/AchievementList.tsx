import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, LinearProgress, useTheme } from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { useAchievements } from '../../context/AchievementContext';

interface AchievementListProps {
  limit?: number;
}

export const AchievementList: React.FC<AchievementListProps> = ({ limit }) => {
  const { achievements } = useAchievements();
  const theme = useTheme();

  const displayAchievements = limit ? achievements.slice(0, limit) : achievements;

  return (
    <List>
      {displayAchievements.map((achievement) => (
        <ListItem
          key={achievement.id}
          sx={{
            mb: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateX(4px)'
            }
          }}
        >
          <ListItemIcon>
            <TrophyIcon sx={{ color: achievement.unlocked ? theme.palette.warning.main : 'text.secondary' }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="subtitle1" sx={{ fontWeight: achievement.unlocked ? 'bold' : 'normal' }}>
                {achievement.title}
              </Typography>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {achievement.description}
                </Typography>
                {achievement.progress !== undefined && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(achievement.progress.current / achievement.progress.target) * 100}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: achievement.unlocked ? theme.palette.warning.main : theme.palette.primary.main
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {achievement.progress.current} / {achievement.progress.target}
                    </Typography>
                  </Box>
                )}
                {achievement.unlocked && achievement.unlockedAt && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}; 