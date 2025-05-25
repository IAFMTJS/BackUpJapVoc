import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, Stack, Divider, Paper } from '@mui/material';
import { useTheme } from '../context/ThemeContext';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

interface Shortcut {
  key: string;
  description: string;
  category: 'Navigation' | 'Search' | 'View' | 'Actions';
}

const shortcuts: Shortcut[] = [
  // Navigation
  { key: 'Ctrl + K', description: 'Show keyboard shortcuts', category: 'Navigation' },
  { key: 'Ctrl + F', description: 'Focus search input', category: 'Navigation' },
  { key: 'Esc', description: 'Close current dialog/modal', category: 'Navigation' },
  { key: 'Ctrl + G', description: 'Toggle grid/list view', category: 'Navigation' },
  
  // Search
  { key: 'Ctrl + R', description: 'Open radical search', category: 'Search' },
  { key: 'Ctrl + S', description: 'Save current search', category: 'Search' },
  { key: 'Ctrl + H', description: 'Show search history', category: 'Search' },
  { key: 'Ctrl + L', description: 'Clear search filters', category: 'Search' },
  
  // View
  { key: 'Ctrl + D', description: 'Toggle dark mode', category: 'View' },
  { key: 'Ctrl + +', description: 'Increase font size', category: 'View' },
  { key: 'Ctrl + -', description: 'Decrease font size', category: 'View' },
  { key: 'Ctrl + 0', description: 'Reset font size', category: 'View' },
  
  // Actions
  { key: 'Space', description: 'Play/pause stroke animation', category: 'Actions' },
  { key: '→', description: 'Next stroke', category: 'Actions' },
  { key: '←', description: 'Previous stroke', category: 'Actions' },
  { key: 'Ctrl + P', description: 'Add to spaced repetition', category: 'Actions' },
  { key: 'Ctrl + E', description: 'Show example sentences', category: 'Actions' },
  { key: 'Ctrl + I', description: 'Show word info', category: 'Actions' }
];

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ open, onClose }) => {
  const { theme } = useTheme();

  const renderShortcutGroup = (category: Shortcut['category']) => {
    const categoryShortcuts = shortcuts.filter(s => s.category === category);

    return (
      <Box key={category} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, color: theme.palette.primary.main }}>
          {category}
        </Typography>
        <Stack spacing={1}>
          {categoryShortcuts.map(shortcut => (
            <Paper
              key={shortcut.key}
              elevation={1}
              sx={{
                p: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: theme.palette.background.paper,
                '&:hover': {
                  bgcolor: theme.palette.action.hover
                }
              }}
            >
              <Typography variant="body2">
                {shortcut.description}
              </Typography>
              <Box
                component="kbd"
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: theme.palette.text.primary
                }}
              >
                {shortcut.key}
              </Box>
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6">Keyboard Shortcuts</Typography>
          <Typography variant="caption" color="text.secondary">
            Press Esc to close
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {(['Navigation', 'Search', 'View', 'Actions'] as const).map(category => (
            <React.Fragment key={category}>
              {renderShortcutGroup(category)}
              {category !== 'Actions' && <Divider />}
            </React.Fragment>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcuts; 