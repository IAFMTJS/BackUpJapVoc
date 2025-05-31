import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { DictionaryItem } from '../types/dictionary';
import { useDictionary } from '../context/DictionaryContext';
import WordCard from './WordCard';

interface DictionaryListProps {
  mode?: 'all' | 'hiragana' | 'katakana' | 'kanji';
}

const DictionaryList: React.FC<DictionaryListProps> = ({ mode = 'all' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { words, isLoading, error, searchWords, addWord, updateWord, deleteWord } = useDictionary();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWords, setFilteredWords] = useState<DictionaryItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<DictionaryItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newWord, setNewWord] = useState<Partial<DictionaryItem>>({
    japanese: '',
    english: '',
    romaji: '',
    level: 1,
    category: '',
    jlptLevel: 'N5',
    examples: []
  });

  useEffect(() => {
    if (searchQuery.trim() === '') {
      const filteredByMode = words.filter(word => {
        if (mode === 'all') return true;
        if (mode === 'hiragana') return word.isHiragana;
        if (mode === 'katakana') return word.isKatakana;
        if (mode === 'kanji') return word.kanji && word.kanji.length > 0;
        return true;
      });
      setFilteredWords(filteredByMode);
    } else {
      const searchResults = searchWords(searchQuery);
      const filteredByMode = searchResults.filter(word => {
        if (mode === 'all') return true;
        if (mode === 'hiragana') return word.isHiragana;
        if (mode === 'katakana') return word.isKatakana;
        if (mode === 'kanji') return word.kanji && word.kanji.length > 0;
        return true;
      });
      setFilteredWords(filteredByMode);
    }
  }, [searchQuery, words, searchWords, mode]);

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
        Error loading dictionary: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search words..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Typography variant="h6" sx={{ mb: 2 }}>
        {filteredWords.length} words found
      </Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {filteredWords.map((word) => (
          <WordCard key={word.id} word={word} />
        ))}
      </Box>
    </Box>
  );
};

export default DictionaryList; 