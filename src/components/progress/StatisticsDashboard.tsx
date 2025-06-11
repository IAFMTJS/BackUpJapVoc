import React, { useMemo } from 'react';
import { useProgress } from '../../context/ProgressContext';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  LocalFireDepartment as FireIcon,
  Quiz as QuizIcon,
  Book as BookIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';

const StatisticsDashboard: React.FC = () => {
  const { progress } = useProgress();
  const { statistics } = progress || { statistics: {} };

  // Safety check for loading state
  if (!progress) {
    return (
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Loading progress data...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  const {
    words,
    sections
  } = progress;

  // Calculate comprehensive statistics
  const totalWords = Object.keys(words).length;
  const masteredWords = Object.values(words).filter(w => w.masteryLevel >= 4).length;
  const inProgressWords = Object.values(words).filter(w => w.masteryLevel > 0 && w.masteryLevel < 4).length;
  const notStartedWords = totalWords - masteredWords - inProgressWords;

  const totalStudyTime = statistics.totalStudyTime || 0;
  const totalQuizzes = statistics.totalQuizzes || 0;
  const averageQuizScore = statistics.averageQuizScore || 0;
  const lessonsCompleted = statistics.lessonsCompleted || 0;
  const practiceSessions = statistics.practiceSessions || 0;
  const srsReviews = statistics.srsReviews || 0;
  const achievements = statistics.achievements || [];
  const totalPoints = statistics.totalPoints || 0;
  const currentStreak = statistics.currentStreak || 0;
  const longestStreak = statistics.longestStreak || 0;

  const masteryRate = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;
  const studyTimeHours = Math.round(totalStudyTime / 60);
  const averageAccuracy = averageQuizScore * 100;

  const recentActivity = [
    ...(statistics.quizHistory || []).slice(-3).map(q => ({ type: 'Quiz', date: q.timestamp, score: q.score })),
    ...(statistics.lessonHistory || []).slice(-3).map(l => ({ type: 'Lesson', date: l.timestamp, score: l.exercisesCompleted / l.totalExercises })),
    ...(statistics.practiceHistory || []).slice(-3).map(p => ({ type: 'Practice', date: p.timestamp, score: p.accuracy }))
  ].sort((a, b) => b.date - a.date).slice(0, 5);

  // Helper function to get section colors
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

  // Calculate section progress
  const sectionProgress = useMemo(() => {
    const sections = ['hiragana', 'katakana', 'kanji', 'dictionary', 'mood', 'culture', 'trivia', 'anime'] as const;
    return sections.map(section => {
      // Safety check to ensure progress and progress.sections exist
      const sectionData = progress?.sections?.[section];
      if (!sectionData) {
        console.warn(`[StatisticsDashboard] Section ${section} is undefined, using default values`);
        return {
          name: section.charAt(0).toUpperCase() + section.slice(1),
          section,
          totalItems: 0,
          masteredItems: 0,
          inProgressItems: 0,
          notStartedItems: 0,
          percentComplete: 0,
          averageMastery: 0,
          lastStudied: 0,
          streak: 0,
          color: getSectionColor(section)
        };
      }

      const totalItems = sectionData.totalItems || 0;
      const masteredItems = sectionData.masteredItems || 0;
      const inProgressItems = sectionData.inProgressItems || 0;
      const notStartedItems = sectionData.notStartedItems || 0;
      const averageMastery = sectionData.averageMastery || 0;
      const lastStudied = sectionData.lastStudied || 0;
      const streak = sectionData.streak || 0;

      return {
        name: section.charAt(0).toUpperCase() + section.slice(1),
        section,
        totalItems,
        masteredItems,
        inProgressItems,
        notStartedItems,
        percentComplete: totalItems > 0 ? Math.round((masteredItems / totalItems) * 100) : 0,
        averageMastery: Math.round(averageMastery * 20), // Convert to percentage
        lastStudied,
        streak,
        color: getSectionColor(section)
      };
    });
  }, [progress?.sections]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Learning Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Overall Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Overall Progress</Typography>
                <TrendingUpIcon color="primary" />
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mastery Rate
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={masteryRate} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {masteryRate.toFixed(1)}% ({masteredWords}/{totalWords} words)
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="h6" color="success.main">
                    {masteredWords}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mastered
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" color="warning.main">
                    {inProgressWords}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    In Progress
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" color="text.secondary">
                    {notStartedWords}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Not Started
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Study Streak */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Study Streak</Typography>
                <FireIcon color="error" />
              </Box>
              
              <Box textAlign="center" mb={2}>
                <Typography variant="h3" color="error.main" sx={{ fontWeight: 'bold' }}>
                  {currentStreak}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Streak (days)
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Longest streak: {longestStreak} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Activity Summary</Typography>
                <SchoolIcon color="primary" />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {totalQuizzes}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Quizzes Taken
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {lessonsCompleted}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Lessons Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {practiceSessions}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Practice Sessions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {srsReviews}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SRS Reviews
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Performance</Typography>
                <StarIcon color="warning" />
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Average Quiz Score
                </Typography>
                <Typography variant="h6" color="primary">
                  {averageAccuracy.toFixed(1)}%
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Study Time
                </Typography>
                <Typography variant="h6" color="primary">
                  {studyTimeHours} hours
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Points
                </Typography>
                <Typography variant="h6" color="primary">
                  {totalPoints} pts
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Section Progress Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Learning Progress</Typography>
                <SchoolIcon color="primary" />
              </Box>
              
              <Grid container spacing={2}>
                {sectionProgress.map((section) => (
                  <Grid item xs={12} sm={6} md={3} key={section.section}>
                    <Box 
                      p={2} 
                      border={1} 
                      borderColor="divider" 
                      borderRadius={1}
                      sx={{ 
                        backgroundColor: `${section.color}10`,
                        borderLeft: `4px solid ${section.color}`
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="subtitle2" sx={{ color: section.color, fontWeight: 'bold' }}>
                          {section.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {section.percentComplete}%
                        </Typography>
                      </Box>
                      
                      <Box mb={1}>
                        <LinearProgress 
                          variant="determinate" 
                          value={section.percentComplete} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: `${section.color}30`,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: section.color
                            }
                          }}
                        />
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {section.masteredItems}/{section.totalItems}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {section.averageMastery}% mastery
                        </Typography>
                      </Box>
                      
                      {section.streak > 0 && (
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                          <FireIcon fontSize="small" color="error" />
                          <Typography variant="caption" color="text.secondary">
                            {section.streak} day streak
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Recent Activity</Typography>
                <AccessTimeIcon color="primary" />
              </Box>
              
              {recentActivity.length > 0 ? (
                <Box>
                  {recentActivity.map((activity, index) => (
                    <Box key={index} display="flex" alignItems="center" justifyContent="space-between" py={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {activity.type === 'Quiz' && <QuizIcon fontSize="small" color="primary" />}
                        {activity.type === 'Lesson' && <BookIcon fontSize="small" color="success" />}
                        {activity.type === 'Practice' && <EditIcon fontSize="small" color="warning" />}
                        <Typography variant="body2">
                          {activity.type}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={`${(activity.score * 100).toFixed(0)}%`}
                          size="small"
                          color={activity.score >= 0.8 ? 'success' : activity.score >= 0.6 ? 'warning' : 'error'}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(activity.date)} ago
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent activity. Start learning to see your progress here!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements */}
        {achievements.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">Recent Achievements</Typography>
                  <EmojiEventsIcon color="warning" />
                </Box>
                
                <Grid container spacing={2}>
                  {achievements.slice(-3).map((achievement) => (
                    <Grid item xs={12} md={4} key={achievement.id}>
                      <Box textAlign="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                        <Typography variant="h6" color="warning.main">
                          {achievement.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {achievement.description}
                        </Typography>
                        <Chip label={`+${achievement.points} pts`} size="small" color="warning" />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default StatisticsDashboard; 