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
  Divider
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
import { SimpleDictionaryItem } from '../types/dictionary';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import { playAudio } from '../utils/audio';
import WordCard from '../components/WordCard';
import { loadDictionaryWords, getDictionaryPage } from '../data/dictionaryLoader';
import { useDictionary } from '../context/DictionaryContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`dictionary-tabpanel-${index}`}
    aria-labelledby={`dictionary-tab-${index}`}
    sx={{ py: 3 }}
  >
    {value === index && children}
  </Box>
);

interface DictionaryResponse {
  words: SimpleDictionaryItem[];
  total: number;
  hasMore: boolean;
}

const KnowingDictionary: React.FC = () => {
  const { words: dictionaryWords, isInitialized, isLoading, error } = useDictionary();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [readWords, setReadWords] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 50;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { getThemeClasses } = useAppTheme();
  const themeClasses = getThemeClasses();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load read words from localStorage
  useEffect(() => {
    const savedReadWords = localStorage.getItem('readWords');
    if (savedReadWords) {
      setReadWords(new Set(JSON.parse(savedReadWords)));
    }
  }, []);

  // Filter words based on search, category, and level
  const filteredWords = useMemo(() => {
    if (!isInitialized || isLoading) {
      console.log('[Debug] Dictionary not ready:', { isInitialized, isLoading });
      return [];
    }
    
    console.log('[Debug] Total dictionary words:', dictionaryWords.length);
    console.log('[Debug] Search term:', searchTerm);
    console.log('[Debug] Selected category:', selectedCategory);
    console.log('[Debug] Selected level:', selectedLevel);
    
    const filtered = dictionaryWords.filter(word => {
      const matchesSearch = 
        (word.japanese?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (word.english?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (word.romaji?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || word.level?.toString() === selectedLevel;

      const matches = matchesSearch && matchesCategory && matchesLevel;
      if (matches) {
        console.log('[Debug] Matching word:', word);
      }
      return matches;
    });

    console.log('[Debug] Filtered words count:', filtered.length);
    return filtered;
  }, [dictionaryWords, searchTerm, selectedCategory, selectedLevel, isInitialized, isLoading]);

  // Get paginated words
  const paginatedWords = useMemo(() => {
    const start = 0;
    const end = page * ITEMS_PER_PAGE;
    const words = filteredWords.slice(start, end);
    setHasMore(end < filteredWords.length);
    console.log('[Debug] Paginated words:', words.length);
    return words;
  }, [filteredWords, page]);

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

  const handleMarkAsRead = (wordId: string) => {
    setReadWords(prev => {
      const newReadWords = new Set(prev);
      if (newReadWords.has(wordId)) {
        newReadWords.delete(wordId);
      } else {
        newReadWords.add(wordId);
      }
      localStorage.setItem('readWords', JSON.stringify(Array.from(newReadWords)));
      return newReadWords;
    });
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set(dictionaryWords.map(word => word.category));
    return Array.from(uniqueCategories).sort();
  }, [dictionaryWords]);

  const levels = useMemo(() => {
    const uniqueLevels = new Set(dictionaryWords.map(word => word.level));
    return Array.from(uniqueLevels).sort((a, b) => a - b);
  }, [dictionaryWords]);

  const progress = useMemo(() => {
    if (dictionaryWords.length === 0) return 0;
    return (readWords.size / dictionaryWords.length) * 100;
  }, [dictionaryWords.length, readWords.size]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Show loading state while initializing
  if (!isInitialized || isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="200px"
          gap={2}
        >
          <CircularProgress />
          <Typography variant="body1" color="text.secondary">
            Loading dictionary...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          mb: 6,
          borderRadius: 4,
          background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
          color: 'white'
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 2
          }}
        >
          Japanese Dictionary
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            opacity: 0.9,
            maxWidth: '800px',
            mx: 'auto',
            mb: 2
          }}
        >
          Explore and learn Japanese vocabulary with detailed meanings, examples, and audio pronunciation.
        </Typography>
        <Box sx={{ maxWidth: '600px', mx: 'auto', mt: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
            Progress: {Math.round(progress)}% ({readWords.size} of {dictionaryWords.length} words)
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white'
              }
            }} 
          />
        </Box>
      </Paper>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search words, readings, or meanings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Level</InputLabel>
                <Select
                  value={selectedLevel}
                  label="Level"
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  {levels.map((level) => (
                    <MenuItem key={level} value={level.toString()}>
                      Level {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Showing {filteredWords.length} of {dictionaryWords.length} words
        </Typography>
      </Box>

      {/* Results */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          {filteredWords.length} words found
        </Typography>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {paginatedWords.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              onMarkAsRead={handleMarkAsRead}
              isRead={readWords.has(word.id)}
            />
          ))}
        </Box>
        {filteredWords.length === 0 && !searchTerm && !selectedCategory && !selectedLevel && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No words found in the dictionary.
            </Typography>
          </Paper>
        )}
        {filteredWords.length === 0 && (searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all') && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No words found matching your search criteria.
            </Typography>
          </Paper>
        )}
        
        {/* Loading indicator for infinite scroll */}
        <Box 
          ref={observerTarget} 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 4, 
            mb: 4,
            minHeight: '50px'
          }}
        >
          {isLoadingMore && <CircularProgress />}
        </Box>
      </Box>
    </Container>
  );
};

export default KnowingDictionary; 