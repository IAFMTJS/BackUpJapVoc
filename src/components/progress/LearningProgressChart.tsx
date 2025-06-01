import React, { useMemo } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { useProgress } from '../../context/ProgressContext';

interface DailyProgress {
  date: string;
  wordsLearned: number;
  masteryLevel: number;
  studyTime: number;
}

const LearningProgressChart: React.FC = () => {
  const theme = useTheme();
  const { progress } = useProgress();

  // Generate sample data for the last 30 days
  const chartData = useMemo(() => {
    const data: DailyProgress[] = [];
    const today = new Date();
    
    // Get study sessions from progress data
    const studySessions = progress.statistics?.studySessions || [];
    
    // Create a map of daily progress
    const dailyProgress = new Map<string, DailyProgress>();
    
    // Initialize last 30 days with zero values
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyProgress.set(dateStr, {
        date: dateStr,
        wordsLearned: 0,
        masteryLevel: 0,
        studyTime: 0
      });
    }
    
    // Fill in actual progress data
    studySessions.forEach((session: any) => {
      const dateStr = new Date(session.timestamp).toISOString().split('T')[0];
      const existing = dailyProgress.get(dateStr);
      if (existing) {
        existing.wordsLearned += session.wordsLearned || 0;
        existing.masteryLevel = Math.max(existing.masteryLevel, session.averageMastery || 0);
        existing.studyTime += session.duration || 0;
      }
    });
    
    // Convert map to array and sort by date
    return Array.from(dailyProgress.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [progress.statistics?.studySessions]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatTime = (minutes: number) => {
    return `${Math.round(minutes / 60)}h`;
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Learning Progress Over Time
      </Typography>
      
      {/* Words Learned Chart */}
      <Box sx={{ height: 300, mb: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Words Learned
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="wordsLearned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Words', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip 
              labelFormatter={formatDate}
              formatter={(value: number) => [`${value} words`, 'Words Learned']}
            />
            <Area
              type="monotone"
              dataKey="wordsLearned"
              stroke={theme.palette.primary.main}
              fillOpacity={1}
              fill="url(#wordsLearned)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      {/* Mastery Level Chart */}
      <Box sx={{ height: 300, mb: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Mastery Level
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => `${Math.round(value * 100)}%`}
              tick={{ fontSize: 12 }}
              domain={[0, 1]}
              label={{ 
                value: 'Mastery', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip 
              labelFormatter={formatDate}
              formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Mastery Level']}
            />
            <Line
              type="monotone"
              dataKey="masteryLevel"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Study Time Chart */}
      <Box sx={{ height: 300 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Study Time
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={formatTime}
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Hours', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip 
              labelFormatter={formatDate}
              formatter={(value: number) => [formatTime(value), 'Study Time']}
            />
            <Bar
              dataKey="studyTime"
              fill={theme.palette.info.main}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default LearningProgressChart; 