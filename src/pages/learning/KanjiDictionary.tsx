import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
} from '@mui/material';
import {
  School as SchoolIcon,
  Edit as EditIcon,
  Quiz as QuizIcon,
  MenuBook as MenuBookIcon,
  Search as SearchIcon,
  VolumeUp as VolumeIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
// Temporarily comment out Recharts imports to isolate the issue
/*
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
*/
import { useProgress } from '../../context/ProgressContext';
import { useLearning } from '../../context/LearningContext';
import { useAudio } from '../../context/AudioContext';
import KanjiPractice from '../../components/KanjiPractice';
import KanjiQuiz from '../../components/KanjiQuiz';
import { kanjiList } from '../../data/kanjiData';

// Tab panel component
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
      id={`kanji-tabpanel-${index}`}
      aria-labelledby={`kanji-tab-${index}`}
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

function a11yProps(index: number) {
  return {
    id: `kanji-tab-${index}`,
    'aria-controls': `kanji-tabpanel-${index}`,
  };
}

// Difficulty levels
const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

// Add this mapping above the KanjiDictionary component
const DIFFICULTY_MAP = {
  easy: 'Beginner',
  medium: 'Intermediate', 
  hard: 'Advanced'
} as const;

const REVERSE_DIFFICULTY_MAP = {
  Beginner: 'easy',
  Intermediate: 'medium',
  Advanced: 'hard'
} as const;

// Simple SVG-based chart components
const SimplePieChart: React.FC<{ data: Array<{ name: string; value: number; color: string }>; width?: number; height?: number }> = ({ 
  data, 
  width = 200, 
  height = 200 
}) => {
  // Safety check to ensure data is valid
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="14">
          No data available
        </text>
      </svg>
    );
  }

  const total = data.reduce((sum, item) => sum + (item?.value || 0), 0);
  if (total === 0) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="14">
          No data available
        </text>
      </svg>
    );
  }

  let currentAngle = 0;
  
  const paths = data.map((item, index) => {
    if (!item || typeof item.value !== 'number') return null;
    
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    const startRadians = (startAngle - 90) * Math.PI / 180;
    const endRadians = (currentAngle - 90) * Math.PI / 180;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    
    const startX = centerX + radius * Math.cos(startRadians);
    const startY = centerY + radius * Math.sin(startRadians);
    const endX = centerX + radius * Math.cos(endRadians);
    const endY = centerY + radius * Math.sin(endRadians);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ');
    
    return (
      <path
        key={index}
        d={pathData}
        fill={item.color || '#ccc'}
        stroke="#fff"
        strokeWidth="2"
      />
    );
  }).filter(Boolean);
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {paths}
    </svg>
  );
};

const SimpleBarChart: React.FC<{ 
  data: Array<{ name: string; value: number; color: string }>; 
  width?: number; 
  height?: number 
}> = ({ 
  data, 
  width = 400, 
  height = 200 
}) => {
  // Safety check to ensure data is valid
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="14">
          No data available
        </text>
      </svg>
    );
  }

  const validData = data.filter(item => item && typeof item.value === 'number');
  if (validData.length === 0) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="14">
          No data available
        </text>
      </svg>
    );
  }

  const maxValue = Math.max(...validData.map(item => item.value));
  const barWidth = (width - 40) / validData.length;
  const barSpacing = 10;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {validData.map((item, index) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0;
        const x = 20 + index * (barWidth + barSpacing);
        const y = height - 20 - barHeight;
        
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={item.color || '#ccc'}
              rx="2"
            />
            <text
              x={x + barWidth / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
            >
              {item.name || 'Unknown'}
            </text>
            <text
              x={x + barWidth / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize="10"
              fill="#333"
            >
              {item.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const SimpleLineChart: React.FC<{ 
  data: Array<{ name: string; value: number }>; 
  width?: number; 
  height?: number;
  color?: string;
}> = ({ 
  data, 
  width = 400, 
  height = 200,
  color = "#1976d2"
}) => {
  // Safety check to ensure data is valid
  if (!data || !Array.isArray(data) || data.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="14">
          No data available
        </text>
      </svg>
    );
  }

  const validData = data.filter(item => item && typeof item.value === 'number');
  if (validData.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="14">
          Insufficient data
        </text>
      </svg>
    );
  }
  
  const maxValue = Math.max(...validData.map(item => item.value));
  const minValue = Math.min(...validData.map(item => item.value));
  const valueRange = maxValue - minValue || 1;
  
  const points = validData.map((item, index) => {
    const x = 20 + (index / (validData.length - 1)) * (width - 40);
    const y = height - 20 - ((item.value - minValue) / valueRange) * (height - 40);
    return `${x},${y}`;
  });
  
  const pathData = `M ${points.join(' L ')}`;
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {validData.map((item, index) => {
        const x = 20 + (index / (validData.length - 1)) * (width - 40);
        const y = height - 20 - ((item.value - minValue) / valueRange) * (height - 40);
        
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="3"
            fill={color}
          />
        );
      })}
    </svg>
  );
};

const KanjiDictionary: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('Beginner');
  const [searchQuery, setSearchQuery] = useState('');
  const { progress } = useProgress();
  const { updateProgress } = useLearning();
  const { playAudio } = useAudio();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Filter kanji based on search query and selected difficulty
  const filteredKanji = useMemo(() => {
    try {
      let filtered = kanjiList || [];
      
      // Filter by difficulty first
      if (selectedDifficulty !== 'Beginner') {
        const kanjiDifficulty = REVERSE_DIFFICULTY_MAP[selectedDifficulty];
        filtered = filtered.filter(kanji => kanji.difficulty === kanjiDifficulty);
      }
      
      // Then filter by search query
      if (!searchQuery.trim()) return filtered;
      
      const query = searchQuery.toLowerCase().trim();
      return filtered.filter(kanji => 
        kanji.character.includes(query) ||
        kanji.english.toLowerCase().includes(query) ||
        kanji.onyomi.some(reading => reading.includes(query)) ||
        kanji.kunyomi.some(reading => reading.includes(query))
      );
    } catch (error) {
      console.error('[KanjiDictionary] Error filtering kanji:', error);
      return [];
    }
  }, [searchQuery, selectedDifficulty]);

  // Calculate comprehensive progress statistics
  const progressStats = useMemo(() => {
    try {
      console.log('[KanjiDictionary] Debug - kanjiList:', kanjiList);
      console.log('[KanjiDictionary] Debug - progress:', progress);
      console.log('[KanjiDictionary] Debug - progress.words:', progress?.words);
      
      // Safety check to ensure kanjiList is defined and not empty
      if (!kanjiList || kanjiList.length === 0) {
        console.warn('KanjiList is undefined or empty');
        return {
          overall: {
            total: 0,
            mastered: 0,
            inProgress: 0,
            notStarted: 0,
            percentComplete: 0,
            avgMastery: 0
          },
          byDifficulty: {
            Beginner: { total: 0, mastered: 0, inProgress: 0, notStarted: 0 },
            Intermediate: { total: 0, mastered: 0, inProgress: 0, notStarted: 0 },
            Advanced: { total: 0, mastered: 0, inProgress: 0, notStarted: 0 }
          },
          avgMasteryByDifficulty: {
            Beginner: 0,
            Intermediate: 0,
            Advanced: 0
          },
          chartData: [],
          difficultyChartData: []
        };
      }

      // Safety check to ensure progress and progress.words exist
      const progressWords = progress?.words || {};
      
      const kanjiProgress = kanjiList.map(kanji => ({
        character: kanji.character,
        difficulty: kanji.difficulty,
        progress: progressWords[`kanji-${kanji.character}`] || {
          masteryLevel: 0,
          consecutiveCorrect: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          lastReviewed: 0,
          category: 'kanji'
        }
      }));

      // Overall progress
      const totalKanji = kanjiList.length;
      const masteredKanji = kanjiProgress.filter(p => p.progress.masteryLevel >= 4).length;
      const inProgressKanji = kanjiProgress.filter(p => p.progress.masteryLevel > 0 && p.progress.masteryLevel < 4).length;
      const notStartedKanji = totalKanji - masteredKanji - inProgressKanji;

      // Progress by difficulty - map from kanji difficulty to display difficulty
      const difficultyStats = {
        Beginner: { total: 0, mastered: 0, inProgress: 0, notStarted: 0 },
        Intermediate: { total: 0, mastered: 0, inProgress: 0, notStarted: 0 },
        Advanced: { total: 0, mastered: 0, inProgress: 0, notStarted: 0 }
      };

      kanjiProgress.forEach(kp => {
        // Map the kanji difficulty to display difficulty
        const displayDifficulty = DIFFICULTY_MAP[kp.difficulty] as DifficultyLevel;
        
        // Safety check to ensure displayDifficulty is valid
        if (!displayDifficulty || !difficultyStats[displayDifficulty]) {
          console.warn(`Invalid difficulty mapping for kanji ${kp.character}: ${kp.difficulty}`);
          return;
        }
        
        difficultyStats[displayDifficulty].total++;
        
        if (kp.progress.masteryLevel >= 4) {
          difficultyStats[displayDifficulty].mastered++;
        } else if (kp.progress.masteryLevel > 0) {
          difficultyStats[displayDifficulty].inProgress++;
        } else {
          difficultyStats[displayDifficulty].notStarted++;
        }
      });

      // Calculate average mastery levels
      const avgMastery = kanjiProgress.reduce((sum, p) => sum + p.progress.masteryLevel, 0) / totalKanji;
      const avgMasteryByDifficulty = {
        Beginner: kanjiProgress.filter(p => DIFFICULTY_MAP[p.difficulty] === 'Beginner').reduce((sum, p) => sum + p.progress.masteryLevel, 0) / Math.max(difficultyStats.Beginner.total, 1),
        Intermediate: kanjiProgress.filter(p => DIFFICULTY_MAP[p.difficulty] === 'Intermediate').reduce((sum, p) => sum + p.progress.masteryLevel, 0) / Math.max(difficultyStats.Intermediate.total, 1),
        Advanced: kanjiProgress.filter(p => DIFFICULTY_MAP[p.difficulty] === 'Advanced').reduce((sum, p) => sum + p.progress.masteryLevel, 0) / Math.max(difficultyStats.Advanced.total, 1)
      };

      // Generate chart data
      let chartData = [];
      let difficultyChartData = [];
      
      try {
        chartData = generateProgressChartData(progress);
      } catch (error) {
        console.error('[KanjiDictionary] Error generating progress chart data:', error);
        chartData = [];
      }
      
      try {
        difficultyChartData = generateDifficultyChartData(difficultyStats, avgMasteryByDifficulty);
      } catch (error) {
        console.error('[KanjiDictionary] Error generating difficulty chart data:', error);
        difficultyChartData = [];
      }

      return {
        overall: {
          total: totalKanji,
          mastered: masteredKanji,
          inProgress: inProgressKanji,
          notStarted: notStartedKanji,
          percentComplete: totalKanji > 0 ? (masteredKanji / totalKanji) * 100 : 0,
          avgMastery
        },
        byDifficulty: difficultyStats,
        avgMasteryByDifficulty,
        chartData,
        difficultyChartData
      };
    } catch (error) {
      console.error('[KanjiDictionary] Error calculating progress stats:', error);
      // Return safe fallback data
      return {
        overall: {
          total: 0,
          mastered: 0,
          inProgress: 0,
          notStarted: 0,
          percentComplete: 0,
          avgMastery: 0
        },
        byDifficulty: {
          Beginner: { total: 0, mastered: 0, inProgress: 0, notStarted: 0 },
          Intermediate: { total: 0, mastered: 0, inProgress: 0, notStarted: 0 },
          Advanced: { total: 0, mastered: 0, inProgress: 0, notStarted: 0 }
        },
        avgMasteryByDifficulty: {
          Beginner: 0,
          Intermediate: 0,
          Advanced: 0
        },
        chartData: [],
        difficultyChartData: []
      };
    }
  }, [progress, kanjiList]);

  // Generate progress chart data
  const generateProgressChartData = (progressData: any) => {
    try {
      const data = [];
      const today = new Date();
      
      // Generate last 7 days of data
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Count kanji practiced on this date
        const kanjiPracticed = Object.entries(progressData?.words || {})
          .filter(([key, value]: [string, any]) => {
            if (!key.startsWith('kanji-') || value?.category !== 'kanji') return false;
            const lastReviewed = new Date(value?.lastReviewed || 0);
            return lastReviewed.toISOString().split('T')[0] === dateStr;
          }).length;

        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          kanjiPracticed: Number(kanjiPracticed) || 0,
          masteryLevel: 0 // Default value to avoid circular dependency
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error generating progress chart data:', error);
      // Return safe fallback data
      return Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        kanjiPracticed: 0,
        masteryLevel: 0
      }));
    }
  };

  // Generate difficulty chart data
  const generateDifficultyChartData = (difficultyStats: any, avgMasteryByDifficulty: any) => {
    try {
      return Object.entries(difficultyStats || {}).map(([difficulty, stats]: [string, any]) => ({
        difficulty,
        total: Number(stats?.total) || 0,
        mastered: Number(stats?.mastered) || 0,
        inProgress: Number(stats?.inProgress) || 0,
        notStarted: Number(stats?.notStarted) || 0,
        avgMastery: Number(avgMasteryByDifficulty?.[difficulty as DifficultyLevel] || 0) * 100
      }));
    } catch (error) {
      console.error('Error generating difficulty chart data:', error);
      // Return safe fallback data
      return [
        { difficulty: 'Beginner', total: 0, mastered: 0, inProgress: 0, notStarted: 0, avgMastery: 0 },
        { difficulty: 'Intermediate', total: 0, mastered: 0, inProgress: 0, notStarted: 0, avgMastery: 0 },
        { difficulty: 'Advanced', total: 0, mastered: 0, inProgress: 0, notStarted: 0, avgMastery: 0 }
      ];
    }
  };

  // Pie chart data for mastery distribution
  const masteryDistributionData = useMemo(() => {
    try {
      // Safety check to ensure progressStats.overall exists
      if (!progressStats?.overall) {
        console.warn('[KanjiDictionary] progressStats.overall is undefined');
        return [];
      }

      const data = [
        { 
          name: 'Mastered', 
          value: Number(progressStats.overall.mastered) || 0, 
          color: theme.palette.success.main 
        },
        { 
          name: 'In Progress', 
          value: Number(progressStats.overall.inProgress) || 0, 
          color: theme.palette.warning.main 
        },
        { 
          name: 'Not Started', 
          value: Number(progressStats.overall.notStarted) || 0, 
          color: theme.palette.grey[400] 
        }
      ].filter(item => item.value > 0); // Only show non-zero values

      return data;
    } catch (error) {
      console.error('Error generating mastery distribution data:', error);
      return [];
    }
  }, [progressStats?.overall, theme.palette]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const playKanjiReading = (reading: string) => {
    if (reading) {
      playAudio(reading);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kanji Dictionary
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Master kanji through interactive lessons, practice, and quizzes. Learn meanings, readings, and usage.
        </Typography>

        {console.log('[KanjiDictionary] Debug - progressStats:', progressStats)}
        {console.log('[KanjiDictionary] Debug - progressStats.byDifficulty:', progressStats.byDifficulty)}
        {console.log('[KanjiDictionary] Debug - progressStats.overall:', progressStats.overall)}

        {/* Search Input */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search kanji by character, meaning, or reading..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Overall Progress Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <MenuBookIcon />
                  </Avatar>
                  <Typography variant="h6">Overall Kanji Progress</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(progressStats.overall?.percentComplete || 0)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressStats.overall?.percentComplete || 0}
                    sx={{ height: 12, borderRadius: 6 }}
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                        {progressStats.overall?.mastered || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mastered
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                        {progressStats.overall?.inProgress || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                        {Math.round((progressStats.overall?.avgMastery || 0) * 100)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Mastery
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mastery Distribution
                </Typography>
                <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {masteryDistributionData && masteryDistributionData.length > 0 ? (
                    <SimplePieChart 
                      data={masteryDistributionData.map(item => ({
                        name: item?.name || 'Unknown',
                        value: Number(item?.value) || 0,
                        color: item?.color || '#ccc'
                      }))}
                      width={200}
                      height={200}
                    />
                  ) : (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'text.secondary'
                    }}>
                      <Typography variant="body2">No data available</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Progress by Difficulty */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {(['Beginner', 'Intermediate', 'Advanced'] as DifficultyLevel[]).map((difficulty) => {
            const stats = progressStats.byDifficulty?.[difficulty];
            const avgMastery = progressStats.avgMasteryByDifficulty?.[difficulty];
            const percentComplete = stats && stats.total && stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0;
            
            return (
              <Grid item xs={12} md={4} key={difficulty}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: difficulty === 'Beginner' ? 'success.main' : 
                                 difficulty === 'Intermediate' ? 'warning.main' : 'error.main',
                          mr: 2 
                        }}
                      >
                        <SchoolIcon />
                      </Avatar>
                      <Typography variant="h6">{difficulty}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentComplete}
                      sx={{ height: 8, borderRadius: 4, mb: 2 }}
                    />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Mastered: {stats?.mastered || 0}/{stats?.total || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Avg: {Math.round((avgMastery || 0) * 100)}%
                        </Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={`${Math.round(percentComplete)}% Complete`}
                        color={percentComplete === 100 ? 'success' : 'primary'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Progress Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Progress
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {progressStats.chartData && progressStats.chartData.length > 0 ? (
                    <SimpleLineChart 
                      data={progressStats.chartData.map(item => ({
                        name: item?.date || 'Unknown',
                        value: Number(item?.kanjiPracticed) || 0
                      }))}
                      width={400}
                      height={250}
                      color={theme.palette.primary.main}
                    />
                  ) : (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'text.secondary'
                    }}>
                      <Typography variant="body2">No progress data available</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Progress by Difficulty
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {progressStats.difficultyChartData && progressStats.difficultyChartData.length > 0 ? (
                    <SimpleBarChart 
                      data={progressStats.difficultyChartData.map(item => ({
                        name: item?.difficulty || 'Unknown',
                        value: Number(item?.mastered || 0) + Number(item?.inProgress || 0),
                        color: theme.palette.primary.main
                      }))}
                      width={400}
                      height={250}
                    />
                  ) : (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'text.secondary'
                    }}>
                      <Typography variant="body2">No difficulty data available</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? "fullWidth" : "standard"}
            centered={!isMobile}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Dictionary" />
            <Tab label="Practice" />
            <Tab label="Quiz" />
          </Tabs>

          {/* Dictionary Tab */}
          <TabPanel value={selectedTab} index={0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Filter by Difficulty
              </Typography>
              <Button
                variant={selectedDifficulty === 'Beginner' ? 'contained' : 'outlined'}
                onClick={() => handleDifficultyChange('Beginner')}
                sx={{ mr: 1 }}
              >
                Beginner
              </Button>
              <Button
                variant={selectedDifficulty === 'Intermediate' ? 'contained' : 'outlined'}
                onClick={() => handleDifficultyChange('Intermediate')}
                sx={{ mr: 1 }}
              >
                Intermediate
              </Button>
              <Button
                variant={selectedDifficulty === 'Advanced' ? 'contained' : 'outlined'}
                onClick={() => handleDifficultyChange('Advanced')}
              >
                Advanced
              </Button>
            </Box>
            <Grid container spacing={2}>
              {(filteredKanji || []).map((kanji) => {
                const kanjiProgress = progress?.words?.[`kanji-${kanji.character}`];
                const masteryLevel = kanjiProgress?.masteryLevel || 0;
                const isMastered = masteryLevel >= 4;
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={kanji.character}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        border: isMastered ? 2 : 1,
                        borderColor: isMastered ? 'success.main' : 'divider',
                        position: 'relative'
                      }}
                    >
                      {isMastered && (
                        <Chip
                          label="Mastered"
                          color="success"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1
                          }}
                        />
                      )}
                      <CardContent>
                        <Typography variant="h3" component="div" sx={{ textAlign: 'center', mb: 1 }}>
                          {kanji.character}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                          {kanji.english}
                        </Typography>
                        
                        {/* Progress indicator */}
                        <Box sx={{ mb: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(masteryLevel / 5) * 100}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Mastery: {Math.round((masteryLevel / 5) * 100)}%
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Onyomi:
                          </Typography>
                          <Box>
                            {(kanji.onyomi || []).slice(0, 2).map((reading, index) => (
                              <IconButton
                                key={index}
                                size="small"
                                onClick={() => playKanjiReading(reading)}
                                sx={{ p: 0.5 }}
                              >
                                <VolumeIcon fontSize="small" />
                              </IconButton>
                            ))}
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {(kanji.onyomi || []).slice(0, 2).join(', ')}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Kunyomi:
                          </Typography>
                          <Box>
                            {(kanji.kunyomi || []).slice(0, 2).map((reading, index) => (
                              <IconButton
                                key={index}
                                size="small"
                                onClick={() => playKanjiReading(reading)}
                                sx={{ p: 0.5 }}
                              >
                                <VolumeIcon fontSize="small" />
                              </IconButton>
                            ))}
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {(kanji.kunyomi || []).slice(0, 2).join(', ')}
                        </Typography>

                        <Chip 
                          label={DIFFICULTY_MAP[kanji.difficulty]} 
                          size="small" 
                          color={DIFFICULTY_MAP[kanji.difficulty] === 'Beginner' ? 'success' : 
                                 DIFFICULTY_MAP[kanji.difficulty] === 'Intermediate' ? 'warning' : 'error'}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </TabPanel>

          {/* Practice Tab */}
          <TabPanel value={selectedTab} index={1}>
            <KanjiPractice kanji={filteredKanji || []} />
          </TabPanel>

          {/* Quiz Tab */}
          <TabPanel value={selectedTab} index={2}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quiz Difficulty
              </Typography>
              <Button
                variant={selectedDifficulty === 'Beginner' ? 'contained' : 'outlined'}
                onClick={() => handleDifficultyChange('Beginner')}
                sx={{ mr: 1 }}
              >
                Beginner
              </Button>
              <Button
                variant={selectedDifficulty === 'Intermediate' ? 'contained' : 'outlined'}
                onClick={() => handleDifficultyChange('Intermediate')}
                sx={{ mr: 1 }}
              >
                Intermediate
              </Button>
              <Button
                variant={selectedDifficulty === 'Advanced' ? 'contained' : 'outlined'}
                onClick={() => handleDifficultyChange('Advanced')}
              >
                Advanced
              </Button>
            </Box>
            <KanjiQuiz kanji={filteredKanji || []} difficulty={REVERSE_DIFFICULTY_MAP[selectedDifficulty]} />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default KanjiDictionary; 