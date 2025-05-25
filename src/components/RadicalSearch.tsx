import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stack, Grid, Paper, Chip, IconButton, Tooltip, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon, Info as InfoIcon } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

interface RadicalSearchProps {
  open: boolean;
  selectedRadicals: string[];
  onClose: () => void;
  onSelect: (radicals: string[]) => void;
}

interface Radical {
  character: string;
  meaning: string;
  strokes: number;
  frequency: number;
  examples: string[];
}

const RadicalSearch: React.FC<RadicalSearchProps> = ({
  open,
  selectedRadicals,
  onClose,
  onSelect
}) => {
  const { theme } = useTheme();
  const [radicals, setRadicals] = useState<Radical[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedRadicals);
  const [hoveredRadical, setHoveredRadical] = useState<Radical | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRadicals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch radicals data from KanjiVG API
        const response = await fetch('https://kanjivg.tagaini.net/radicals.json');
        if (!response.ok) {
          throw new Error('Failed to fetch radicals data');
        }

        const data = await response.json();
        const radicalsData: Radical[] = Object.entries(data).map(([char, info]: [string, any]) => ({
          character: char,
          meaning: info.meaning || '',
          strokes: info.strokes || 0,
          frequency: info.frequency || 0,
          examples: info.examples || []
        }));

        setRadicals(radicalsData.sort((a, b) => a.strokes - b.strokes));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load radicals data');
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchRadicals();
    }
  }, [open]);

  useEffect(() => {
    setSelected(selectedRadicals);
  }, [selectedRadicals]);

  const filteredRadicals = radicals.filter(radical => {
    const matchesSearch = searchTerm === '' ||
      radical.character.includes(searchTerm) ||
      radical.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleRadicalClick = (radical: string) => {
    setSelected(prev => {
      const newSelected = prev.includes(radical)
        ? prev.filter(r => r !== radical)
        : [...prev, radical];
      return newSelected;
    });
  };

  const handleClearSelection = () => {
    setSelected([]);
  };

  const handleApply = () => {
    onSelect(selected);
    onClose();
  };

  const renderRadicalCard = (radical: Radical) => {
    const isSelected = selected.includes(radical.character);

    return (
      <Paper
        key={radical.character}
        elevation={isSelected ? 3 : 1}
        sx={{
          p: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          bgcolor: isSelected ? theme.palette.primary.main : theme.palette.background.paper,
          color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 2
          }
        }}
        onClick={() => handleRadicalClick(radical.character)}
        onMouseEnter={() => setHoveredRadical(radical)}
        onMouseLeave={() => setHoveredRadical(null)}
      >
        <Stack spacing={1} alignItems="center">
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Noto Sans JP, sans-serif',
              fontSize: '2rem'
            }}
          >
            {radical.character}
          </Typography>
          <Typography variant="body2" align="center">
            {radical.meaning}
          </Typography>
          <Chip
            label={`${radical.strokes} strokes`}
            size="small"
            color={isSelected ? 'default' : 'primary'}
            variant={isSelected ? 'filled' : 'outlined'}
          />
        </Stack>
      </Paper>
    );
  };

  const renderRadicalInfo = () => {
    if (!hoveredRadical) return null;

    return (
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mt: 2,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h6">
            {hoveredRadical.character} - {hoveredRadical.meaning}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Frequency: {hoveredRadical.frequency}
          </Typography>
          {hoveredRadical.examples.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Example Kanji:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {hoveredRadical.examples.map(kanji => (
                  <Chip
                    key={kanji}
                    label={kanji}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </>
          )}
        </Stack>
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Search by Radicals</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`${selected.length} selected`}
              color="primary"
              variant="outlined"
            />
            {selected.length > 0 && (
              <IconButton
                size="small"
                onClick={handleClearSelection}
                color="error"
              >
                <ClearIcon />
              </IconButton>
            )}
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Search radicals by character or meaning..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Loading radicals...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {filteredRadicals.map(radical => (
                  <Grid item xs={6} sm={4} md={3} key={radical.character}>
                    {renderRadicalCard(radical)}
                  </Grid>
                ))}
              </Grid>
              {renderRadicalInfo()}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={selected.length === 0}
        >
          Apply Selection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RadicalSearch; 