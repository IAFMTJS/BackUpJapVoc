import React, { useMemo } from 'react';
import { useProgress } from '../../context/ProgressContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const UnifiedProgressOverview: React.FC = () => {
  const { progress } = useProgress();

  // Calculate comprehensive progress metrics
  const progressMetrics = useMemo(() => {
    if (!progress) return null;

    const sections = ['hiragana', 'katakana', 'kanji', 'dictionary', 'mood', 'culture', 'trivia', 'anime'] as const;
    
    // Calculate overall progress
    let totalItems = 0;
    let totalMastered = 0;
    let totalInProgress = 0;
    let totalNotStarted = 0;
    let overallAverageMastery = 0;

    sections.forEach(section => {
      const sectionData = progress.sections[section];
      if (sectionData) {
        totalItems += sectionData.totalItems || 0;
        totalMastered += sectionData.masteredItems || 0;
        totalInProgress += sectionData.inProgressItems || 0;
        totalNotStarted += sectionData.notStartedItems || 0;
        overallAverageMastery += sectionData.averageMastery || 0;
      }
    });

    const sectionCount = sections.length;
    overallAverageMastery = overallAverageMastery / sectionCount;

    // Calculate recent activity
    const recentActivity = sections
      .map(section => ({
        section,
        lastStudied: progress.sections[section]?.lastStudied || 0,
        streak: progress.sections[section]?.streak || 0
      }))
      .filter(activity => activity.lastStudied > 0)
      .sort((a, b) => b.lastStudied - a.lastStudied)
      .slice(0, 5);

    // Calculate study statistics
    const stats = progress.statistics;
    const totalStudyTime = stats.totalStudyTime || 0;
    const totalQuizzes = stats.totalQuizzes || 0;
    const lessonsCompleted = stats.lessonsCompleted || 0;
    const practiceSessions = stats.practiceSessions || 0;
    const currentStreak = stats.currentStreak || 0;

    return {
      totalItems,
      totalMastered,
      totalInProgress,
      totalNotStarted,
      overallAverageMastery,
      recentActivity,
      totalStudyTime,
      totalQuizzes,
      lessonsCompleted,
      practiceSessions,
      currentStreak,
      sections: sections.map(section => ({
        name: section.charAt(0).toUpperCase() + section.slice(1),
        section,
        data: progress.sections[section] || {
          totalItems: 0,
          masteredItems: 0,
          inProgressItems: 0,
          notStartedItems: 0,
          lastStudied: 0,
          streak: 0,
          averageMastery: 0
        }
      }))
    };
  }, [progress]);

  if (!progressMetrics) {
    return (
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Loading progress data...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  const getSectionColor = (section: string) => {
    const colors = {
      hiragana: '#4CAF50',
      katakana: '#2196F3',
      kanji: '#FF9800',
      dictionary: '#9C27B0',
      mood: '#E91E63',
      culture: '#795548',
      trivia: '#607D8B',
      anime: '#F44336'
    };
    return colors[section as keyof typeof colors] || '#757575';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon color="primary" />
        Learning Progress Overview
      </Typography>

      {/* Overall Progress Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Overall Progress
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {progressMetrics.totalMastered}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Items Mastered
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="secondary">
                  {progressMetrics.totalInProgress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {Math.round(progressMetrics.overallAverageMastery * 20)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Mastery
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {progressMetrics.currentStreak}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Day Streak
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Section Progress */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {progressMetrics.sections.map(({ name, section, data }) => (
          <Grid item xs={12} sm={6} md={3} key={section}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" sx={{ color: getSectionColor(section) }}>
                    {name}
                  </Typography>
                  <Avatar sx={{ bgcolor: getSectionColor(section), width: 32, height: 32 }}>
                    <CheckCircleIcon fontSize="small" />
                  </Avatar>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progress
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={data.totalItems > 0 ? (data.masteredItems / data.totalItems) * 100 : 0}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getSectionColor(section)
                      }
                    }}
                  />
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">
                    {data.masteredItems}/{data.totalItems}
                  </Typography>
                  <Chip 
                    label={`${data.streak} day streak`}
                    size="small"
                    color={data.streak > 0 ? "success" : "default"}
                  />
                </Box>

                {data.lastStudied > 0 && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Last studied: {formatDate(data.lastStudied)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Study Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                Study Statistics
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <TimerIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Total Study Time" 
                    secondary={formatTime(progressMetrics.totalStudyTime)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <SchoolIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Quizzes Completed" 
                    secondary={progressMetrics.totalQuizzes}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Lessons Completed" 
                    secondary={progressMetrics.lessonsCompleted}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <StarIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Practice Sessions" 
                    secondary={progressMetrics.practiceSessions}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="primary" />
                Recent Activity
              </Typography>
              {progressMetrics.recentActivity.length > 0 ? (
                <List dense>
                  {progressMetrics.recentActivity.map((activity, index) => (
                    <React.Fragment key={activity.section}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getSectionColor(activity.section), width: 32, height: 32 }}>
                            {activity.section.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={activity.section.charAt(0).toUpperCase() + activity.section.slice(1)}
                          secondary={`${formatDate(activity.lastStudied)} • ${activity.streak} day streak`}
                        />
                      </ListItem>
                      {index < progressMetrics.recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent activity. Start learning to see your progress!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UnifiedProgressOverview; 