import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';

const AchievementsList: React.FC = () => {
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Achievements
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <TrophyIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="First Steps"
              secondary="Started your Japanese learning journey"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TrophyIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Word Master"
              secondary="Mastered your first 50 words"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TrophyIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Consistent Learner"
              secondary="Maintained a 7-day study streak"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TrophyIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Grammar Explorer"
              secondary="Completed basic grammar lessons"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TrophyIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Cultural Enthusiast"
              secondary="Learned about Japanese culture and customs"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default AchievementsList; 