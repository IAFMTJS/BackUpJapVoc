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
  Beginner: 'easy',
  Intermediate: 'medium',
  Advanced: 'hard'
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

  // Filter kanji based on search query
  const filteredKanji = useMemo(() => {
    if (!searchQuery.trim()) return kanjiList;
    
    const query = searchQuery.toLowerCase().trim();
    return kanjiList.filter(kanji => 
      kanji.character.includes(query) ||
      kanji.english.toLowerCase().includes(query) ||
      kanji.onyomi.some(reading => reading.includes(query)) ||
      kanji.kunyomi.some(reading => reading.includes(query))
    );
  }, [searchQuery]);

  // Calculate comprehensive progress statistics
  const progressStats = useMemo(() => {
    const kanjiProgress = kanjiList.map(kanji => ({
      character: kanji.character,
      difficulty: kanji.difficulty,
      progress: progress.words[`kanji-${kanji.character}`] || {
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

    // Progress by difficulty
    const difficultyStats = {
      Beginner: { total: 0, mastered: 0, inProgress: 0, notStarted: 0 },
      Intermediate: { total: 0, mastered: 0, inProgress: 0, notStarted: 0 },
      Advanced: { total: 0, mastered: 0, inProgress: 0, notStarted: 0 }
    };

    kanjiProgress.forEach(kp => {
      const diff = kp.difficulty as DifficultyLevel;
      difficultyStats[diff].total++;
      
      if (kp.progress.masteryLevel >= 4) {
        difficultyStats[diff].mastered++;
      } else if (kp.progress.masteryLevel > 0) {
        difficultyStats[diff].inProgress++;
      } else {
        difficultyStats[diff].notStarted++;
      }
    });

    // Calculate average mastery levels
    const avgMastery = kanjiProgress.reduce((sum, p) => sum + p.progress.masteryLevel, 0) / totalKanji;
    const avgMasteryByDifficulty = {
      Beginner: kanjiProgress.filter(p => p.difficulty === 'Beginner').reduce((sum, p) => sum + p.progress.masteryLevel, 0) / Math.max(difficultyStats.Beginner.total, 1),
      Intermediate: kanjiProgress.filter(p => p.difficulty === 'Intermediate').reduce((sum, p) => sum + p.progress.masteryLevel, 0) / Math.max(difficultyStats.Intermediate.total, 1),
      Advanced: kanjiProgress.filter(p => p.difficulty === 'Advanced').reduce((sum, p) => sum + p.progress.masteryLevel, 0) / Math.max(difficultyStats.Advanced.total, 1)
    };

    // Generate chart data
    const chartData = generateProgressChartData(progress);
    const difficultyChartData = generateDifficultyChartData(difficultyStats, avgMasteryByDifficulty);

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
  }, [progress]);

  // Generate progress chart data
  const generateProgressChartData = (progressData: any) => {
    const data = [];
    const today = new Date();
    
    // Generate last 7 days of data
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count kanji practiced on this date
      const kanjiPracticed = Object.entries(progressData.words || {})
        .filter(([key, value]: [string, any]) => {
          if (!key.startsWith('kanji-') || value.category !== 'kanji') return false;
          const lastReviewed = new Date(value.lastReviewed || 0);
          return lastReviewed.toISOString().split('T')[0] === dateStr;
        }).length;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        kanjiPracticed,
        masteryLevel: progressStats.overall.avgMastery
      });
    }
    
    return data;
  };

  // Generate difficulty chart data
  const generateDifficultyChartData = (difficultyStats: any, avgMasteryByDifficulty: any) => {
    return Object.entries(difficultyStats).map(([difficulty, stats]: [string, any]) => ({
      difficulty,
      total: stats.total,
      mastered: stats.mastered,
      inProgress: stats.inProgress,
      notStarted: stats.notStarted,
      avgMastery: avgMasteryByDifficulty[difficulty as DifficultyLevel] * 100
    }));
  };

  // Pie chart data for mastery distribution
  const masteryDistributionData = [
    { name: 'Mastered', value: progressStats.overall.mastered, color: theme.palette.success.main },
    { name: 'In Progress', value: progressStats.overall.inProgress, color: theme.palette.warning.main },
    { name: 'Not Started', value: progressStats.overall.notStarted, color: theme.palette.grey[400] }
  ];

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
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Progress by Difficulty */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {(['Beginner', 'Intermediate', 'Advanced'] as DifficultyLevel[]).map((difficulty) => {
            const stats = progressStats.byDifficulty[difficulty];
            const avgMastery = progressStats.avgMasteryByDifficulty[difficulty];
            const percentComplete = stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0;
            
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
                          Mastered: {stats.mastered}/{stats.total}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Avg: {Math.round(avgMastery * 100)}%
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
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressStats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line 
                        type="monotone" 
                        dataKey="kanjiPracticed" 
                        stroke={theme.palette.primary.main} 
                        name="Kanji Practiced"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
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
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressStats.difficultyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="difficulty" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="mastered" fill={theme.palette.success.main} name="Mastered" />
                      <Bar dataKey="inProgress" fill={theme.palette.warning.main} name="In Progress" />
                    </BarChart>
                  </ResponsiveContainer>
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
            <Grid container spacing={2}>
              {filteredKanji.map((kanji) => {
                const kanjiProgress = progress.words[`kanji-${kanji.character}`];
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
                            {kanji.onyomi.slice(0, 2).map((reading, index) => (
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
                          {kanji.onyomi.slice(0, 2).join(', ')}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Kunyomi:
                          </Typography>
                          <Box>
                            {kanji.kunyomi.slice(0, 2).map((reading, index) => (
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
                          {kanji.kunyomi.slice(0, 2).join(', ')}
                        </Typography>

                        <Chip 
                          label={kanji.difficulty} 
                          size="small" 
                          color={kanji.difficulty === 'Beginner' ? 'success' : 
                                 kanji.difficulty === 'Intermediate' ? 'warning' : 'error'}
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
            <KanjiPractice />
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
            <KanjiQuiz difficulty={DIFFICULTY_MAP[selectedDifficulty]} />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default KanjiDictionary; 