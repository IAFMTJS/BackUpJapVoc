import React, { useState, useEffect, useMemo } from 'react';
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
  LinearProgress
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
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import { DictionaryItem } from '../types/dictionary';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import { playAudio } from '../utils/audio';
import { getDatabase, getAllFromStore } from '../utils/databaseConfig';
import { JapVocDB } from '../types/database';
import WordCard from '../components/WordCard';

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

const Dictionary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [words, setWords] = useState<DictionaryItem[]>([]);
  const [readWords, setReadWords] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { getThemeClasses } = useAppTheme();
  const themeClasses = getThemeClasses();

  useEffect(() => {
    const loadWords = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize database and import data if needed
        const isInitialized = await isDictionaryInitialized();
        if (!isInitialized) {
          console.log('Dictionary not initialized, importing data...');
          const result = await importDictionaryData();
          if (!result.success) {
            throw new Error(result.error || 'Failed to import dictionary data');
          }
          console.log(`Successfully imported ${result.count} words`);
        }

        // Get database instance and load words
        const db = await getDatabase();
        const wordList = await getAllFromStore<DictionaryItem>(db, 'words');
        
        if (!wordList || wordList.length === 0) {
          throw new Error('No words found in database');
        }
        
        setWords(wordList);
        console.log(`Successfully loaded ${wordList.length} words`);
        
        // Load read words from localStorage
        const savedReadWords = localStorage.getItem('readWords');
        if (savedReadWords) {
          setReadWords(new Set(JSON.parse(savedReadWords)));
        }
      } catch (err) {
        console.error('Error loading words:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dictionary words');
      } finally {
        setIsLoading(false);
      }
    };

    loadWords();
  }, []);

  const handleMarkAsRead = (wordId: string) => {
    setReadWords(prev => {
      const newReadWords = new Set(prev);
      if (newReadWords.has(wordId)) {
        newReadWords.delete(wordId);
      } else {
        newReadWords.add(wordId);
      }
      // Save to localStorage
      localStorage.setItem('readWords', JSON.stringify(Array.from(newReadWords)));
      return newReadWords;
    });
  };

  const filteredWords = useMemo(() => {
    return words.filter(word => {
      const matchesSearch = 
        word.japanese.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.romaji.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || word.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [words, searchTerm, selectedCategory, selectedDifficulty]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(words.map(word => word.category));
    return Array.from(uniqueCategories).sort();
  }, [words]);

  const progress = useMemo(() => {
    if (words.length === 0) return 0;
    return (readWords.size / words.length) * 100;
  }, [words.length, readWords.size]);

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
          Search and explore Japanese words with detailed meanings, examples, and audio pronunciation.
        </Typography>
        <Box sx={{ maxWidth: '600px', mx: 'auto', mt: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
            Progress: {Math.round(progress)}% ({readWords.size} of {words.length} words)
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
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={selectedDifficulty}
                  label="Difficulty"
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Results */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {filteredWords.length} words found
        </Typography>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {filteredWords.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              onMarkAsRead={handleMarkAsRead}
              isRead={readWords.has(word.id)}
            />
          ))}
        </Box>
        {filteredWords.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No words found matching your search criteria.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Dictionary; 