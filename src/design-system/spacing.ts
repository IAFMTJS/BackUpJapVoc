// Spacing System - Japanese Learning Platform
// Based on comfortable, well-balanced spacing with plenty of whitespace

export const spacing = {
  // Base spacing units (4px grid system)
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px

  // Component-specific spacing
  component: {
    // Button spacing
    button: {
      padding: {
        small: '0.5rem 1rem',      // 8px 16px
        medium: '0.75rem 1.5rem',  // 12px 24px
        large: '1rem 2rem',        // 16px 32px
      },
      gap: '0.5rem',               // 8px between button elements
    },

    // Card spacing
    card: {
      padding: {
        small: '1rem',             // 16px
        medium: '1.5rem',          // 24px
        large: '2rem',             // 32px
      },
      margin: {
        bottom: '1.5rem',          // 24px
      },
      gap: '1rem',                 // 16px between card elements
    },

    // Form spacing
    form: {
      padding: '1.5rem',           // 24px
      gap: '1rem',                 // 16px between form elements
      fieldGap: '0.75rem',         // 12px between form fields
    },

    // Navigation spacing
    nav: {
      padding: '1rem 1.5rem',      // 16px 24px
      gap: '1.5rem',               // 24px between nav items
    },

    // Section spacing
    section: {
      padding: {
        small: '2rem 0',           // 32px vertical
        medium: '3rem 0',          // 48px vertical
        large: '4rem 0',           // 64px vertical
      },
      margin: {
        bottom: '2rem',            // 32px
      },
    },

    // Container spacing
    container: {
      padding: {
        small: '1rem',             // 16px
        medium: '1.5rem',          // 24px
        large: '2rem',             // 32px
      },
      maxWidth: {
        small: '640px',
        medium: '768px',
        large: '1024px',
        xlarge: '1280px',
      },
    },

    // Grid spacing
    grid: {
      gap: {
        small: '1rem',             // 16px
        medium: '1.5rem',          // 24px
        large: '2rem',             // 32px
      },
    },

    // List spacing
    list: {
      gap: '0.5rem',               // 8px between list items
      padding: '0.5rem 0',         // 8px vertical padding
    },

    // Modal spacing
    modal: {
      padding: '2rem',             // 32px
      gap: '1.5rem',               // 24px between modal elements
    },

    // Tooltip spacing
    tooltip: {
      padding: '0.5rem 0.75rem',   // 8px 12px
      margin: '0.25rem',           // 4px
    },
  },

  // Layout spacing
  layout: {
    // Page margins
    page: {
      margin: '0 auto',
      padding: '0 1rem',           // 0 16px
      maxWidth: '1200px',
    },

    // Header spacing
    header: {
      padding: '1rem 0',           // 16px vertical
      height: '4rem',              // 64px
    },

    // Footer spacing
    footer: {
      padding: '2rem 0',           // 32px vertical
      margin: '4rem 0 0 0',        // 64px top margin
    },

    // Sidebar spacing
    sidebar: {
      padding: '1.5rem',           // 24px
      width: '280px',              // 280px width
    },

    // Main content spacing
    main: {
      padding: '2rem 0',           // 32px vertical
      margin: '0 auto',
      maxWidth: '800px',
    },
  },

  // Responsive spacing
  responsive: {
    // Mobile-first spacing
    mobile: {
      container: '1rem',           // 16px
      section: '1.5rem 0',         // 24px vertical
      card: '1rem',                // 16px
    },

    // Tablet spacing
    tablet: {
      container: '1.5rem',         // 24px
      section: '2rem 0',           // 32px vertical
      card: '1.5rem',              // 24px
    },

    // Desktop spacing
    desktop: {
      container: '2rem',           // 32px
      section: '3rem 0',           // 48px vertical
      card: '2rem',                // 32px
    },
  },
};

// Spacing utility functions
export const getSpacing = (path: string) => {
  const keys = path.split('.');
  let value: any = spacing;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Spacing not found: ${path}`);
      return '0';
    }
  }
  
  return value;
};

// CSS-in-JS helper for spacing
export const getSpacingCSS = (property: string, path: string) => {
  const spacingValue = getSpacing(path);
  return {
    [property]: spacingValue,
  };
};

// Common spacing combinations
export const spacingPresets = {
  // Button presets
  button: {
    small: {
      padding: '0.5rem 1rem',
      gap: '0.5rem',
    },
    medium: {
      padding: '0.75rem 1.5rem',
      gap: '0.5rem',
    },
    large: {
      padding: '1rem 2rem',
      gap: '0.5rem',
    },
  },

  // Card presets
  card: {
    small: {
      padding: '1rem',
      margin: '0 0 1rem 0',
    },
    medium: {
      padding: '1.5rem',
      margin: '0 0 1.5rem 0',
    },
    large: {
      padding: '2rem',
      margin: '0 0 2rem 0',
    },
  },

  // Section presets
  section: {
    small: {
      padding: '2rem 0',
      margin: '0 0 2rem 0',
    },
    medium: {
      padding: '3rem 0',
      margin: '0 0 3rem 0',
    },
    large: {
      padding: '4rem 0',
      margin: '0 0 4rem 0',
    },
  },
}; 