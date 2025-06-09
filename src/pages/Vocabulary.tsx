import React, { useState, useEffect } from 'react';
import { useWords } from '../context/WordContext';
import { DictionaryItem } from '../types/dictionary';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  TextField,
  Button
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import safeLocalStorage from '../utils/safeLocalStorage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vocab-tabpanel-${index}`}
      aria-labelledby={`vocab-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const WordCard: React.FC<{ 
  word: DictionaryItem;
  onMarkAsLearned: (wordId: string) => void;
  isLearned: boolean;
}> = ({ word, onMarkAsLearned, isLearned }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);

  useEffect(() => {
    if (word.audioUrl) {
      const audioElement = new Audio(word.audioUrl);
      setAudio(audioElement);
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [word.audioUrl]);

  const handlePlayAudio = () => {
    if (audio) {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3
      },
      opacity: isLearned ? 0.7 : 1
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h5" component="div">
            {word.word}
          </Typography>
          <Box>
            {word.audioUrl && (
              <Tooltip title="Play audio">
                <IconButton onClick={handlePlayAudio} size="small">
                  <VolumeUpIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
              <IconButton onClick={toggleFavorite} size="small">
                {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={isLearned ? "Mark as unlearned" : "Mark as learned"}>
              <IconButton 
                onClick={() => onMarkAsLearned(word.id)} 
                size="small"
                color={isLearned ? "success" : "default"}
              >
                {isLearned ? <CheckIcon /> : <CloseIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {word.reading}
        </Typography>
        
        {showMeaning ? (
          <Typography variant="body1" paragraph>
            {word.meaning}
          </Typography>
        ) : (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setShowMeaning(true)}
            sx={{ mb: 2 }}
          >
            Show Meaning
          </Button>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {word.jlptLevel && (
            <Chip 
              label={`JLPT ${word.jlptLevel}`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}
          {word.level && (
            <Chip 
              label={`Level ${word.level}`} 
              size="small" 
              color="secondary" 
              variant="outlined"
            />
          )}
          {word.category && (
            <Chip 
              label={word.category} 
              size="small" 
              color="info" 
              variant="outlined"
            />
          )}
        </Stack>

        {word.example && showMeaning && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Example: {word.example}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const Vocabulary: React.FC = () => {
  const { words, isLoading, error, getWordsByLevel, getWordsByJLPT } = useWords();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWords, setFilteredWords] = useState<DictionaryItem[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());

  // Load learned words from localStorage
  useEffect(() => {
    try {
      const savedLearnedWords = safeLocalStorage.getItem('learnedWords');
      if (savedLearnedWords) {
        setLearnedWords(new Set(JSON.parse(savedLearnedWords)));
      }
    } catch (error) {
      console.error('Error loading learned words:', error);
    }
  }, []);

  // Save learned words to localStorage
  useEffect(() => {
    try {
      safeLocalStorage.setItem('learnedWords', JSON.stringify(Array.from(learnedWords)));
    } catch (error) {
      console.error('Error saving learned words:', error);
    }
  }, [learnedWords]);

  useEffect(() => {
    let filtered: DictionaryItem[] = [];
    
    switch (tabValue) {
      case 0: // All words
        filtered = words;
        break;
      case 1: // JLPT N5
        filtered = getWordsByJLPT('N5');
        break;
      case 2: // JLPT N4
        filtered = getWordsByJLPT('N4');
        break;
      case 3: // JLPT N3
        filtered = getWordsByJLPT('N3');
        break;
      case 4: // Level 1
        filtered = getWordsByLevel(1);
        break;
      case 5: // Level 2
        filtered = getWordsByLevel(2);
        break;
    }

    if (searchTerm) {
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.reading.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredWords(filtered);
  }, [tabValue, searchTerm, words, getWordsByLevel, getWordsByJLPT]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMarkAsLearned = (wordId: string) => {
    setLearnedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
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
        Error loading vocabulary: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Vocabulary
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Words" />
          <Tab label="JLPT N5" />
          <Tab label="JLPT N4" />
          <Tab label="JLPT N3" />
          <Tab label="Level 1" />
          <Tab label="Level 2" />
        </Tabs>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search words, readings, or meanings..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Box sx={{ 
        display: 'grid', 
        gap: 2, 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
      }}>
        {filteredWords.map((word) => (
          <WordCard 
            key={word.id} 
            word={word}
            onMarkAsLearned={handleMarkAsLearned}
            isLearned={learnedWords.has(word.id)}
          />
        ))}
      </Box>

      {filteredWords.length === 0 && (
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
          No words found matching your search.
        </Typography>
      )}
    </Box>
  );
};

export default Vocabulary; 