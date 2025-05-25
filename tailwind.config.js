/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        dark: {
          DEFAULT: '#1e1e1e',  // Main background
          lighter: '#2a2a2a',  // Card/button background
          lightest: '#333333', // Hover states
          border: '#404040',   // Borders
        },
        // Text colors
        text: {
          primary: '#f0f0f0',    // Headings
          secondary: '#cccccc',  // Body text
          muted: '#999999',      // Muted text
        },
        // Accent colors (for future use)
        accent: {
          red: '#FF4B4B',      // Japanese red
          gold: '#FFD700',     // Gold accents
        },
        // Neon theme colors
        'neon-pink': '#ff00c8',
        'neon-cyan': '#00f7ff',
        'electric-purple': '#9c00ff',
        'neon-orange': '#ff9900',
        'midnight': '#0d0d1a',
        // Base colors
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6', // Base blue
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        // Modern sans-serif fonts
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        // Japanese fonts
        jp: ['Noto Sans JP', 'Noto Serif JP', 'sans-serif'],
        // Techno font for neon theme
        techno: ['Orbitron', 'Rajdhani', 'Audiowide', 'sans-serif'],
      },
      fontSize: {
        'hero': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'subhero': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'hover': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'neon-pink': '0 0 8px #ff00c8, 0 0 24px #ff00c8',
        'neon-cyan': '0 0 8px #00f7ff, 0 0 24px #00f7ff',
        'electric-purple': '0 0 8px #9c00ff, 0 0 24px #9c00ff',
      },
      backgroundImage: {
        'tokyo-noise': "url(static/media/noise.svg)",
        'tokyo-city': "url(static/media/cityscape.svg)",
        'tokyo-torii': "url(static/media/torii-pattern.svg)",
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.3)' },
        },
        'scale-up': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' },
        },
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s infinite',
        'scale-up': 'scale-up 0.2s ease-in-out',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: '500',
            },
            strong: {
              color: 'inherit',
            },
            code: {
              color: 'inherit',
            },
            h1: {
              color: 'inherit',
              fontFamily: 'Noto Serif JP',
            },
            h2: {
              color: 'inherit',
              fontFamily: 'Noto Serif JP',
            },
            h3: {
              color: 'inherit',
              fontFamily: 'Noto Serif JP',
            },
          },
        },
      },
    },
  },
  plugins: [],
} 