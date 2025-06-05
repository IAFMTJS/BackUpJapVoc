import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  VolumeUp as VolumeUpIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useProgress } from '../context/ProgressContext';
import { SimpleDictionaryItem } from '../types/dictionary';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import WordCard from '../components/WordCard';

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
      id={`favorites-tabpanel-${index}`}
      aria-labelledby={`favorites-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const FavoritesPage: React.FC = () => {
  const { progress, toggleFavorite } = useProgress();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterLevel, setFilterLevel] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  const favoritedWords = useMemo(() => {
    return Object.entries(progress.words)
      .filter(([_, word]) => word.favorite)
      .map(([id, word]) => ({
        id,
        ...word,
      })) as SimpleDictionaryItem[];
  }, [progress.words]);

  const filteredWords = useMemo(() => {
    return favoritedWords.filter((word) => {
      const matchesSearch =
        word.japanese.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.romaji.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = filterLevel === 'all' || word.level === filterLevel;

      return matchesSearch && matchesLevel;
    });
  }, [favoritedWords, searchTerm, filterLevel]);

  const sortedWords = useMemo(() => {
    return [...filteredWords].sort((a, b) => {
      switch (sortBy) {
        case 'japanese':
          return a.japanese.localeCompare(b.japanese);
        case 'english':
          return a.english.localeCompare(b.english);
        case 'level':
          return (a.level || '').localeCompare(b.level || '');
        case 'recent':
        default:
          return (b.lastStudied || 0) - (a.lastStudied || 0);
      }
    });
  }, [filteredWords, sortBy]);

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterLevel(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const playAudio = (word: SimpleDictionaryItem) => {
    // TODO: Implement audio playback
    console.log('Playing audio for:', word.japanese);
  };

  const handleToggleFavorite = (word: SimpleDictionaryItem) => {
    toggleFavorite(word.id);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Favorites
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="favorites tabs"
          centered
        >
          <Tab label="All Favorites" />
          <Tab label="Recently Added" />
          <Tab label="By Level" />
        </Tabs>
      </Paper>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={handleSortChange}
            startAdornment={<SortIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="recent">Recently Added</MenuItem>
            <MenuItem value="japanese">Japanese</MenuItem>
            <MenuItem value="english">English</MenuItem>
            <MenuItem value="level">Level</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter Level</InputLabel>
          <Select
            value={filterLevel}
            label="Filter Level"
            onChange={handleFilterChange}
            startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="all">All Levels</MenuItem>
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {sortedWords.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              onMarkAsLearned={handleToggleFavorite}
              isLearned={true}
            />
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {sortedWords
            .sort((a, b) => (b.lastStudied || 0) - (a.lastStudied || 0))
            .slice(0, 12)
            .map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onMarkAsLearned={handleToggleFavorite}
                isLearned={true}
              />
            ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <React.Fragment key={level}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                {level.charAt(0).toUpperCase() + level.slice(1)} Level
              </Typography>
              {sortedWords
                .filter((word) => word.level === level)
                .map((word) => (
                  <WordCard
                    key={word.id}
                    word={word}
                    onMarkAsLearned={handleToggleFavorite}
                    isLearned={true}
                  />
                ))}
            </React.Fragment>
          ))}
        </Box>
      </TabPanel>
    </Container>
  );
};

export default FavoritesPage; 