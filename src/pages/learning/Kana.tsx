import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Translate as TranslateIcon,
  Edit as EditIcon,
  Quiz as QuizIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useProgress } from '../../context/ProgressContext';
import KanaChart from '../../components/kana/KanaChart';
import KanaPractice from '../../components/kana/KanaPractice';
import KanaQuiz from '../../components/kana/KanaQuiz';
import { hiraganaList, katakanaList } from '../../data/kanaData';
import ErrorBoundary from '../../components/ErrorBoundary';

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
      id={`kana-tabpanel-${index}`}
      aria-labelledby={`kana-tab-${index}`}
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
    id: `kana-tab-${index}`,
    'aria-controls': `kana-tabpanel-${index}`,
  };
}

const Kana: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const progressContext = useProgress();
  const progress = progressContext?.progress || { words: {}, sections: {}, preferences: {}, statistics: {} };
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedKanaType, setSelectedKanaType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [quizDifficulty, setQuizDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set loading to false when progress is available
  React.useEffect(() => {
    if (progress) {
      setIsLoading(false);
    }
  }, [progress]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleKanaTypeChange = (type: 'hiragana' | 'katakana') => {
    setSelectedKanaType(type);
  };

  const handleDifficultyChange = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    setQuizDifficulty(difficulty);
  };

  // Generate progress chart data
  const generateProgressChartData = (progressData: any, avgMastery: number = 0) => {
    try {
      const data = [];
      const today = new Date();
      
      // Generate last 7 days of data
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Count kana practiced on this date with safety checks
        const kanaPracticed = Object.entries(progressData.words || {})
          .filter(([key, value]: [string, any]) => {
            if (!value || typeof value !== 'object') return false;
            if (value.category !== 'hiragana' && value.category !== 'katakana') return false;
            const lastReviewed = new Date(value.lastReviewed || 0);
            return lastReviewed.toISOString().split('T')[0] === dateStr;
          }).length;

        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          kanaPracticed,
          masteryLevel: avgMastery
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error generating chart data:', error);
      // Return empty data array if there's an error
      return [];
    }
  };

  // Calculate comprehensive progress statistics
  const progressStats = useMemo(() => {
    try {
      // Safety check to ensure progress.words exists
      if (!progress?.words || typeof progress.words !== 'object') {
        return {
          hiragana: {
            mastered: 0,
            inProgress: 0,
            notStarted: hiraganaList.length,
            total: hiraganaList.length,
            percentComplete: 0,
            avgMastery: 0
          },
          katakana: {
            mastered: 0,
            inProgress: 0,
            notStarted: katakanaList.length,
            total: katakanaList.length,
            percentComplete: 0,
            avgMastery: 0
          },
          overall: {
            mastered: 0,
            inProgress: 0,
            notStarted: hiraganaList.length + katakanaList.length,
            total: hiraganaList.length + katakanaList.length,
            percentComplete: 0,
            avgMastery: 0
          },
          chartData: []
        };
      }

      const hiraganaProgress = hiraganaList.map(kana => ({
        character: kana.character,
        progress: progress.words[kana.character] || {
          masteryLevel: 0,
          consecutiveCorrect: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          lastReviewed: 0
        }
      }));

      const katakanaProgress = katakanaList.map(kana => ({
        character: kana.character,
        progress: progress.words[kana.character] || {
          masteryLevel: 0,
          consecutiveCorrect: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          lastReviewed: 0
        }
      }));

      const hiraganaMastered = hiraganaProgress.filter(p => 
        p.progress.masteryLevel >= 5 && p.progress.consecutiveCorrect >= 2
      ).length;
      const katakanaMastered = katakanaProgress.filter(p => 
        p.progress.masteryLevel >= 5 && p.progress.consecutiveCorrect >= 2
      ).length;

      const hiraganaInProgress = hiraganaProgress.filter(p => 
        p.progress.masteryLevel > 0 && p.progress.masteryLevel < 5
      ).length;
      const katakanaInProgress = katakanaProgress.filter(p => 
        p.progress.masteryLevel > 0 && p.progress.masteryLevel < 5
      ).length;

      const hiraganaNotStarted = hiraganaList.length - hiraganaMastered - hiraganaInProgress;
      const katakanaNotStarted = katakanaList.length - katakanaMastered - katakanaInProgress;

      const totalKana = hiraganaList.length + katakanaList.length;
      const totalMastered = hiraganaMastered + katakanaMastered;
      const totalInProgress = hiraganaInProgress + katakanaInProgress;
      const totalNotStarted = hiraganaNotStarted + katakanaNotStarted;

      // Calculate average mastery levels with safety checks
      const hiraganaAvgMastery = hiraganaList.length > 0 
        ? hiraganaProgress.reduce((sum, p) => sum + (p.progress.masteryLevel || 0), 0) / hiraganaList.length 
        : 0;
      const katakanaAvgMastery = katakanaList.length > 0 
        ? katakanaProgress.reduce((sum, p) => sum + (p.progress.masteryLevel || 0), 0) / katakanaList.length 
        : 0;
      const totalAvgMastery = (hiraganaAvgMastery + katakanaAvgMastery) / 2;

      // Generate chart data for progress over time
      const chartData = generateProgressChartData(progress, totalAvgMastery);

      return {
        hiragana: {
          mastered: hiraganaMastered,
          inProgress: hiraganaInProgress,
          notStarted: hiraganaNotStarted,
          total: hiraganaList.length,
          percentComplete: hiraganaList.length > 0 ? (hiraganaMastered / hiraganaList.length) * 100 : 0,
          avgMastery: hiraganaAvgMastery
        },
        katakana: {
          mastered: katakanaMastered,
          inProgress: katakanaInProgress,
          notStarted: katakanaNotStarted,
          total: katakanaList.length,
          percentComplete: katakanaList.length > 0 ? (katakanaMastered / katakanaList.length) * 100 : 0,
          avgMastery: katakanaAvgMastery
        },
        overall: {
          mastered: totalMastered,
          inProgress: totalInProgress,
          notStarted: totalNotStarted,
          total: totalKana,
          percentComplete: totalKana > 0 ? (totalMastered / totalKana) * 100 : 0,
          avgMastery: totalAvgMastery
        },
        chartData
      };
    } catch (error) {
      console.error('Error calculating progress stats:', error);
      setError('Failed to load progress data. Please refresh the page.');
      return {
        hiragana: { mastered: 0, inProgress: 0, notStarted: 0, total: 0, percentComplete: 0, avgMastery: 0 },
        katakana: { mastered: 0, inProgress: 0, notStarted: 0, total: 0, percentComplete: 0, avgMastery: 0 },
        overall: { mastered: 0, inProgress: 0, notStarted: 0, total: 0, percentComplete: 0, avgMastery: 0 },
        chartData: []
      };
    }
  }, [progress]);

  // Pie chart data for mastery distribution
  const masteryDistributionData = [
    { name: 'Mastered', value: progressStats.overall.mastered, color: theme.palette.success.main },
    { name: 'In Progress', value: progressStats.overall.inProgress, color: theme.palette.warning.main },
    { name: 'Not Started', value: progressStats.overall.notStarted, color: theme.palette.grey[400] }
  ];

  // Render different states based on conditions
  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" color="error" gutterBottom>
            Error Loading Kana Page
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setError(null)}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Loading Kana Learning...
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kana Learning
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Master hiragana and katakana through interactive lessons, practice, and quizzes.
        </Typography>

        {/* Overall Progress Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Kana Progress
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(progressStats.overall.percentComplete)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressStats.overall.percentComplete}
                    sx={{ height: 12, borderRadius: 6 }}
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                        {progressStats.overall.mastered}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mastered
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                        {progressStats.overall.inProgress}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                        {Math.round(progressStats.overall.avgMastery * 100)}%
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
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={masteryDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {masteryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Individual Kana Type Progress */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <TranslateIcon />
                  </Avatar>
                  <Typography variant="h6">Hiragana Progress</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressStats.hiragana.percentComplete}
                  sx={{ height: 10, borderRadius: 5, mb: 2 }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Mastered: {progressStats.hiragana?.mastered || 0}/{progressStats.hiragana?.total || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Avg Mastery: {Math.round((progressStats.hiragana?.avgMastery || 0) * 100)}%
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={`${Math.round(progressStats.hiragana.percentComplete)}% Complete`}
                    color={progressStats.hiragana.percentComplete === 100 ? 'success' : 'primary'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <TranslateIcon />
                  </Avatar>
                  <Typography variant="h6">Katakana Progress</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressStats.katakana.percentComplete}
                  sx={{ height: 10, borderRadius: 5, mb: 2 }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Mastered: {progressStats.katakana?.mastered || 0}/{progressStats.katakana?.total || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Avg Mastery: {Math.round((progressStats.katakana?.avgMastery || 0) * 100)}%
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={`${Math.round(progressStats.katakana.percentComplete)}% Complete`}
                    color={progressStats.katakana.percentComplete === 100 ? 'success' : 'primary'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Progress Chart */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Progress
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressStats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="kanaPracticed" 
                    stroke={theme.palette.primary.main} 
                    name="Kana Practiced"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Kana Type Selection */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant={selectedKanaType === 'hiragana' ? 'contained' : 'outlined'}
            onClick={() => handleKanaTypeChange('hiragana')}
            sx={{ mr: 2 }}
          >
            Hiragana
          </Button>
          <Button
            variant={selectedKanaType === 'katakana' ? 'contained' : 'outlined'}
            onClick={() => handleKanaTypeChange('katakana')}
          >
            Katakana
          </Button>
        </Box>

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
            <Tab label="Chart" />
            <Tab label="Practice" />
            <Tab label="Quiz" />
          </Tabs>

          <TabPanel value={selectedTab} index={0}>
            <ErrorBoundary>
              <KanaChart type={selectedKanaType} />
            </ErrorBoundary>
          </TabPanel>

          <TabPanel value={selectedTab} index={1}>
            <ErrorBoundary>
              <KanaPractice type={selectedKanaType} />
            </ErrorBoundary>
          </TabPanel>

          <TabPanel value={selectedTab} index={2}>
            <ErrorBoundary>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quiz Difficulty
                </Typography>
                <Button
                  variant={quizDifficulty === 'beginner' ? 'contained' : 'outlined'}
                  onClick={() => handleDifficultyChange('beginner')}
                  sx={{ mr: 1 }}
                >
                  Beginner
                </Button>
                <Button
                  variant={quizDifficulty === 'intermediate' ? 'contained' : 'outlined'}
                  onClick={() => handleDifficultyChange('intermediate')}
                  sx={{ mr: 1 }}
                >
                  Intermediate
                </Button>
                <Button
                  variant={quizDifficulty === 'advanced' ? 'contained' : 'outlined'}
                  onClick={() => handleDifficultyChange('advanced')}
                >
                  Advanced
                </Button>
              </Box>
              <KanaQuiz type={selectedKanaType} difficulty={quizDifficulty} />
            </ErrorBoundary>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Kana; 