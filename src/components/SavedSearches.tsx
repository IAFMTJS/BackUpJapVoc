import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stack, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, TextField, InputAdornment, Chip, Tooltip, Menu, MenuItem } from '@mui/material';
import { Search as SearchIcon, Delete as DeleteIcon, Edit as EditIcon, MoreVert as MoreVertIcon, Save as SaveIcon, History as HistoryIcon, Bookmark as BookmarkIcon, Label as LabelIcon } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import safeLocalStorage from '../utils/safeLocalStorage';

interface SavedSearch {
  id: string;
  name: string;
  term: string;
  filters: {
    jlptLevel: string[];
    wordType: string[];
    difficulty: string[];
    frequency: string[];
    radicals: string[];
  };
  labels: string[];
  lastUsed: Date;
  createdAt: Date;
}

interface SavedSearchesProps {
  open: boolean;
  searches: SavedSearch[];
  history: string[];
  onClose: () => void;
  onSelect: (search: { term: string; filters: SavedSearch['filters'] }) => void;
}

const SavedSearches: React.FC<SavedSearchesProps> = ({
  open,
  searches: initialSearches,
  history,
  onClose,
  onSelect
}) => {
  const { theme } = useTheme();
  const [searches, setSearches] = useState<SavedSearch[]>(initialSearches);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSearch, setSelectedSearch] = useState<SavedSearch | null>(null);
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    try {
      const saved = safeLocalStorage.getItem('savedSearches');
      if (saved) {
        setSearches(JSON.parse(saved).map((search: any) => ({
          ...search,
          lastUsed: new Date(search.lastUsed),
          createdAt: new Date(search.createdAt)
        })));
      }
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  }, []);

  const handleSaveSearch = (search: SavedSearch) => {
    const updatedSearches = [...searches];
    const index = updatedSearches.findIndex(s => s.id === search.id);
    
    if (index >= 0) {
      updatedSearches[index] = search;
    } else {
      updatedSearches.push(search);
    }

    setSearches(updatedSearches);
    safeLocalStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
    setEditingSearch(null);
  };

  const handleDeleteSearch = (searchId: string) => {
    const updatedSearches = searches.filter(s => s.id !== searchId);
    setSearches(updatedSearches);
    safeLocalStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
    setMenuAnchor(null);
    setSelectedSearch(null);
  };

  const handleAddLabel = () => {
    if (!selectedSearch || !newLabel.trim()) return;

    const updatedSearch = {
      ...selectedSearch,
      labels: [...selectedSearch.labels, newLabel.trim()]
    };

    handleSaveSearch(updatedSearch);
    setNewLabel('');
    setMenuAnchor(null);
  };

  const handleRemoveLabel = (label: string) => {
    if (!selectedSearch) return;

    const updatedSearch = {
      ...selectedSearch,
      labels: selectedSearch.labels.filter(l => l !== label)
    };

    handleSaveSearch(updatedSearch);
  };

  const filteredSearches = searches.filter(search => {
    const matchesSearch = searchTerm === '' ||
      search.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      search.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      search.labels.some(label => label.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const renderSearchItem = (search: SavedSearch) => (
    <ListItem
      key={search.id}
      sx={{
        bgcolor: theme.palette.background.paper,
        mb: 1,
        borderRadius: 1,
        '&:hover': {
          bgcolor: theme.palette.action.hover
        }
      }}
    >
      <ListItemText
        primary={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1">
              {search.name}
            </Typography>
            {search.labels.map(label => (
              <Chip
                key={label}
                label={label}
                size="small"
                onDelete={() => handleRemoveLabel(label)}
                sx={{ height: 20 }}
              />
            ))}
          </Stack>
        }
        secondary={
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {search.term}
            </Typography>
            <Stack direction="row" spacing={1}>
              {search.filters.jlptLevel.map(level => (
                <Chip
                  key={level}
                  label={`JLPT ${level}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20 }}
                />
              ))}
              {search.filters.radicals.map(radical => (
                <Chip
                  key={radical}
                  label={`Radical: ${radical}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20 }}
                />
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Last used: {search.lastUsed.toLocaleDateString()}
            </Typography>
          </Stack>
        }
      />
      <ListItemSecondaryAction>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Use this search">
            <IconButton
              edge="end"
              onClick={() => {
                onSelect({ term: search.term, filters: search.filters });
                onClose();
              }}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="More options">
            <IconButton
              edge="end"
              onClick={(e) => {
                setMenuAnchor(e.currentTarget);
                setSelectedSearch(search);
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </ListItemSecondaryAction>
    </ListItem>
  );

  const renderHistoryItem = (term: string, index: number) => (
    <ListItem
      key={index}
      sx={{
        bgcolor: theme.palette.background.paper,
        mb: 1,
        borderRadius: 1,
        '&:hover': {
          bgcolor: theme.palette.action.hover
        }
      }}
    >
      <ListItemText
        primary={term}
        secondary={`Used ${index + 1} ${index === 0 ? 'time' : 'times'}`}
      />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          onClick={() => {
            onSelect({ term, filters: {} });
            onClose();
          }}
        >
          <SearchIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Saved Searches & History</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant={activeTab === 'saved' ? 'contained' : 'outlined'}
              startIcon={<BookmarkIcon />}
              onClick={() => setActiveTab('saved')}
            >
              Saved
            </Button>
            <Button
              variant={activeTab === 'history' ? 'contained' : 'outlined'}
              startIcon={<HistoryIcon />}
              onClick={() => setActiveTab('history')}
            >
              History
            </Button>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder={`Search ${activeTab === 'saved' ? 'saved searches' : 'history'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          {activeTab === 'saved' ? (
            <List>
              {filteredSearches.map(renderSearchItem)}
            </List>
          ) : (
            <List>
              {history
                .filter(term => term.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(renderHistoryItem)}
            </List>
          )}
        </Stack>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => {
            setMenuAnchor(null);
            setSelectedSearch(null);
          }}
        >
          <MenuItem onClick={() => {
            setEditingSearch(selectedSearch);
            setMenuAnchor(null);
          }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => {
            setNewLabel('');
            setMenuAnchor(null);
          }}>
            <LabelIcon sx={{ mr: 1 }} />
            Add Label
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => selectedSearch && handleDeleteSearch(selectedSearch.id)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {editingSearch && (
          <Dialog
            open={Boolean(editingSearch)}
            onClose={() => setEditingSearch(null)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Edit Saved Search</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Name"
                  value={editingSearch.name}
                  onChange={(e) => setEditingSearch({
                    ...editingSearch,
                    name: e.target.value
                  })}
                  fullWidth
                />
                <TextField
                  label="Search Term"
                  value={editingSearch.term}
                  onChange={(e) => setEditingSearch({
                    ...editingSearch,
                    term: e.target.value
                  })}
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingSearch(null)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => handleSaveSearch(editingSearch)}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {selectedSearch && (
          <Dialog
            open={Boolean(selectedSearch) && !editingSearch}
            onClose={() => setSelectedSearch(null)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Add Label</DialogTitle>
            <DialogContent>
              <TextField
                label="New Label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                fullWidth
                sx={{ mt: 1 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSearch(null)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleAddLabel}
                disabled={!newLabel.trim()}
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavedSearches; 