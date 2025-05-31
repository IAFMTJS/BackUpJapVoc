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
  useMediaQuery
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

const DictionaryList: React.FC = () => {
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
      setFilteredWords(words);
    } else {
      setFilteredWords(searchWords(searchQuery));
    }
  }, [searchQuery, words, searchWords]);

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

  const handleAddWord = async () => {
    try {
      await addWord(newWord as Omit<DictionaryItem, 'id' | 'createdAt' | 'updatedAt'>);
      setIsAddDialogOpen(false);
      setNewWord({
        japanese: '',
        english: '',
        romaji: '',
        level: 1,
        category: '',
        jlptLevel: 'N5',
        examples: []
      });
    } catch (err) {
      console.error('Error adding word:', err);
      // Handle error (show error message to user)
    }
  };

  const handleUpdateWord = async () => {
    if (selectedWord) {
      try {
        await updateWord(selectedWord);
        setIsEditDialogOpen(false);
      } catch (err) {
        console.error('Error updating word:', err);
        // Handle error (show error message to user)
      }
    }
  };

  const handleDeleteWord = async () => {
    if (selectedWord) {
      try {
        await deleteWord(selectedWord.id);
        setIsDeleteDialogOpen(false);
        setSelectedWord(null);
      } catch (err) {
        console.error('Error deleting word:', err);
        // Handle error (show error message to user)
      }
    }
  };

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