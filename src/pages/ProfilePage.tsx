import React, { useState, useEffect } from 'react';
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
  useMediaQuery,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Edit as EditIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Star as StarIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useAchievements } from '../context/AchievementContext';
import ProgressPage from './ProgressPage';
import Settings from '../components/Settings';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const { progress: userProgress, statistics } = useProgress();
  const { achievements, unlockedAchievements } = useAchievements();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate user stats
  const userStats = {
    totalWords: Object.keys(userProgress).length,
    masteredWords: Object.values(userProgress).filter(p => p.correct >= 3).length,
    currentStreak: calculateStreak(userProgress),
    totalAchievements: achievements.length,
    unlockedAchievements: unlockedAchievements.length,
    averageAccuracy: calculateAverageAccuracy(userProgress)
  };

  // Generate chart data for the last 7 days
  const chartData = generateChartData(userProgress);

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Enhanced Profile Header */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'white',
                color: theme.palette.primary.main,
                fontSize: '3rem',
                border: '4px solid white',
                boxShadow: theme.shadows[4]
              }}
            >
              {currentUser?.displayName?.[0].toUpperCase() || currentUser?.email?.[0].toUpperCase() || 'U'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              {currentUser?.displayName || 'User'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }} gutterBottom>
              {currentUser?.email}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                sx={{ 
                  bgcolor: 'white', 
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                startIcon={<ChartIcon />}
                onClick={() => setTabValue(1)}
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                View Stats
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Words Learned</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {userStats.totalWords}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {userStats.masteredWords} mastered
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={userStats.totalWords > 0 ? (userStats.masteredWords / userStats.totalWords) * 100 : 0}
                  sx={{ mt: 1, height: 4, borderRadius: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FireIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Current Streak</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {userStats.currentStreak}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrophyIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Achievements</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {userStats.unlockedAchievements}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  of {userStats.totalAchievements}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={userStats.totalAchievements > 0 ? (userStats.unlockedAchievements / userStats.totalAchievements) * 100 : 0}
                  sx={{ mt: 1, height: 4, borderRadius: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Accuracy</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {Math.round(userStats.averageAccuracy)}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  average
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Progress Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Learning Progress
        </Typography>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Line 
                type="monotone" 
                dataKey="words" 
                stroke={theme.palette.primary.main} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "fullWidth" : "standard"}
          centered={!isMobile}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Tab label="Profile" />
          <Tab label="Progress" />
          <Tab label="Achievements" />
          <Tab label="Settings" />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Learning Progress Chart
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line 
                        type="monotone" 
                        dataKey="words" 
                        stroke={theme.palette.primary.main} 
                        name="Words Learned"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke={theme.palette.success.main} 
                        name="Accuracy %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Completed Daily Quiz
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        2 hours ago
                      </Typography>
                    </Box>
                    <Chip label="+10 XP" size="small" color="success" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                      <TrophyIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Unlocked Achievement
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        1 day ago
                      </Typography>
                    </Box>
                    <Chip label="First Steps" size="small" color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                      <FireIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Extended Streak
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        3 days ago
                      </Typography>
                    </Box>
                    <Chip label="7 days" size="small" color="warning" />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Progress Tab */}
        <TabPanel value={tabValue} index={1}>
          <ProgressPage />
        </TabPanel>

        {/* Achievements Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Achievement Progress
                </Typography>
                <Grid container spacing={2}>
                  {achievements.slice(0, 6).map((achievement) => {
                    const isUnlocked = unlockedAchievements.some(u => u.id === achievement.id);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                        <Card 
                          sx={{ 
                            p: 2, 
                            opacity: isUnlocked ? 1 : 0.6,
                            bgcolor: isUnlocked ? 'success.light' : 'background.paper'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: isUnlocked ? 'success.main' : 'grey.400' }}>
                              {isUnlocked ? <TrophyIcon /> : <StarIcon />}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {achievement.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {achievement.description}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Settings />
        </TabPanel>
      </Paper>
    </Container>
  );
};

// Helper functions
const calculateStreak = (progress: Record<string, any>): number => {
  const dates = Object.values(progress)
    .map(p => new Date(p.lastAttempted))
    .filter(d => !isNaN(d.getTime()));
  
  if (dates.length === 0) return 0;

  const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());
  let streak = 1;
  let currentDate = new Date(sortedDates[0]);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    prevDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else if (diffDays > 1) {
      break;
    }
  }

  return streak;
};

const calculateAverageAccuracy = (progress: Record<string, any>): number => {
  const accuracies = Object.values(progress).map(p => 
    p.attempts > 0 ? (p.correct / p.attempts) * 100 : 0
  );
  return accuracies.length > 0 
    ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length) 
    : 0;
};

const generateChartData = (progress: Record<string, any>) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    words: Object.values(progress).filter(p => {
      // Check if lastAttempted exists and is a valid date
      if (!p.lastAttempted) return false;
      const attemptDate = new Date(p.lastAttempted);
      return !isNaN(attemptDate.getTime()) && 
             attemptDate.toISOString().split('T')[0] === date;
    }).length
  }));
};

export default ProfilePage; 