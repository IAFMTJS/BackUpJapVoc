import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Avatar,
  Button,
  Grid,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import ProgressPage from './ProgressPage';
import Settings from '../components/Settings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { progress } = useProgress();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please sign in to view your profile
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href="/login"
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
        </Paper>
      </Container>
    );
  }

  const userStats = {
    totalWords: Object.keys(progress.words).length,
    masteredWords: Object.values(progress.words).filter(w => w.mastery >= 0.8).length,
    studyTime: progress.statistics.totalStudyTime,
    streak: progress.statistics.currentStreak
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Profile Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: theme.palette.primary.main,
                fontSize: '2.5rem'
              }}
            >
              {currentUser.email?.[0].toUpperCase() || 'U'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {currentUser.displayName || 'User'}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {currentUser.email}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              size="small"
              sx={{ mt: 1 }}
            >
              Edit Profile
            </Button>
          </Grid>
          <Grid item>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {userStats.totalWords}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Words
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    {userStats.masteredWords}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mastered
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="warning.main">
                    {Math.round(userStats.studyTime / 60)}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Study Time
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="error.main">
                    {userStats.streak}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Day Streak
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          centered={!isMobile}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<PersonIcon />}
            label="Profile"
            id="profile-tab-0"
            aria-controls="profile-tabpanel-0"
          />
          <Tab
            icon={<TimelineIcon />}
            label="Progress"
            id="profile-tab-1"
            aria-controls="profile-tabpanel-1"
          />
          <Tab
            icon={<SettingsIcon />}
            label="Settings"
            id="profile-tab-2"
            aria-controls="profile-tabpanel-2"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {currentUser.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Member Since
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {new Date(currentUser.metadata.creationTime || '').toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Last Sign In
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {new Date(currentUser.metadata.lastSignInTime || '').toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Learning Preferences
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Daily Goal
                    </Typography>
                    <Typography variant="body1">
                      {progress.preferences.dailyGoal} words
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Difficulty Level
                    </Typography>
                    <Typography variant="body1">
                      {progress.preferences.difficulty}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Show Romaji
                    </Typography>
                    <Typography variant="body1">
                      {progress.preferences.showRomaji ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Auto Play Audio
                    </Typography>
                    <Typography variant="body1">
                      {progress.preferences.autoPlayAudio ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ProgressPage />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Settings />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProfilePage; 