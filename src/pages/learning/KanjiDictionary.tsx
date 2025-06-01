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
} from '@mui/material';
import {
  School as SchoolIcon,
  Edit as EditIcon,
  Quiz as QuizIcon,
  MenuBook as MenuBookIcon,
  Search as SearchIcon,
  VolumeUp as VolumeIcon,
} from '@mui/icons-material';
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

  // Calculate progress
  const calculateProgress = () => {
    const totalKanji = kanjiList.length;
    const masteredKanji = Object.entries(progress.words)
      .filter(([key, value]) => 
        key.startsWith('kanji-') && 
        value.category === 'kanji' && 
        value.masteryLevel >= 4 // Consider mastery level 4 or higher as mastered
      )
      .length;
    return totalKanji > 0 ? (masteredKanji / totalKanji) * 100 : 0;
  };

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

        {/* Progress Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MenuBookIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Overall Progress</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateProgress()} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(calculateProgress())}% Complete
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Object.entries(progress.words)
                      .filter(([key, value]) => 
                        key.startsWith('kanji-') && 
                        value.category === 'kanji' && 
                        value.masteryLevel >= 4
                      ).length} / {kanjiList.length} Kanji Mastered
                  </Typography>
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
            <Box sx={{ p: 3 }}>
              {filteredKanji.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center">
                  No kanji found matching your search.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {filteredKanji.map((kanji, index) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={`${kanji.character}-${index}`}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" component="div" align="center" sx={{ mb: 1 }}>
                            {kanji.character}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" align="center">
                            {kanji.english}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            {kanji.onyomi.length > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  On: {kanji.onyomi.join(', ')}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  {kanji.onyomi.map((reading, index) => (
                                    <Tooltip key={`onyomi-${index}`} title={`Play ${reading}`}>
                                      <IconButton 
                                        size="small" 
                                        onClick={() => playKanjiReading(reading)}
                                        sx={{ p: 0.5 }}
                                      >
                                        <VolumeIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  ))}
                                </Box>
                              </Box>
                            )}
                            {kanji.kunyomi.length > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Kun: {kanji.kunyomi.join(', ')}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  {kanji.kunyomi.map((reading, index) => (
                                    <Tooltip key={`kunyomi-${index}`} title={`Play ${reading}`}>
                                      <IconButton 
                                        size="small" 
                                        onClick={() => playKanjiReading(reading)}
                                        sx={{ p: 0.5 }}
                                      >
                                        <VolumeIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </Box>
                          {kanji.examples && kanji.examples.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {kanji.examples.map((example, index) => (
                                <Box key={`example-${index}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {example.word} - {example.meaning}
                                  </Typography>
                                  <Tooltip title={`Play ${example.word}`}>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => playKanjiReading(example.word)}
                                      sx={{ p: 0.5 }}
                                    >
                                      <VolumeIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </TabPanel>

          {/* Practice Tab */}
          <TabPanel value={selectedTab} index={1}>
            {filteredKanji.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No kanji found matching your search.
              </Typography>
            ) : (
              <KanjiPractice kanji={filteredKanji} />
            )}
          </TabPanel>

          {/* Quiz Tab */}
          <TabPanel value={selectedTab} index={2}>
            {filteredKanji.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No kanji found matching your search.
              </Typography>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Select Difficulty
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <Button
                        key={level}
                        variant={selectedDifficulty === level ? 'contained' : 'outlined'}
                        onClick={() => handleDifficultyChange(level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </Box>
                </Box>
                <KanjiQuiz 
                  kanji={filteredKanji} 
                  difficulty={DIFFICULTY_MAP[selectedDifficulty]} 
                />
              </>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default KanjiDictionary; 