// Design System - Japanese Learning Platform
// Complete design system with colors, typography, spacing, shadows, and border radius

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './borderRadius';

// Design system configuration
export const designSystem = {
  name: 'Japanese Learning Platform Design System',
  version: '1.0.0',
  description: 'A comprehensive design system for a gamified Japanese learning platform with warm, inviting aesthetics',
  
  // Theme configuration
  themes: {
    light: {
      name: 'Light Theme',
      description: 'Warm beige background with Japanese cultural accents',
      colors: 'colors',
      typography: 'typography',
      spacing: 'spacing',
      shadows: 'shadows',
      borderRadius: 'borderRadius',
    },
    dark: {
      name: 'Dark Theme',
      description: 'Dark theme for future implementation',
      colors: 'darkColors',
      typography: 'typography',
      spacing: 'spacing',
      shadows: 'darkShadows',
      borderRadius: 'borderRadius',
    },
  },

  // Breakpoints for responsive design
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
    ultra: '1536px',
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Animation durations
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    easing: {
      ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    },
  },
};

// Utility function to get design system values
export const getDesignSystemValue = (category: string, path: string) => {
  const categories = {
    colors: () => import('./colors').then(m => m.getColor(path)),
    typography: () => import('./typography').then(m => m.getTypography(path)),
    spacing: () => import('./spacing').then(m => m.getSpacing(path)),
    shadows: () => import('./shadows').then(m => m.getShadow(path)),
    borderRadius: () => import('./borderRadius').then(m => m.getBorderRadius(path)),
  };

  const getter = categories[category as keyof typeof categories];
  if (!getter) {
    console.warn(`Design system category not found: ${category}`);
    return null;
  }

  return getter();
};

// CSS-in-JS helper for complete component styling
export const getComponentStyles = (component: string, variant: string = 'default') => {
  const componentStyles = {
    button: {
      primary: {
        backgroundColor: '#D45A38',
        color: '#FFFFFF',
        borderRadius: '0.75rem',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        boxShadow: '0 4px 6px -1px rgba(212, 90, 56, 0.2), 0 2px 4px -1px rgba(212, 90, 56, 0.1)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: '#E67A5A',
          boxShadow: '0 10px 15px -3px rgba(212, 90, 56, 0.2), 0 4px 6px -2px rgba(212, 90, 56, 0.1)',
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        },
      },
      secondary: {
        backgroundColor: '#F5F0E8',
        color: '#2D2D2D',
        borderRadius: '0.5rem',
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #E0E0E0',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: '#F0E8D8',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    card: {
      default: {
        backgroundColor: '#F5F0E8',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #E0E0E0',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-2px)',
        },
      },
      elevated: {
        backgroundColor: '#FFFFFF',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: 'none',
      },
    },
    input: {
      default: {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E0E0E0',
        borderRadius: '0.375rem',
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        color: '#2D2D2D',
        transition: 'all 0.3s ease',
        '&:focus': {
          outline: 'none',
          borderColor: '#D45A38',
          boxShadow: '0 0 0 3px rgba(212, 90, 56, 0.1)',
        },
      },
    },
    navigation: {
      default: {
        backgroundColor: 'rgba(250, 240, 230, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E0E0E0',
        padding: '1rem 1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  };

  const component = componentStyles[component as keyof typeof componentStyles];
  if (!component) {
    console.warn(`Component styles not found: ${component}`);
    return {};
  }

  const variantStyles = component[variant as keyof typeof component];
  if (!variantStyles) {
    console.warn(`Component variant not found: ${variant}`);
    return component.default || {};
  }

  return variantStyles;
};

// Export default design system
export default designSystem; 