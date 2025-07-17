// Typography System - Japanese Learning Platform
// Based on friendly, powerful, and motivating tone

export const typography = {
  // Font Families
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary: 'Nunito, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    japanese: 'Noto Sans JP, Noto Serif JP, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    display: 'Nunito, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem',      // 128px
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Typography Scale
  scale: {
    // Display styles for large headings
    display: {
      large: {
        fontSize: '4.5rem',
        lineHeight: '1.1',
        fontWeight: '700',
        letterSpacing: '-0.02em',
        fontFamily: 'display',
      },
      medium: {
        fontSize: '3.75rem',
        lineHeight: '1.1',
        fontWeight: '700',
        letterSpacing: '-0.02em',
        fontFamily: 'display',
      },
      small: {
        fontSize: '3rem',
        lineHeight: '1.2',
        fontWeight: '700',
        letterSpacing: '-0.01em',
        fontFamily: 'display',
      },
    },

    // Heading styles
    heading: {
      h1: {
        fontSize: '2.25rem',
        lineHeight: '1.2',
        fontWeight: '700',
        letterSpacing: '-0.01em',
        fontFamily: 'primary',
      },
      h2: {
        fontSize: '1.875rem',
        lineHeight: '1.3',
        fontWeight: '600',
        letterSpacing: '-0.01em',
        fontFamily: 'primary',
      },
      h3: {
        fontSize: '1.5rem',
        lineHeight: '1.4',
        fontWeight: '600',
        letterSpacing: '0em',
        fontFamily: 'primary',
      },
      h4: {
        fontSize: '1.25rem',
        lineHeight: '1.4',
        fontWeight: '600',
        letterSpacing: '0em',
        fontFamily: 'primary',
      },
      h5: {
        fontSize: '1.125rem',
        lineHeight: '1.4',
        fontWeight: '600',
        letterSpacing: '0em',
        fontFamily: 'primary',
      },
      h6: {
        fontSize: '1rem',
        lineHeight: '1.4',
        fontWeight: '600',
        letterSpacing: '0em',
        fontFamily: 'primary',
      },
    },

    // Body text styles
    body: {
      large: {
        fontSize: '1.125rem',
        lineHeight: '1.6',
        fontWeight: '400',
        letterSpacing: '0em',
        fontFamily: 'primary',
      },
      medium: {
        fontSize: '1rem',
        lineHeight: '1.6',
        fontWeight: '400',
        letterSpacing: '0em',
        fontFamily: 'primary',
      },
      small: {
        fontSize: '0.875rem',
        lineHeight: '1.5',
        fontWeight: '400',
        letterSpacing: '0em',
        fontFamily: 'primary',
      },
    },

    // Button text styles
    button: {
      large: {
        fontSize: '1.125rem',
        lineHeight: '1.4',
        fontWeight: '600',
        letterSpacing: '0.01em',
        fontFamily: 'primary',
      },
      medium: {
        fontSize: '1rem',
        lineHeight: '1.4',
        fontWeight: '600',
        letterSpacing: '0.01em',
        fontFamily: 'primary',
      },
      small: {
        fontSize: '0.875rem',
        lineHeight: '1.4',
        fontWeight: '600',
        letterSpacing: '0.01em',
        fontFamily: 'primary',
      },
    },

    // Caption and label styles
    caption: {
      large: {
        fontSize: '0.875rem',
        lineHeight: '1.4',
        fontWeight: '500',
        letterSpacing: '0.01em',
        fontFamily: 'primary',
      },
      medium: {
        fontSize: '0.75rem',
        lineHeight: '1.4',
        fontWeight: '500',
        letterSpacing: '0.01em',
        fontFamily: 'primary',
      },
      small: {
        fontSize: '0.75rem',
        lineHeight: '1.3',
        fontWeight: '400',
        letterSpacing: '0em',
        fontFamily: 'primary',
      },
    },
  },
};

// Typography utility functions
export const getTypography = (style: string) => {
  const keys = style.split('.');
  let value: any = typography;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Typography style not found: ${style}`);
      return {};
    }
  }
  
  return value;
};

// CSS-in-JS helper
export const getTypographyCSS = (style: string) => {
  const typographyStyle = getTypography(style);
  return {
    fontFamily: typographyStyle.fontFamily || typography.fontFamily.primary,
    fontSize: typographyStyle.fontSize || typography.fontSize.base,
    lineHeight: typographyStyle.lineHeight || typography.lineHeight.normal,
    fontWeight: typographyStyle.fontWeight || typography.fontWeight.normal,
    letterSpacing: typographyStyle.letterSpacing || typography.letterSpacing.normal,
  };
}; 