import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, LinearProgress, useTheme } from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
import { 
  Category as CategoryIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

interface CategoryStats {
  name: string;
  mastery: number;
  totalWords: number;
  masteredWords: number;
  averageResponseTime: number;
  accuracy: number;
  recentProgress: number;
}

interface CategoryPerformance {
  categories: CategoryStats[];
  overallMastery: number;
  fastestCategory: string;
  mostAccurateCategory: string;
  mostImprovedCategory: string;
}

const CategoryPerformanceMetrics: React.FC = () => {
  const theme = useTheme();
  const { progress } = useProgress();

  const performance = useMemo(() => {
    const words = progress.words || {};
    const sessions = progress.statistics?.studySessions || [];
    
    // Define categories (this could be made dynamic based on your word data structure)
    const categories = [
      'Basic Nouns',
      'Basic Verbs',
      'Basic Adjectives',
      'Basic Adverbs',
      'Grammar Particles',
      'Common Phrases',
      'Numbers & Time',
      'Family & People'
    ];

    // Initialize category stats
    const categoryStats = categories.map(category => ({
      name: category,
      mastery: 0,
      totalWords: 0,
      masteredWords: 0,
      averageResponseTime: 0,
      accuracy: 0,
      recentProgress: 0
    }));

    // Calculate stats for each category
    Object.entries(words).forEach(([word, data]: [string, any]) => {
      const category = data.category || 'Uncategorized';
      const categoryIndex = categories.indexOf(category);
      if (categoryIndex === -1) return;

      const stats = categoryStats[categoryIndex];
      stats.totalWords++;
      if (data.mastery >= 0.8) stats.masteredWords++;
      stats.mastery += data.mastery || 0;
      stats.averageResponseTime += data.averageResponseTime || 0;
      stats.accuracy += data.accuracy || 0;
      stats.recentProgress += data.recentProgress || 0;
    });

    // Calculate averages and find best performers
    categoryStats.forEach(stats => {
      if (stats.totalWords > 0) {
        stats.mastery = stats.mastery / stats.totalWords;
        stats.averageResponseTime = stats.averageResponseTime / stats.totalWords;
        stats.accuracy = stats.accuracy / stats.totalWords;
        stats.recentProgress = stats.recentProgress / stats.totalWords;
      }
    });

    const overallMastery = categoryStats.reduce((sum, cat) => sum + cat.mastery, 0) / categories.length;
    
    const fastestCategory = categoryStats
      .sort((a, b) => a.averageResponseTime - b.averageResponseTime)[0]?.name || 'No data';
    
    const mostAccurateCategory = categoryStats
      .sort((a, b) => b.accuracy - a.accuracy)[0]?.name || 'No data';
    
    const mostImprovedCategory = categoryStats
      .sort((a, b) => b.recentProgress - a.recentProgress)[0]?.name || 'No data';

    return {
      categories: categoryStats,
      overallMastery,
      fastestCategory,
      mostAccurateCategory,
      mostImprovedCategory
    } as CategoryPerformance;
  }, [progress.words, progress.statistics?.studySessions]);

  const formatTime = (ms: number) => {
    return `${Math.round(ms / 1000)}s`;
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
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Performance by Category
      </Typography>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Overall Mastery"
            value={`${Math.round(performance.overallMastery * 100)}%`}
            icon={<CategoryIcon />}
            color="primary.main"
            description="Average mastery across all categories"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Fastest Category"
            value={performance.fastestCategory}
            icon={<SpeedIcon />}
            color="info.main"
            description="Category with best response time"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Most Accurate"
            value={performance.mostAccurateCategory}
            icon={<TrendingUpIcon />}
            color="success.main"
            description="Category with highest accuracy"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Most Improved"
            value={performance.mostImprovedCategory}
            icon={<PsychologyIcon />}
            color="warning.main"
            description="Category with best recent progress"
          />
        </Grid>
      </Grid>

      {/* Category Performance Charts */}
      <Grid container spacing={3}>
        {/* Mastery Radar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Category Mastery Distribution
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performance.categories}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 1]} />
                  <Radar
                    name="Mastery"
                    dataKey="mastery"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Mastery']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Detailed Performance Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Detailed Category Performance
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performance.categories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                  <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="accuracy"
                    name="Accuracy"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="recentProgress"
                    name="Recent Progress"
                    fill={theme.palette.secondary.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Category Progress Bars */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Category Progress
            </Typography>
            <Grid container spacing={2}>
              {performance.categories.map((category) => (
                <Grid item xs={12} key={category.name}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2">
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.masteredWords} / {category.totalWords} words mastered
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={category.mastery * 100}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Mastery: {Math.round(category.mastery * 100)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg. Response: {formatTime(category.averageResponseTime)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CategoryPerformanceMetrics; 