import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Translate as TranslateIcon,
  Edit as EditIcon,
  Quiz as QuizIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useProgress } from '../../context/ProgressContext';
import KanaChart from '../../components/kana/KanaChart';
import KanaPractice from '../../components/kana/KanaPractice';
import KanaQuiz from '../../components/kana/KanaQuiz';
import { hiraganaList, katakanaList } from '../../data/kanaData';

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
  const { progress } = useProgress();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedKanaType, setSelectedKanaType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [quizDifficulty, setQuizDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleKanaTypeChange = (type: 'hiragana' | 'katakana') => {
    setSelectedKanaType(type);
  };

  const handleDifficultyChange = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    setQuizDifficulty(difficulty);
  };

  const masteredHiragana = hiraganaList.filter(
    k => progress.words[k.character]?.masteryLevel >= 5
  ).length;
  const masteredKatakana = katakanaList.filter(
    k => progress.words[k.character]?.masteryLevel >= 5
  ).length;
  const hiraganaTotal = hiraganaList.length;
  const katakanaTotal = katakanaList.length;
  const hiraganaPercent = hiraganaTotal > 0 ? (masteredHiragana / hiraganaTotal) * 100 : 0;
  const katakanaPercent = katakanaTotal > 0 ? (masteredKatakana / katakanaTotal) * 100 : 0;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kana Learning
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Master hiragana and katakana through interactive lessons, practice, and quizzes.
        </Typography>

        {/* Progress Section */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TranslateIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Hiragana Progress</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={hiraganaPercent}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {masteredHiragana} / {hiraganaTotal} mastered ({Math.round(hiraganaPercent)}% Complete)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TranslateIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Katakana Progress</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={katakanaPercent}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {masteredKatakana} / {katakanaTotal} mastered ({Math.round(katakanaPercent)}% Complete)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
        <Paper sx={{ width: '100%', mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant={isMobile ? 'fullWidth' : 'standard'}
            centered={!isMobile}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<SchoolIcon />} label="Learn" {...a11yProps(0)} />
            <Tab icon={<EditIcon />} label="Practice" {...a11yProps(1)} />
            <Tab icon={<QuizIcon />} label="Quiz" {...a11yProps(2)} />
          </Tabs>

          {/* Learn Tab */}
          <TabPanel value={selectedTab} index={0}>
            <KanaChart type={selectedKanaType} />
          </TabPanel>

          {/* Practice Tab */}
          <TabPanel value={selectedTab} index={1}>
            <KanaPractice type={selectedKanaType} />
          </TabPanel>

          {/* Quiz Tab */}
          <TabPanel value={selectedTab} index={2}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Select Difficulty
              </Typography>
              <Button
                variant={quizDifficulty === 'beginner' ? 'contained' : 'outlined'}
                onClick={() => handleDifficultyChange('beginner')}
                sx={{ mr: 2 }}
              >
                Beginner
              </Button>
              <Button
                variant={quizDifficulty === 'intermediate' ? 'contained' : 'outlined'}
                onClick={() => handleDifficultyChange('intermediate')}
                sx={{ mr: 2 }}
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
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Kana; 