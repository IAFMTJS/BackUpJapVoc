// Shadow System - Japanese Learning Platform
// Based on subtle, soft shadows that provide depth without being overwhelming

export const shadows = {
  // Base shadows
  none: 'none',
  
  // Subtle shadows for cards and containers
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Inner shadows for pressed states
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Component-specific shadows
  component: {
    // Button shadows
    button: {
      default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      active: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      primary: '0 4px 6px -1px rgba(212, 90, 56, 0.2), 0 2px 4px -1px rgba(212, 90, 56, 0.1)',
      primaryHover: '0 10px 15px -3px rgba(212, 90, 56, 0.2), 0 4px 6px -2px rgba(212, 90, 56, 0.1)',
    },

    // Card shadows
    card: {
      default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },

    // Navigation shadows
    nav: {
      default: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      sticky: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },

    // Modal shadows
    modal: {
      backdrop: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      content: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },

    // Dropdown shadows
    dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',

    // Tooltip shadows
    tooltip: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',

    // Progress bar shadows
    progress: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',

    // Input shadows
    input: {
      default: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      focus: '0 0 0 3px rgba(212, 90, 56, 0.1)',
      error: '0 0 0 3px rgba(244, 67, 54, 0.1)',
    },

    // Badge shadows
    badge: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

    // Avatar shadows
    avatar: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',

    // Floating action button shadows
    fab: {
      default: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      active: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },
  },

  // Status-specific shadows
  status: {
    success: '0 4px 6px -1px rgba(76, 175, 80, 0.2), 0 2px 4px -1px rgba(76, 175, 80, 0.1)',
    warning: '0 4px 6px -1px rgba(255, 152, 0, 0.2), 0 2px 4px -1px rgba(255, 152, 0, 0.1)',
    error: '0 4px 6px -1px rgba(244, 67, 54, 0.2), 0 2px 4px -1px rgba(244, 67, 54, 0.1)',
    info: '0 4px 6px -1px rgba(33, 150, 243, 0.2), 0 2px 4px -1px rgba(33, 150, 243, 0.1)',
  },

  // Depth levels
  depth: {
    0: 'none',
    1: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    2: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    3: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    4: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    5: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Special effects
  effects: {
    // Glow effects for Japanese cultural elements
    japaneseGlow: '0 0 20px rgba(212, 90, 56, 0.3)',
    toriiGlow: '0 0 15px rgba(196, 69, 54, 0.2)',
    
    // Soft focus ring
    focusRing: '0 0 0 3px rgba(212, 90, 56, 0.1)',
    
    // Text shadows for emphasis
    text: {
      subtle: '0 1px 2px rgba(0, 0, 0, 0.1)',
      medium: '0 2px 4px rgba(0, 0, 0, 0.15)',
      strong: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
  },
};

// Shadow utility functions
export const getShadow = (path: string) => {
  const keys = path.split('.');
  let value: any = shadows;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Shadow not found: ${path}`);
      return 'none';
    }
  }
  
  return value;
};

// CSS-in-JS helper for shadows
export const getShadowCSS = (path: string) => {
  const shadowValue = getShadow(path);
  return {
    boxShadow: shadowValue,
  };
};

// Common shadow combinations
export const shadowPresets = {
  // Card presets
  card: {
    default: {
      boxShadow: shadows.component.card.default,
    },
    hover: {
      boxShadow: shadows.component.card.hover,
    },
    elevated: {
      boxShadow: shadows.component.card.elevated,
    },
  },

  // Button presets
  button: {
    default: {
      boxShadow: shadows.component.button.default,
    },
    hover: {
      boxShadow: shadows.component.button.hover,
    },
    active: {
      boxShadow: shadows.component.button.active,
    },
    primary: {
      boxShadow: shadows.component.button.primary,
    },
    primaryHover: {
      boxShadow: shadows.component.button.primaryHover,
    },
  },

  // Input presets
  input: {
    default: {
      boxShadow: shadows.component.input.default,
    },
    focus: {
      boxShadow: shadows.component.input.focus,
    },
    error: {
      boxShadow: shadows.component.input.error,
    },
  },

  // Navigation presets
  nav: {
    default: {
      boxShadow: shadows.component.nav.default,
    },
    sticky: {
      boxShadow: shadows.component.nav.sticky,
    },
  },
}; 