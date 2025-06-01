import React from 'react';
import { Box, Typography, Paper, Grid, LinearProgress, Divider } from '@mui/material';
import { 
  BarChart as BarChartIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useProgress } from '../../context/ProgressContext';
import LearningProgressChart from './LearningProgressChart';
import StudySessionAnalytics from './StudySessionAnalytics';
import CategoryPerformanceMetrics from './CategoryPerformanceMetrics';
import LearningEfficiencyAnalysis from './LearningEfficiencyAnalysis';
import PersonalizedInsights from './PersonalizedInsights';
import LearningPath from './LearningPath';

const StatisticsDashboard: React.FC = () => {
  const { progress } = useProgress();

  // Calculate statistics
  const totalStudyTime = progress.statistics?.totalStudyTime || 0;
  const currentStreak = progress.statistics?.currentStreak || 0;
  const longestStreak = progress.statistics?.longestStreak || 0;
  const averageMastery = progress.statistics?.averageMastery || 0;
  const totalWords = Object.keys(progress.words || {}).length;
  const masteredWords = Object.values(progress.words || {}).filter((word: any) => word.mastery >= 0.8).length;
  const learningWords = Object.values(progress.words || {}).filter((word: any) => word.mastery > 0 && word.mastery < 0.8).length;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    description?: string;
  }> = ({ title, value, icon, color = 'primary.main', description }) => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ color, mr: 1 }}>{icon}</Box>
        <Typography variant="subtitle1" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ color, mb: 0.5 }}>
        {value}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Learning Statistics
      </Typography>
      
      <Grid container spacing={3}>
        {/* Learning Path */}
        <Grid item xs={12}>
          <LearningPath />
        </Grid>

        {/* Overview Stats */}
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Study Time"
            value={formatTime(totalStudyTime)}
            icon={<TimeIcon />}
            color="info.main"
            description="Cumulative time spent learning"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Current Streak"
            value={`${currentStreak} days`}
            icon={<TrendingUpIcon />}
            color="success.main"
            description="Consecutive days of learning"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Longest Streak"
            value={`${longestStreak} days`}
            icon={<TrophyIcon />}
            color="warning.main"
            description="Best streak achieved"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Average Mastery"
            value={`${Math.round(averageMastery * 100)}%`}
            icon={<SchoolIcon />}
            color="secondary.main"
            description="Overall word mastery"
          />
        </Grid>

        {/* Learning Progress Chart */}
        <Grid item xs={12}>
          <LearningProgressChart />
        </Grid>

        {/* Study Session Analytics */}
        <Grid item xs={12} md={6}>
          <StudySessionAnalytics />
        </Grid>

        {/* Category Performance Metrics */}
        <Grid item xs={12} md={6}>
          <CategoryPerformanceMetrics />
        </Grid>

        {/* Learning Efficiency Analysis */}
        <Grid item xs={12} md={6}>
          <LearningEfficiencyAnalysis />
        </Grid>

        {/* Personalized Insights */}
        <Grid item xs={12} md={6}>
          <PersonalizedInsights />
        </Grid>

        {/* Word Mastery Progress */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BarChartIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Word Mastery Distribution
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Mastered Words ({Math.round((masteredWords / totalWords) * 100)}%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(masteredWords / totalWords) * 100}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {masteredWords} out of {totalWords} words
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Words in Progress ({Math.round((learningWords / totalWords) * 100)}%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(learningWords / totalWords) * 100}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {learningWords} words currently being learned
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Not Started ({Math.round(((totalWords - masteredWords - learningWords) / totalWords) * 100)}%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={((totalWords - masteredWords - learningWords) / totalWords) * 100}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {totalWords - masteredWords - learningWords} words not started yet
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Coming Soon Section */}
        <Grid item xs={12}>
          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Advanced learning pattern analysis
              <br />
              • Custom study plan recommendations
              <br />
              • Integration with external learning resources
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatisticsDashboard; 