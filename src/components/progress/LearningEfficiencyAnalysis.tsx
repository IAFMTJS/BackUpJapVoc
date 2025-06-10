import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  BarChart,
  Bar
} from 'recharts';
import { useProgress } from '../../context/ProgressContext';
import { 
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface EfficiencyMetrics {
  averageLearningSpeed: number;
  retentionRate: number;
  optimalStudyTime: string;
  efficiencyScore: number;
  learningCurve: { session: number; wordsLearned: number; accuracy: number }[];
  wordDifficultyImpact: { difficulty: string; learningTime: number; retention: number; count: number }[];
  sessionEfficiency: { date: string; wordsPerHour: number; focusScore: number }[];
}

const LearningEfficiencyAnalysis: React.FC = () => {
  const theme = useTheme();
  const { progress } = useProgress();

  const metrics = useMemo(() => {
    const sessions = progress.statistics?.studySessions || [];
    const words = progress.words || {};

    // Calculate basic metrics
    const totalStudyTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalWordsLearned = sessions.reduce((sum, session) => sum + (session.wordsLearned || 0), 0);
    const masteredWords = Object.values(words).filter((word: any) => word.mastery >= 0.8).length;
    const totalWords = Object.keys(words).length;

    // Learning speed (words per hour)
    const averageLearningSpeed = totalStudyTime > 0 ? (totalWordsLearned / (totalStudyTime / 60)) : 0;

    // Retention rate (percentage of mastered words)
    const retentionRate = totalWords > 0 ? masteredWords / totalWords : 0;

    // Find optimal study time based on session accuracy
    const timeSlotPerformance = sessions.reduce((acc: any, session) => {
      const hour = new Date(session.timestamp).getHours();
      const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
      if (!acc[timeSlot]) {
        acc[timeSlot] = { total: 0, count: 0 };
      }
      acc[timeSlot].total += session.accuracy || 0;
      acc[timeSlot].count++;
      return acc;
    }, {});

    const optimalStudyTime = Object.entries(timeSlotPerformance)
      .sort(([, a]: any, [, b]: any) => {
        const aScore = a && a.count > 0 ? (a.total / a.count) : 0;
        const bScore = b && b.count > 0 ? (b.total / b.count) : 0;
        return bScore - aScore;
      })[0]?.[0] || 'No data';

    // Calculate efficiency score (weighted average of learning speed, retention, and consistency)
    const consistencyScore = sessions.length > 0 ? Math.min(sessions.length / 30, 1) : 0;
    const efficiencyScore = Math.round(
      (averageLearningSpeed * 0.4 + retentionRate * 0.4 + consistencyScore * 0.2) * 100
    );

    // Generate learning curve data
    const learningCurve = sessions.map((session, index) => ({
      session: index + 1,
      wordsLearned: session.wordsLearned || 0,
      accuracy: session.accuracy || 0
    }));

    // Analyze word difficulty impact
    const wordDifficultyImpact = [
      { difficulty: 'Easy', learningTime: 2, retention: 0.9, count: 0 },
      { difficulty: 'Medium', learningTime: 4, retention: 0.7, count: 0 },
      { difficulty: 'Hard', learningTime: 6, retention: 0.5, count: 0 }
    ];

    Object.values(words).forEach((word: any) => {
      const mastery = word.mastery || 0;
      const difficulty = mastery < 0.4 ? 'Hard' : mastery < 0.7 ? 'Medium' : 'Easy';
      const index = wordDifficultyImpact.findIndex(d => d.difficulty === difficulty);
      if (index !== -1) {
        wordDifficultyImpact[index].count++;
      }
    });

    // Calculate session efficiency metrics
    const sessionEfficiency = sessions.map(session => ({
      date: new Date(session.timestamp).toLocaleDateString(),
      wordsPerHour: session.duration ? (session.wordsLearned || 0) / (session.duration / 60) : 0,
      focusScore: session.accuracy || 0
    }));

    return {
      averageLearningSpeed,
      retentionRate,
      optimalStudyTime,
      efficiencyScore,
      learningCurve,
      wordDifficultyImpact,
      sessionEfficiency
    } as EfficiencyMetrics;
  }, [progress.statistics?.studySessions, progress.words]);

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
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Learning Efficiency Analysis
      </Typography>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Learning Speed"
            value={`${Math.round(metrics.averageLearningSpeed)} words/hour`}
            icon={<SpeedIcon />}
            color="primary.main"
            description="Average words learned per hour"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Retention Rate"
            value={`${Math.round(metrics.retentionRate * 100)}%`}
            icon={<PsychologyIcon />}
            color="success.main"
            description="Percentage of mastered words"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Optimal Study Time"
            value={metrics.optimalStudyTime}
            icon={<TimerIcon />}
            color="info.main"
            description="Time of day with best performance"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Efficiency Score"
            value={`${metrics.efficiencyScore}/100`}
            icon={<TrendingUpIcon />}
            color="warning.main"
            description="Overall learning efficiency"
          />
        </Grid>
      </Grid>

      {/* Learning Progress Over Sessions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Learning Progress Over Sessions
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.learningCurve}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                  <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="wordsLearned"
                    name="Words Learned"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="accuracy"
                    name="Accuracy"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Word Difficulty Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Word Difficulty Impact
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="learningTime"
                    name="Learning Time"
                    unit="min"
                  />
                  <YAxis
                    type="number"
                    dataKey="retention"
                    name="Retention Rate"
                    unit="%"
                    tickFormatter={(value) => `${Math.round(value * 100)}%`}
                  />
                  <ZAxis
                    type="number"
                    dataKey="count"
                    range={[50, 400]}
                    name="Word Count"
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'Retention Rate') return `${Math.round(value * 100)}%`;
                      if (name === 'Learning Time') return `${value} min`;
                      return value;
                    }}
                  />
                  {metrics.wordDifficultyImpact.map((entry, index) => (
                    <Scatter
                      key={entry.difficulty}
                      name={entry.difficulty}
                      data={[entry]}
                      fill={theme.palette.primary.main}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Daily Session Efficiency */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Daily Session Efficiency
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.sessionEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                  <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="wordsPerHour"
                    name="Words per Hour"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="focusScore"
                    name="Focus Score"
                    fill={theme.palette.secondary.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LearningEfficiencyAnalysis; 