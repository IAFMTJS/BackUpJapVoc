import React, { useEffect, useState } from 'react';
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
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
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
  BarChart as ChartIcon,
  MoreVert as MoreVertIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useAchievements } from '../context/AchievementContext';
import ProgressPage from './ProgressPage';
import Settings from '../components/Settings';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { StatisticsDashboard } from '../components/progress/StatisticsDashboard';
import { LearningStreak } from '../components/progress/LearningStreak';
import { MasteryProgress } from '../components/progress/MasteryProgress';
import { AchievementList } from '../components/achievements/AchievementList';
import LearningGoals from '../components/progress/LearningGoals';
import ProgressSummary from '../components/progress/ProgressSummary';

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

interface UserStats {
  totalWords: number;
  masteredWords: number;
  currentStreak: number;
  totalStudyTime: number;
  averageMastery: number;
  lastStudyDate: Date | null;
  level: number;
  weeklyProgress: number;
  monthlyProgress: number;
}

interface WordProgress {
  lastAttempted: string;
  masteryLevel: number;
  attempts: number;
  correct: number;
  reviewCount: number;
}

interface ProgressData {
  words: Record<string, WordProgress>;
  statistics: {
    currentStreak: number;
    totalStudyTime: number;
    averageMastery: number;
    lastStudyDate: string;
  };
}

export const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser, loading: authLoading } = useAuth();
  const { progress, isLoading: progressLoading, error: progressError } = useProgress();
  const { achievements, isLoading: achievementsLoading, error: achievementsError } = useAchievements();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<UserStats>({
    totalWords: 0,
    masteredWords: 0,
    currentStreak: 0,
    totalStudyTime: 0,
    averageMastery: 0,
    lastStudyDate: null,
    level: 1,
    weeklyProgress: 0,
    monthlyProgress: 0
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showLanguageSettings, setShowLanguageSettings] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);

  // Add detailed debug logging for loading states
  useEffect(() => {
    console.log('[ProfilePage] Detailed loading states:', {
      auth: {
        loading: authLoading,
        hasUser: !!currentUser,
        userId: currentUser?.uid,
        email: currentUser?.email
      },
      progress: {
        loading: progressLoading,
        hasProgress: !!progress,
        wordCount: progress ? Object.keys(progress.words).length : 0,
        hasStatistics: progress ? !!progress.statistics : false,
        error: progressError
      },
      achievements: {
        loading: achievementsLoading,
        hasAchievements: !!achievements,
        achievementCount: achievements?.length || 0,
        error: achievementsError
      },
      timestamp: new Date().toISOString()
    });
  }, [authLoading, currentUser, progressLoading, progress, achievementsLoading, achievements, progressError, achievementsError]);

  useEffect(() => {
    if (progress) {
      const calculateStats = (progress: ProgressData): UserStats => {
        const words = Object.values(progress.words);
        const totalWords = words.length;
        const masteredWords = words.filter(w => w.masteryLevel >= 0.8).length;
        const currentStreak = progress.statistics.currentStreak || 0;
        const totalStudyTime = progress.statistics.totalStudyTime || 0;
        const averageMastery = progress.statistics.averageMastery || 0;
        const lastStudyDate = progress.statistics.lastStudyDate 
          ? new Date(progress.statistics.lastStudyDate) 
          : null;

        // Calculate weekly and monthly progress
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const weeklyProgress = words.filter(w => 
          w.lastAttempted && new Date(w.lastAttempted) >= weekAgo
        ).length;

        const monthlyProgress = words.filter(w => 
          w.lastAttempted && new Date(w.lastAttempted) >= monthAgo
        ).length;

        const level = calculateUserLevel({
          totalWords,
          currentStreak,
          averageMastery
        });

        return {
          totalWords,
          masteredWords,
          currentStreak,
          totalStudyTime,
          averageMastery,
          lastStudyDate,
          level,
          weeklyProgress,
          monthlyProgress
        };
      };

      setStats(calculateStats(progress));
    }
  }, [progress]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleViewStats = () => {
    setTabValue(1); // Switch to the Progress tab
  };

  if (authLoading) {
    console.log('[ProfilePage] Auth still loading');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading user data...
        </Typography>
      </Box>
    );
  }

  if (!currentUser) {
    console.log('[ProfilePage] No user found');
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

  if (progressLoading) {
    console.log('[ProfilePage] Progress still loading:', {
      userId: currentUser.uid,
      timestamp: new Date().toISOString()
    });
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading progress data...
        </Typography>
      </Box>
    );
  }

  if (achievementsLoading) {
    console.log('[ProfilePage] Achievements still loading:', {
      userId: currentUser.uid,
      timestamp: new Date().toISOString()
    });
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading achievements...
        </Typography>
      </Box>
    );
  }

  if (progressError) {
    console.error('[ProfilePage] Progress error:', progressError);
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load progress data: {progressError}
        </Alert>
      </Container>
    );
  }

  if (achievementsError) {
    console.error('[ProfilePage] Achievements error:', achievementsError);
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load achievements: {achievementsError}
        </Alert>
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
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  size="small"
                  onClick={handleEditProfile}
                  sx={{ 
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              }
            >
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
            </Badge>
          </Grid>
          
          <Grid item xs>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {currentUser?.displayName || 'User'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }} gutterBottom>
                  {currentUser?.email}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip 
                    icon={<SchoolIcon />} 
                    label={`Level ${calculateUserLevel(stats)}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                  />
                  <Chip 
                    icon={<FireIcon />} 
                    label={`${stats.currentStreak} Day Streak`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                  />
                  <Chip 
                    icon={<TrophyIcon />} 
                    label={`${achievements.length} Achievements`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                  />
                </Stack>
              </Box>
              
              <Box>
                <IconButton
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  sx={{ color: 'white' }}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                  PaperProps={{
                    sx: { minWidth: 200 }
                  }}
                >
                  <MenuItem onClick={() => { setShowNotificationSettings(true); setMenuAnchor(null); }}>
                    <ListItemIcon><NotificationsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Notification Settings</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => { setShowLanguageSettings(true); setMenuAnchor(null); }}>
                    <ListItemIcon><LanguageIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Language Settings</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => { setShowThemeSettings(true); setMenuAnchor(null); }}>
                    <ListItemIcon><PaletteIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Theme Settings</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => { setShowSecuritySettings(true); setMenuAnchor(null); }}>
                    <ListItemIcon><SecurityIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Security Settings</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => { setShowExportDialog(true); setMenuAnchor(null); }}>
                    <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Export Data</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => { setShowShareDialog(true); setMenuAnchor(null); }}>
                    <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Share Profile</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => { /* Handle logout */ setMenuAnchor(null); }}>
                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Quick Stats with enhanced cards */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Words Learned</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.totalWords}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.masteredWords / stats.totalWords) * 100} 
                    sx={{ 
                      height: 4,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white'
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
                    {stats.masteredWords} mastered ({Math.round((stats.masteredWords / stats.totalWords) * 100)}%)
                  </Typography>
                </Box>
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
                  {stats.currentStreak}
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
                  {stats.totalWords}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  total words
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StarIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Average Mastery</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.averageMastery}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  average
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Learning Insights Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Learning Insights
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Daily Activity
              </Typography>
              <ResponsiveContainer>
                <LineChart data={generateChartData(progress)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <>
                            <RechartsTooltip />
                            <Line 
                              type="monotone" 
                              dataKey="words" 
                              stroke={theme.palette.primary.main} 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </>
                        );
                      }
                      return null;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={generateMasteryData(progress)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="mastery" 
                    stroke={theme.palette.secondary.main} 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Section */}
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

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Account Information */}
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
                      {currentUser?.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Member Since
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {new Date(currentUser?.metadata.creationTime || '').toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Last Sign In
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {new Date(currentUser?.metadata.lastSignInTime || '').toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Recent Achievements */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Achievements
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {achievements.slice(0, 3).map((achievement) => (
                  <Box key={achievement.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrophyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="subtitle1">
                        {achievement.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {achievement.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <ProgressSummary variant="detailed" showCharts={true} />
            
            {/* Additional Profile-specific Progress Content */}
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Learning Goals
                  </Typography>
                  <LearningGoals />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Achievements
                  </Typography>
                  <AchievementList limit={5} />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
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

const generateChartData = (progress: ProgressData) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => {
    const wordsReviewedOnDate = Object.values(progress.words).filter(p => {
      if (!p.lastAttempted) return false;
      const attemptDate = new Date(p.lastAttempted);
      return !isNaN(attemptDate.getTime()) && 
             attemptDate.toISOString().split('T')[0] === date;
    });

    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      words: wordsReviewedOnDate.length,
      newWords: wordsReviewedOnDate.filter(w => w.reviewCount === 1).length,
      reviews: wordsReviewedOnDate.filter(w => w.reviewCount > 1).length
    };
  });
};

const calculateUserLevel = (stats: Pick<UserStats, 'totalWords' | 'currentStreak' | 'averageMastery'>): number => {
  const baseLevel = Math.floor(stats.totalWords / 100);
  const streakBonus = Math.floor(stats.currentStreak / 7);
  const masteryBonus = Math.floor(stats.averageMastery / 20);
  const totalLevel = Math.max(1, baseLevel + streakBonus + masteryBonus);
  
  // Cap the maximum level at 100
  return Math.min(100, totalLevel);
};

const generateMasteryData = (progress: ProgressData) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => {
    const wordsReviewedOnDate = Object.values(progress.words).filter(p => {
      if (!p.lastAttempted) return false;
      const attemptDate = new Date(p.lastAttempted);
      return !isNaN(attemptDate.getTime()) && 
             attemptDate.toISOString().split('T')[0] === date;
    });

    const averageMastery = wordsReviewedOnDate.length > 0
      ? wordsReviewedOnDate.reduce((sum, word) => sum + (word.masteryLevel || 0), 0) / wordsReviewedOnDate.length
      : 0;

    const accuracy = wordsReviewedOnDate.length > 0
      ? wordsReviewedOnDate.reduce((sum, word) => 
          sum + (word.attempts > 0 ? word.correct / word.attempts : 0), 0) / wordsReviewedOnDate.length
      : 0;

    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      mastery: Math.round(averageMastery * 100),
      accuracy: Math.round(accuracy * 100)
    };
  });
};

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export default ProfilePage; 