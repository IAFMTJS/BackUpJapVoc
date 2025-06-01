import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, useTheme } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useProgress } from '../../context/ProgressContext';
import { AccessTime as TimeIcon, CalendarToday as CalendarIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';

interface SessionStats {
  averageDuration: number;
  totalSessions: number;
  bestTimeOfDay: string;
  mostProductiveDay: string;
  averageWordsPerSession: number;
  sessionFrequency: { [key: string]: number };
  timeOfDayDistribution: { name: string; value: number }[];
  dayOfWeekDistribution: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const StudySessionAnalytics: React.FC = () => {
  const theme = useTheme();
  const { progress } = useProgress();

  const stats = useMemo(() => {
    const sessions = progress.statistics?.studySessions || [];
    if (sessions.length === 0) {
      return {
        averageDuration: 0,
        totalSessions: 0,
        bestTimeOfDay: 'No data',
        mostProductiveDay: 'No data',
        averageWordsPerSession: 0,
        sessionFrequency: {},
        timeOfDayDistribution: [],
        dayOfWeekDistribution: []
      } as SessionStats;
    }

    // Calculate basic stats
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalWords = sessions.reduce((sum, session) => sum + (session.wordsLearned || 0), 0);
    const averageDuration = totalDuration / sessions.length;
    const averageWordsPerSession = totalWords / sessions.length;

    // Analyze time of day patterns
    const timeOfDayCounts = new Map<string, number>();
    const dayOfWeekCounts = new Map<string, number>();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeRanges = ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)', 'Night (0-6)'];

    sessions.forEach((session: any) => {
      const date = new Date(session.timestamp);
      const hour = date.getHours();
      const dayOfWeek = dayNames[date.getDay()];

      // Determine time of day
      let timeOfDay = '';
      if (hour >= 6 && hour < 12) timeOfDay = timeRanges[0];
      else if (hour >= 12 && hour < 18) timeOfDay = timeRanges[1];
      else if (hour >= 18 && hour < 24) timeOfDay = timeRanges[2];
      else timeOfDay = timeRanges[3];

      timeOfDayCounts.set(timeOfDay, (timeOfDayCounts.get(timeOfDay) || 0) + 1);
      dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) || 0) + 1);
    });

    // Find most productive times
    const bestTimeOfDay = Array.from(timeOfDayCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data';
    const mostProductiveDay = Array.from(dayOfWeekCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data';

    // Format data for charts
    const timeOfDayDistribution = timeRanges.map(range => ({
      name: range,
      value: timeOfDayCounts.get(range) || 0
    }));

    const dayOfWeekDistribution = dayNames.map(day => ({
      name: day,
      value: dayOfWeekCounts.get(day) || 0
    }));

    return {
      averageDuration,
      totalSessions: sessions.length,
      bestTimeOfDay,
      mostProductiveDay,
      averageWordsPerSession,
      sessionFrequency: Object.fromEntries(timeOfDayCounts),
      timeOfDayDistribution,
      dayOfWeekDistribution
    } as SessionStats;
  }, [progress.statistics?.studySessions]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, icon, color = 'primary.main' }) => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ color, mr: 1 }}>{icon}</Box>
        <Typography variant="subtitle1" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ color }}>
        {value}
      </Typography>
    </Paper>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Study Session Analytics
      </Typography>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Average Session Duration"
            value={formatDuration(stats.averageDuration)}
            icon={<TimeIcon />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Study Sessions"
            value={stats.totalSessions}
            icon={<CalendarIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Average Words per Session"
            value={Math.round(stats.averageWordsPerSession)}
            icon={<TrendingUpIcon />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Study Patterns */}
      <Grid container spacing={3}>
        {/* Time of Day Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Study Time Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Most productive time: {stats.bestTimeOfDay}
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.timeOfDayDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {stats.timeOfDayDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} sessions`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Day of Week Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Study Day Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Most productive day: {stats.mostProductiveDay}
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dayOfWeekDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value} sessions`, 'Count']} />
                  <Bar dataKey="value" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]}>
                    {stats.dayOfWeekDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StudySessionAnalytics; 