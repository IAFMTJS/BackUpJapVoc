import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Collapse,
  Button,
  LinearProgress,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  VolumeUp as VolumeUpIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Translate as TranslateIcon
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../../context/ThemeContext';
import { playAudio } from '../../utils/audio';
import { useKanjiDictionary } from '../../context/KanjiDictionaryContext';
import KanjiPractice from '../../components/kanji/KanjiPractice';
import KanjiQuiz from '../../components/kanji/KanjiQuiz';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} style={{ width: '100%' }}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const KanjiDictionary: React.FC = () => {
  const { kanji, isInitialized, isLoading, error } = useKanjiDictionary();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [readKanji, setReadKanji] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 50;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { getThemeClasses } = useAppTheme();
  const themeClasses = getThemeClasses();
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // Load read kanji from localStorage
  useEffect(() => {
    const savedReadKanji = localStorage.getItem('readKanji');
    if (savedReadKanji) {
      setReadKanji(new Set(JSON.parse(savedReadKanji)));
    }
  }, []);

  // Filter kanji based on search, category, and level
  const filteredKanji = useMemo(() => {
    if (!isInitialized || isLoading) {
      console.log('[Debug] Kanji dictionary not ready:', { isInitialized, isLoading });
      return [];
    }
    
    console.log('[Debug] Total kanji:', kanji.length);
    console.log('[Debug] Search term:', searchTerm);
    console.log('[Debug] Selected category:', selectedCategory);
    console.log('[Debug] Selected level:', selectedLevel);
    
    const filtered = kanji.filter(k => {
      const matchesSearch = 
        k.character.includes(searchTerm) ||
        k.meanings.some(m => m.toLowerCase().includes(searchTerm.toLowerCase())) ||
        k.readings.on.some(r => r.toLowerCase().includes(searchTerm.toLowerCase())) ||
        k.readings.kun.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || k.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || k.jlpt?.toString() === selectedLevel.replace('N', '');

      const matches = matchesSearch && matchesCategory && matchesLevel;
      if (matches) {
        console.log('[Debug] Matching kanji:', k);
      }
      return matches;
    });

    console.log('[Debug] Filtered kanji count:', filtered.length);
    return filtered;
  }, [kanji, searchTerm, selectedCategory, selectedLevel, isInitialized, isLoading]);

  // Get paginated kanji
  const paginatedKanji = useMemo(() => {
    const start = 0;
    const end = page * ITEMS_PER_PAGE;
    const kanjiList = filteredKanji.slice(start, end);
    setHasMore(end < filteredKanji.length);
    console.log('[Debug] Paginated kanji:', kanjiList.length);
    return kanjiList;
  }, [filteredKanji, page]);

  // Handle infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setPage(prev => prev + 1);
          setIsLoadingMore(false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  const handleMarkAsRead = (kanjiId: string) => {
    setReadKanji(prev => {
      const newReadKanji = new Set(prev);
      if (newReadKanji.has(kanjiId)) {
        newReadKanji.delete(kanjiId);
      } else {
        newReadKanji.add(kanjiId);
      }
      localStorage.setItem('readKanji', JSON.stringify(Array.from(newReadKanji)));
      return newReadKanji;
    });
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set(kanji.map(k => k.category));
    return Array.from(uniqueCategories).sort();
  }, [kanji]);

  const levels = useMemo(() => {
    const uniqueLevels = new Set(kanji.map(k => k.jlpt));
    return Array.from(uniqueLevels).sort((a, b) => (a || 0) - (b || 0));
  }, [kanji]);

  const progress = useMemo(() => {
    if (kanji.length === 0) return 0;
    return (readKanji.size / kanji.length) * 100;
  }, [kanji.length, readKanji.size]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Kanji Dictionary
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="kanji learning tabs">
          <Tab label="Dictionary" />
          <Tab label="Practice" />
          <Tab label="Quiz" />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        {/* Existing dictionary content */}
        <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
                label="Search Kanji"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
              }}
            />
          </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>JLPT Level</InputLabel>
                <Select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  label="JLPT Level"
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  {levels.map((level) => (
                    <MenuItem key={level} value={`N${level}`}>
                      N{level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Progress: {Math.round(progress)}%
        </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
      </Box>

        <Grid container spacing={2}>
          {paginatedKanji.map((k) => (
            <Grid item xs={12} sm={6} md={4} key={k.character}>
              <Card>
              <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h4" component="div" sx={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
                    {k.character}
                  </Typography>
                  <IconButton
                      onClick={() => handleMarkAsRead(k.character)}
                      color={readKanji.has(k.character) ? 'primary' : 'default'}
                  >
                      {readKanji.has(k.character) ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
                  </IconButton>
                </Box>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {k.meanings.join(', ')}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      On: {k.readings.on.join(', ')}
                      {k.readings.on.map((reading, index) => (
                        <Tooltip key={`on-${index}`} title={`Play ${reading}`}>
                          <IconButton 
                            size="small"
                            onClick={() => playAudio(reading)}
                            sx={{ ml: 0.5 }}
                          >
                            <VolumeUpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Kun: {k.readings.kun.join(', ')}
                      {k.readings.kun.map((reading, index) => (
                        <Tooltip key={`kun-${index}`} title={`Play ${reading}`}>
                          <IconButton 
                            size="small"
                            onClick={() => playAudio(reading)}
                            sx={{ ml: 0.5 }}
                          >
                            <VolumeUpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {k.jlpt && (
                      <Chip
                        icon={<SchoolIcon />}
                        label={`N${k.jlpt}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {k.category && (
                      <Chip
                        icon={<CategoryIcon />}
                        label={k.category}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Stack>
              </CardContent>
            </Card>
            </Grid>
          ))}
        </Grid>

        {hasMore && (
          <Box ref={observerTarget} sx={{ height: 20, mt: 2 }}>
            {isLoadingMore && <CircularProgress size={20} />}
        </Box>
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
              label="Difficulty"
            >
              <MenuItem value="beginner">Beginner (N5)</MenuItem>
              <MenuItem value="intermediate">Intermediate (N4-N3)</MenuItem>
              <MenuItem value="advanced">Advanced (N2-N1)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <KanjiPractice difficulty={selectedDifficulty} />
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
              label="Difficulty"
            >
              <MenuItem value="beginner">Beginner (N5)</MenuItem>
              <MenuItem value="intermediate">Intermediate (N4-N3)</MenuItem>
              <MenuItem value="advanced">Advanced (N2-N1)</MenuItem>
            </Select>
          </FormControl>
      </Box>
        <KanjiQuiz difficulty={selectedDifficulty} />
      </TabPanel>
    </Container>
  );
};

export default KanjiDictionary; 