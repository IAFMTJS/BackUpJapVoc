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
import safeLocalStorage from '../utils/safeLocalStorage';

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

const WordCard: React.FC<{ 
  word: SimpleDictionaryItem;
  onMarkAsRead: (wordId: string) => void;
  isRead: boolean;
}> = ({ word, onMarkAsRead, isRead }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const theme = useTheme();

  const handlePlayAudio = async () => {
    try {
      await playAudio(word.japanese);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  return (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        },
        position: 'relative',
        ...(isRead && {
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '8px',
            height: '100%',
            backgroundColor: theme.palette.success.main,
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px'
          }
        })
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="div" gutterBottom>
              {word.japanese}
              {word.kanji && word.kanji !== word.japanese && (
                <Typography 
                  component="span" 
                  variant="subtitle1" 
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  ({word.kanji})
                </Typography>
              )}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {word.romaji}
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Play pronunciation">
              <IconButton onClick={handlePlayAudio} size="small">
                <VolumeUpIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
              <IconButton onClick={toggleFavorite} size="small">
                {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={isRead ? "Mark as unread" : "Mark as read"}>
              <IconButton 
                onClick={() => onMarkAsRead(word.id)} 
                size="small"
                color={isRead ? "success" : "default"}
              >
                {isRead ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="body1" gutterBottom>
          {word.english}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
          {word.category && (
            <Chip 
              icon={<CategoryIcon />} 
              label={word.category} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          )}
          {word.level && (
            <Chip 
              icon={<SchoolIcon />} 
              label={`Level ${word.level}`} 
              size="small" 
              color="secondary" 
              variant="outlined" 
            />
          )}
          {word.jlptLevel && (
            <Chip 
              icon={<StarIcon />} 
              label={`JLPT ${word.jlptLevel}`} 
              size="small" 
              color="info" 
              variant="outlined" 
            />
          )}
        </Stack>

        {word.examples && word.examples.length > 0 && (
          <Box>
            <Button
              endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setIsExpanded(!isExpanded)}
              size="small"
              sx={{ mb: 1 }}
            >
              {isExpanded ? 'Hide Examples' : 'Show Examples'}
            </Button>
            <Collapse in={isExpanded}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                {word.examples.map((example, index) => (
                  <Box key={index} sx={{ mb: index < word.examples.length - 1 ? 2 : 0 }}>
                    <Typography variant="body2" gutterBottom>
                      {example}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Collapse>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const KnowingDictionary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [words, setWords] = useState<SimpleDictionaryItem[]>([]);
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
        // Load words from the dictionary_words.json file
        const response = await fetch('/data/dictionary_words.json');
        if (!response.ok) {
          throw new Error('Failed to load dictionary words');
        }
        const wordList = await response.json();
        setWords(wordList);
        
        // Load read words from localStorage
        const savedReadWords = safeLocalStorage.getItem('readWords');
        if (savedReadWords) {
          setReadWords(new Set(JSON.parse(savedReadWords)));
        }
      } catch (err) {
        console.error('Error loading words:', err);
        setError('Failed to load dictionary words');
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
      safeLocalStorage.setItem('readWords', JSON.stringify(Array.from(newReadWords)));
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
      const matchesLevel = selectedLevel === 'all' || word.level.toString() === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [words, searchTerm, selectedCategory, selectedLevel]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(words.map(word => word.category));
    return Array.from(uniqueCategories).sort();
  }, [words]);

  const levels = useMemo(() => {
    const uniqueLevels = new Set(words.map(word => word.level));
    return Array.from(uniqueLevels).sort((a, b) => a - b);
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
          Explore and learn Japanese vocabulary with detailed meanings, examples, and audio pronunciation.
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
      </Box>

      {/* Results */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {filteredWords.length} words found
        </Typography>
        <Grid container spacing={3}>
          {filteredWords.map((word) => (
            <Grid item xs={12} sm={6} md={4} key={word.id}>
              <WordCard 
                word={word} 
                onMarkAsRead={handleMarkAsRead}
                isRead={readWords.has(word.id)}
              />
            </Grid>
          ))}
        </Grid>
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

export default KnowingDictionary; 