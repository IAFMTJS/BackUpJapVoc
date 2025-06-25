import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { DarkMode, LightMode, Brightness4 } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'dark', label: 'Dark', icon: <DarkMode /> },
    { id: 'light', label: 'Light', icon: <LightMode /> },
    { id: 'neon', label: 'Neon', icon: <Brightness4 /> },
  ] as const;

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'neon') => {
    setTheme(newTheme);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {themes.map(({ id, label, icon }) => (
        <Tooltip key={id} title={`Switch to ${label} theme`}>
          <IconButton
            onClick={() => handleThemeChange(id)}
            color={theme === id ? 'primary' : 'default'}
            size="small"
            sx={{
              bgcolor: theme === id ? 'primary.main' : 'transparent',
              color: theme === id ? 'primary.contrastText' : 'inherit',
              '&:hover': {
                bgcolor: theme === id ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            {icon}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};

export default ThemeToggle; 