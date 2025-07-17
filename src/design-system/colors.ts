// Light Theme Color System - Japanese Learning Platform
// Based on warm, inviting beige tones with Japanese cultural accents

export const colors = {
  // Primary Background Colors
  background: {
    primary: '#FAF0E6',    // Warm beige main background
    secondary: '#F5F0E8',  // Slightly darker beige for cards
    tertiary: '#F0E8D8',   // Even darker for hover states
  },

  // Text Colors
  text: {
    primary: '#2D2D2D',    // Dark gray for main text
    secondary: '#5A5A5A',  // Medium gray for secondary text
    muted: '#8A8A8A',      // Light gray for muted text
    inverse: '#FFFFFF',    // White text for dark backgrounds
  },

  // Japanese Cultural Colors
  japanese: {
    red: '#D45A38',        // Japanese red for primary actions
    redLight: '#E67A5A',   // Lighter red for hover states
    redDark: '#B84A28',    // Darker red for active states
    
    // Torii gate colors
    toriiRed: '#C44536',   // Traditional torii red
    toriiBrown: '#8B4513', // Wooden brown
    
    // Earth tones
    earth: {
      light: '#D2B48C',    // Light tan
      medium: '#BC8F8F',   // Rosy brown
      dark: '#8B7355',     // Dark tan
    },
  },

  // Accent Colors
  accent: {
    yellow: '#FFD700',     // Gold for achievements
    orange: '#FFA500',     // Orange for progress bars
    green: '#4CAF50',      // Green for success states
    blue: '#2196F3',       // Blue for info states
  },

  // Status Colors
  status: {
    success: '#4CAF50',    // Green for success
    warning: '#FF9800',    // Orange for warnings
    error: '#F44336',      // Red for errors
    info: '#2196F3',       // Blue for info
  },

  // Border Colors
  border: {
    light: '#E0E0E0',      // Light gray borders
    medium: '#D0D0D0',     // Medium gray borders
    dark: '#B0B0B0',       // Dark gray borders
    accent: '#D45A38',     // Japanese red borders
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',   // Very subtle shadows
    medium: 'rgba(0, 0, 0, 0.1)',   // Medium shadows
    dark: 'rgba(0, 0, 0, 0.15)',    // Darker shadows
  },

  // Gradient Colors
  gradient: {
    primary: 'linear-gradient(135deg, #D45A38 0%, #E67A5A 100%)',
    secondary: 'linear-gradient(135deg, #F5F0E8 0%, #E0E0E0 100%)',
    background: 'linear-gradient(135deg, #FAF0E6 0%, #F5F0E8 100%)',
  },
};

// Dark Theme Color System
export const darkColors = {
  // Primary Background Colors
  background: {
    primary: '#1B1C22',    // Deep, warm night blue/black
    secondary: '#23242A',  // Slightly lighter dark for cards
    tertiary: '#2A2B32',   // Even lighter for hover states
    elevated: '#2F3038',   // For elevated elements
  },

  // Text Colors
  text: {
    primary: '#F5F5F5',    // Light gray for main text
    secondary: '#EAEAEA',  // Slightly darker for secondary text
    muted: '#B0B0B0',      // Muted gray for less important text
    inverse: '#1B1C22',    // Dark text for light backgrounds
  },

  // Japanese Cultural Colors (same as light theme for consistency)
  japanese: {
    red: '#D45A38',        // Japanese red for primary actions
    redLight: '#E67A5A',   // Lighter red for hover states
    redDark: '#B84A28',    // Darker red for active states
    
    // Torii gate colors
    toriiRed: '#C44536',   // Traditional torii red
    toriiBrown: '#8B4513', // Wooden brown
    
    // Earth tones (adjusted for dark theme)
    earth: {
      light: '#A89070',    // Darker tan for dark theme
      medium: '#9A7A7A',   // Darker rosy brown
      dark: '#6B5A45',     // Darker tan
    },
  },

  // Accent Colors (enhanced for dark theme)
  accent: {
    yellow: '#F4B942',     // Enhanced gold for dark theme
    orange: '#FF8C42',     // Enhanced orange for progress bars
    green: '#4CAF50',      // Green for success states
    blue: '#2196F3',       // Blue for info states
  },

  // Status Colors
  status: {
    success: '#4CAF50',    // Green for success
    warning: '#FF9800',    // Orange for warnings
    error: '#F44336',      // Red for errors
    info: '#2196F3',       // Blue for info
  },

  // Border Colors
  border: {
    light: '#3A3B42',      // Dark gray borders
    medium: '#4A4B52',     // Medium dark gray borders
    dark: '#5A5B62',       // Lighter dark gray borders
    accent: '#D45A38',     // Japanese red borders
  },

  // Shadow Colors (enhanced for dark theme)
  shadow: {
    light: 'rgba(0, 0, 0, 0.3)',    // Subtle shadows for dark theme
    medium: 'rgba(0, 0, 0, 0.5)',   // Medium shadows
    dark: 'rgba(0, 0, 0, 0.7)',     // Darker shadows
    glow: 'rgba(212, 90, 56, 0.3)', // Japanese red glow
  },

  // Gradient Colors
  gradient: {
    primary: 'linear-gradient(135deg, #D45A38 0%, #E67A5A 100%)',
    secondary: 'linear-gradient(135deg, #23242A 0%, #2A2B32 100%)',
    background: 'linear-gradient(135deg, #1B1C22 0%, #23242A 100%)',
    card: 'linear-gradient(135deg, #23242A 0%, #2F3038 100%)',
  },
};

// Color utility functions
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color not found: ${path}`);
      return '#000000';
    }
  }
  
  return value;
};

// Theme-aware color getters
export const getThemeColors = (isDark: boolean = false) => {
  if (isDark) {
    return darkColors;
  }
  
  return colors;
};

// Dark theme specific utility
export const getDarkColor = (path: string) => {
  const keys = path.split('.');
  let value: any = darkColors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Dark color not found: ${path}`);
      return '#000000';
    }
  }
  
  return value;
}; 