import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, LinearProgress } from '@mui/material';
import { Flag as FlagIcon } from '@mui/icons-material';

const GoalsTracker: React.FC = () => {
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Learning Goals
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <FlagIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Daily Study Goal"
              secondary="Study for 30 minutes today"
            />
            <LinearProgress
              variant="determinate"
              value={60}
              sx={{ width: 100, ml: 2 }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FlagIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Weekly Vocabulary Goal"
              secondary="Learn 50 new words this week"
            />
            <LinearProgress
              variant="determinate"
              value={40}
              sx={{ width: 100, ml: 2 }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FlagIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Monthly Mastery Goal"
              secondary="Master 200 words this month"
            />
            <LinearProgress
              variant="determinate"
              value={25}
              sx={{ width: 100, ml: 2 }}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default GoalsTracker; 