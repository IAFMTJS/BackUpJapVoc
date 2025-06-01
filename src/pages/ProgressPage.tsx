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
  Tab
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
import LearningPath from '../components/progress/LearningPath';
import { StudyHistory } from '../components/progress/StudyHistory';
import { MasteryDistribution } from '../components/progress/MasteryDistribution';
import { DailyProgressChart } from '../components/progress/DailyProgressChart';
import { StudyEfficiency } from '../components/progress/StudyEfficiency';
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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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

  const totalStudyTime = statistics.totalStudyTime;
  const averageStudyTimePerDay = totalStudyTime / (statistics.studySessions.length || 1);
  const studyEfficiency = statistics.studyEfficiency;
  const averageAccuracy = statistics.averageAccuracy;

  const recentSessions = statistics.studySessions
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
            {/* Current Progress Overview */}
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
                Current Progress
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1
                  }}>
                    <Typography variant="h4" color="primary">
                      {masteredWords}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Words Mastered
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1
                  }}>
                    <Typography variant="h4" color="secondary">
                      {inProgressWords}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      In Progress
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1
                  }}>
                    <Typography variant="h4" color="warning.main">
                      {statistics.currentStreak}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Day Streak
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1
                  }}>
                    <Typography variant="h4" color="success.main">
                      {Math.round(studyEfficiency * 100)}%
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Study Efficiency
                    </Typography>
                  </Box>
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
                    data={statistics.dailyProgress}
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
                    efficiency={studyEfficiency}
                    averageAccuracy={averageAccuracy}
                    averageStudyTime={averageStudyTimePerDay}
                    totalStudyTime={totalStudyTime}
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
                {Object.entries(sections).map(([section, data]) => (
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
                        Mastered: {data.masteredItems} / {data.totalItems}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Progress: {data.inProgressItems}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Mastery: {Math.round(data.averageMastery * 100)}%
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