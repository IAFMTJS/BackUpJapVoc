import React, { useEffect, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import StatisticsDashboard from '../components/progress/StatisticsDashboard';
import { DailyProgressChart } from '../components/progress/DailyProgressChart';
import { StudyEfficiency } from '../components/progress/StudyEfficiency';
import ProgressTimeline from '../components/progress/ProgressTimeline';
import SectionProgress from '../components/progress/SectionProgress';
import AchievementsList from '../components/progress/AchievementsList';
import { StudyHistory } from '../components/progress/StudyHistory';
import { MasteryDistribution } from '../components/progress/MasteryDistribution';
import LearningPath from '../components/progress/LearningPath';
import { Achievements } from '../components/progress/Achievements';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`progress-tabpanel-${index}`}
      aria-labelledby={`progress-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProgressPage: React.FC = () => {
  const { progress, isLoading, error, isSyncing, lastSyncTime } = useProgress();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add timeout for loading state
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 seconds timeout
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  if (isLoading && !loadingTimeout) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your progress...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This may take a moment
        </Typography>
      </Box>
    );
  }

  if (loadingTimeout) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Loading is taking longer than expected. Please check your connection and try refreshing the page.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Refresh Page
        </Button>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Container>
    );
  }

  // Ensure progress data exists
  if (!progress || !progress.statistics) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No progress data available. Start learning to see your progress here!
        </Alert>
      </Container>
    );
  }

  const {
    statistics,
    sections,
    preferences
  } = progress;

  const totalWords = Object.keys(progress.words).length;
  const masteredWords = Object.values(progress.words).filter(w => w.mastery >= 0.8).length;
  const inProgressWords = Object.values(progress.words).filter(w => w.mastery > 0 && w.mastery < 0.8).length;
  const notStartedWords = totalWords - masteredWords - inProgressWords;

  const totalStudyTime = statistics.totalStudyTime || 0;
  const averageStudyTimePerDay = totalStudyTime / ((statistics.studySessions?.length || 1));
  const studyEfficiency = statistics.studyEfficiency || 0;
  const averageAccuracy = statistics.averageAccuracy || 0;

  const recentSessions = (statistics.studySessions || [])
    .slice(-5)
    .reverse()
    .map(session => ({
      ...session,
      date: new Date(session.timestamp),
      duration: session.duration / 60, // Convert to minutes
      masteryGained: session.averageMastery
    }));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Status Alerts */}
      <Box sx={{ mb: 3 }}>
        {!currentUser && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You are currently using the app without an account. Sign in to sync your progress across devices.
          </Alert>
        )}

        {isSyncing && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Syncing progress...
          </Alert>
        )}

        {lastSyncTime && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Last synced: {formatDistanceToNow(lastSyncTime)} ago
          </Typography>
        )}
      </Box>

      {/* Main Content */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "fullWidth" : "standard"}
          centered={!isMobile}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}
        >
          <Tab label="Overview" />
          <Tab label="Statistics" />
          <Tab label="Charts" />
          <Tab label="Sections" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={selectedTab} index={0}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Enhanced Current Progress Overview */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: 'background.default',
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUpIcon sx={{ fontSize: 28, mr: 1.5, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Your Learning Progress
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 2,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}>
                    <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {masteredWords}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                      Words Mastered
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(masteredWords / (totalWords || 1)) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {Math.round((masteredWords / (totalWords || 1)) * 100)}% of total
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 2,
                    border: '1px solid',
                    borderColor: 'secondary.main',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}>
                    <Typography variant="h3" color="secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {inProgressWords}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                      In Progress
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(inProgressWords / (totalWords || 1)) * 100}
                      color="secondary"
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {Math.round((inProgressWords / (totalWords || 1)) * 100)}% of total
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 2,
                    border: '1px solid',
                    borderColor: 'warning.main',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <FireIcon sx={{ fontSize: 24, mr: 1, color: 'warning.main' }} />
                      <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                        {statistics.currentStreak}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                      Day Streak
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Best: {statistics.longestStreak} days
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 2,
                    border: '1px solid',
                    borderColor: 'success.main',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}>
                    <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {Math.round(studyEfficiency * 100)}%
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                      Study Efficiency
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={studyEfficiency * 100}
                      color="success"
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {Math.round(averageAccuracy * 100)}% accuracy
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Section Progress Overview */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: 'background.default',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SchoolIcon sx={{ fontSize: 28, mr: 1.5, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Section Progress
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {Object.entries(sections || {}).map(([section, data]) => {
                  const progressPercentage = data.totalItems > 0 ? (data.masteredItems / data.totalItems) * 100 : 0;
                  const getSectionColor = (section: string) => {
                    switch (section) {
                      case 'hiragana': return '#4CAF50';
                      case 'katakana': return '#2196F3';
                      case 'kanji': return '#FF9800';
                      case 'dictionary': return '#9C27B0';
                      case 'mood': return '#F44336';
                      case 'culture': return '#795548';
                      case 'trivia': return '#607D8B';
                      case 'anime': return '#E91E63';
                      default: return '#757575';
                    }
                  };
                  
                  return (
                    <Grid item xs={12} sm={6} md={3} key={section}>
                      <Paper 
                        elevation={1}
                        sx={{ 
                          p: 2, 
                          height: '100%',
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3,
                            border: `2px solid ${getSectionColor(section)}`
                          }
                        }}
                        onClick={() => {
                          // Navigate to section
                          window.location.href = `/${section}`;
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%', 
                              bgcolor: getSectionColor(section),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2
                            }}
                          >
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                              {section.charAt(0).toUpperCase()}
                            </Typography>
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {data.masteredItems} / {data.totalItems} mastered
                        </Typography>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={progressPercentage}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            mb: 1,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getSectionColor(section)
                            }
                          }}
                        />
                        
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(progressPercentage)}% complete
                        </Typography>
                        
                        {data.inProgressItems > 0 && (
                          <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 0.5 }}>
                            {data.inProgressItems} in progress
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>

            {/* Recent Activity */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: 'background.default',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccessTimeIcon sx={{ fontSize: 28, mr: 1.5, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Recent Activity
                </Typography>
              </Box>
              
              <Timeline position="alternate">
                {recentSessions.slice(0, 5).map((session, index) => (
                  <TimelineItem key={index}>
                    <TimelineSeparator>
                      <TimelineDot color="primary" />
                      {index < recentSessions.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Paper 
                        elevation={1}
                        sx={{ 
                          p: 2, 
                          bgcolor: 'background.paper',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {session.type === 'quiz' ? 'Quiz Completed' : 
                           session.type === 'lesson' ? 'Lesson Completed' :
                           session.type === 'practice' ? 'Practice Session' : 'Study Session'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {session.wordsLearned} words learned
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(session.timestamp)} ago
                        </Typography>
                        {session.accuracy && (
                          <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                            {Math.round(session.accuracy * 100)}% accuracy
                          </Typography>
                        )}
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
              
              {recentSessions.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No recent activity. Start learning to see your progress here!
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Quick Actions */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: 'background.default',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <StarIcon sx={{ fontSize: 28, mr: 1.5, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Quick Actions
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ 
                      py: 2, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
                      }
                    }}
                    onClick={() => window.location.href = '/quiz'}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                        Take Quiz
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Test your knowledge
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ 
                      py: 2, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)'
                      }
                    }}
                    onClick={() => window.location.href = '/practice'}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                        Practice
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Improve your skills
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ 
                      py: 2, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #F57C00 0%, #EF6C00 100%)'
                      }
                    }}
                    onClick={() => window.location.href = '/dictionary'}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                        Dictionary
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Explore words
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ 
                      py: 2, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 100%)'
                      }
                    }}
                    onClick={() => window.location.href = '/learning-path'}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                        Learning Path
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Follow your journey
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Learning Path */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: 'background.default',
                borderRadius: 2
              }}
            >
              <Typography variant="h5" gutterBottom>
                Learning Path
              </Typography>
              <LearningPath />
            </Paper>

            {/* Achievements */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                bgcolor: 'background.default',
                borderRadius: 2
              }}
            >
              <Typography variant="h5" gutterBottom>
                Achievements
              </Typography>
              <Achievements />
            </Paper>
          </Box>
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
              {/* Statistics Dashboard */}
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    bgcolor: 'background.default',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    Statistics Dashboard
                  </Typography>
                  <StatisticsDashboard />
                </Paper>
              </Grid>

              {/* Study History */}
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    bgcolor: 'background.default',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    Study History
                  </Typography>
                  <StudyHistory sessions={recentSessions} />
                </Paper>
              </Grid>

              {/* Mastery Distribution */}
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    bgcolor: 'background.default',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    Mastery Distribution
                  </Typography>
                  <MasteryDistribution
                    mastered={masteredWords}
                    inProgress={inProgressWords}
                    notStarted={notStartedWords}
                    total={totalWords}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Charts Tab */}
        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
              {/* Daily Progress Chart */}
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 3,
                    bgcolor: 'background.default',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    Daily Progress
                  </Typography>
                  <DailyProgressChart
                    data={statistics.dailyProgress || {}}
                    timeRange={selectedTimeRange}
                    onTimeRangeChange={setSelectedTimeRange}
                  />
                </Paper>
              </Grid>

              {/* Study Efficiency */}
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3,
                    bgcolor: 'background.default',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    Study Efficiency
                  </Typography>
                  <StudyEfficiency
                    efficiency={studyEfficiency || 0}
                    averageAccuracy={averageAccuracy || 0}
                    averageStudyTime={averageStudyTimePerDay || 0}
                    totalStudyTime={totalStudyTime || 0}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Sections Tab */}
        <TabPanel value={selectedTab} index={3}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3,
                bgcolor: 'background.default',
                borderRadius: 2
              }}
            >
              <Typography variant="h5" gutterBottom>
                Section Progress
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(sections || {}).map(([section, data]) => (
                  <Grid item xs={12} sm={6} md={4} key={section}>
                    <Paper 
                      elevation={1}
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2
                        }
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mastered: {data?.masteredItems || 0} / {data?.totalItems || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Progress: {data?.inProgressItems || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Mastery: {Math.round((data?.averageMastery || 0) * 100)}%
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProgressPage; 