// Border Radius System - Japanese Learning Platform
// Based on rounded, friendly corners that create an inviting feel

export const borderRadius = {
  // Base border radius values
  none: '0',
  sm: '0.125rem',    // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px - Primary button radius
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',    // Fully rounded
  
  // Component-specific border radius
  component: {
    // Button border radius
    button: {
      small: '0.375rem',   // 6px
      medium: '0.5rem',    // 8px
      large: '0.75rem',    // 12px - Primary action buttons
      pill: '9999px',      // Fully rounded for pill buttons
    },

    // Card border radius
    card: {
      small: '0.5rem',     // 8px
      medium: '0.75rem',   // 12px
      large: '1rem',       // 16px
    },

    // Input border radius
    input: {
      small: '0.25rem',    // 4px
      medium: '0.375rem',  // 6px
      large: '0.5rem',     // 8px
    },

    // Modal border radius
    modal: {
      small: '0.75rem',    // 12px
      medium: '1rem',      // 16px
      large: '1.5rem',     // 24px
    },

    // Avatar border radius
    avatar: {
      small: '0.25rem',    // 4px
      medium: '0.5rem',    // 8px
      large: '0.75rem',    // 12px
      round: '50%',        // Circular avatars
    },

    // Badge border radius
    badge: {
      small: '0.125rem',   // 2px
      medium: '0.25rem',   // 4px
      large: '0.375rem',   // 6px
      pill: '9999px',      // Fully rounded
    },

    // Progress bar border radius
    progress: {
      track: '0.25rem',    // 4px
      fill: '0.25rem',     // 4px
    },

    // Tooltip border radius
    tooltip: '0.375rem',   // 6px

    // Dropdown border radius
    dropdown: '0.5rem',    // 8px

    // Navigation border radius
    nav: {
      item: '0.375rem',    // 6px
      button: '0.5rem',    // 8px
    },

    // Tab border radius
    tab: {
      item: '0.375rem',    // 6px
      active: '0.5rem',    // 8px
    },

    // Alert border radius
    alert: '0.5rem',       // 8px

    // Toast border radius
    toast: '0.5rem',       // 8px

    // Accordion border radius
    accordion: '0.5rem',   // 8px

    // Toggle border radius
    toggle: '9999px',      // Fully rounded

    // Switch border radius
    switch: '9999px',      // Fully rounded

    // Checkbox border radius
    checkbox: '0.125rem',  // 2px

    // Radio border radius
    radio: '50%',          // Circular
  },

  // Layout-specific border radius
  layout: {
    // Container border radius
    container: '0.75rem',  // 12px

    // Sidebar border radius
    sidebar: '0 0.75rem 0.75rem 0',  // Rounded right corners

    // Header border radius
    header: '0 0 0.75rem 0.75rem',   // Rounded bottom corners

    // Footer border radius
    footer: '0.75rem 0.75rem 0 0',   // Rounded top corners

    // Main content border radius
    main: '0.5rem',        // 8px

    // Section border radius
    section: '0.75rem',    // 12px
  },

  // Special border radius for Japanese cultural elements
  japanese: {
    // Torii gate inspired elements
    torii: '0.5rem 0.5rem 0 0',      // Rounded top corners only

    // Traditional paper elements
    paper: '0.25rem',                // Subtle rounding

    // Zen garden inspired elements
    zen: '0.125rem',                 // Very subtle rounding

    // Cherry blossom inspired elements
    sakura: '50%',                   // Circular elements

    // Traditional seal inspired elements
    seal: '0.375rem',                // Medium rounding
  },

  // Responsive border radius
  responsive: {
    // Mobile border radius (slightly smaller for touch targets)
    mobile: {
      button: '0.5rem',              // 8px
      card: '0.5rem',                // 8px
      input: '0.25rem',              // 4px
    },

    // Tablet border radius
    tablet: {
      button: '0.625rem',            // 10px
      card: '0.625rem',              // 10px
      input: '0.375rem',             // 6px
    },

    // Desktop border radius
    desktop: {
      button: '0.75rem',             // 12px
      card: '0.75rem',               // 12px
      input: '0.5rem',               // 8px
    },
  },
};

// Border radius utility functions
export const getBorderRadius = (path: string) => {
  const keys = path.split('.');
  let value: any = borderRadius;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Border radius not found: ${path}`);
      return '0';
    }
  }
  
  return value;
};

// CSS-in-JS helper for border radius
export const getBorderRadiusCSS = (path: string) => {
  const borderRadiusValue = getBorderRadius(path);
  return {
    borderRadius: borderRadiusValue,
  };
};

// Common border radius combinations
export const borderRadiusPresets = {
  // Button presets
  button: {
    small: {
      borderRadius: borderRadius.component.button.small,
    },
    medium: {
      borderRadius: borderRadius.component.button.medium,
    },
    large: {
      borderRadius: borderRadius.component.button.large,
    },
    pill: {
      borderRadius: borderRadius.component.button.pill,
    },
  },

  // Card presets
  card: {
    small: {
      borderRadius: borderRadius.component.card.small,
    },
    medium: {
      borderRadius: borderRadius.component.card.medium,
    },
    large: {
      borderRadius: borderRadius.component.card.large,
    },
  },

  // Input presets
  input: {
    small: {
      borderRadius: borderRadius.component.input.small,
    },
    medium: {
      borderRadius: borderRadius.component.input.medium,
    },
    large: {
      borderRadius: borderRadius.component.input.large,
    },
  },

  // Modal presets
  modal: {
    small: {
      borderRadius: borderRadius.component.modal.small,
    },
    medium: {
      borderRadius: borderRadius.component.modal.medium,
    },
    large: {
      borderRadius: borderRadius.component.modal.large,
    },
  },

  // Avatar presets
  avatar: {
    small: {
      borderRadius: borderRadius.component.avatar.small,
    },
    medium: {
      borderRadius: borderRadius.component.avatar.medium,
    },
    large: {
      borderRadius: borderRadius.component.avatar.large,
    },
    round: {
      borderRadius: borderRadius.component.avatar.round,
    },
  },
}; 