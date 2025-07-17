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
        // Light theme colors - Japanese Learning Platform
        light: {
          DEFAULT: '#FAF0E6',    // Warm beige main background
          secondary: '#F5F0E8',  // Slightly darker beige for cards
          tertiary: '#F0E8D8',   // Even darker for hover states
        },
        // Border colors as top-level for Tailwind utility support
        'border-light': '#E0E0E0',      // Light gray borders
        'border-medium': '#D0D0D0',     // Medium gray borders
        'border-dark': '#B0B0B0',       // Dark gray borders
        'border-accent': '#D45A38',     // Japanese red borders
        'border-dark-light': '#3A3B42',      // Dark gray borders
        'border-dark-medium': '#4A4B52',     // Medium dark gray borders
        'border-dark-dark': '#5A5B62',       // Lighter dark gray borders
        // Dark theme colors - Japanese Learning Platform
        dark: {
          DEFAULT: '#0F0F23',    // Deeper, richer dark background
          secondary: '#1B1C22',  // Slightly lighter dark for cards
          tertiary: '#23242A',   // Even lighter for hover states
          elevated: '#2A2B32',   // For elevated elements
          'elevated-light': '#2F3038', // Lighter elevated elements
        },
        // Text colors
        text: {
          primary: '#2D2D2D',    // Dark gray for main text (light theme)
          secondary: '#5A5A5A',  // Medium gray for secondary text
          muted: '#8A8A8A',      // Light gray for muted text
          inverse: '#FFFFFF',    // White text for dark backgrounds
          // Dark theme text colors
          'dark-primary': '#F8F8F8',    // Brighter light gray for main text
          'dark-secondary': '#E8E8E8',  // Slightly darker for secondary text
          'dark-muted': '#B8B8B8',      // Muted gray for less important text
        },
        // Japanese Cultural Colors - Extended Palette
        japanese: {
          red: '#D45A38',        // Japanese red for primary actions
          redLight: '#E67A5A',   // Lighter red for hover states
          redDark: '#B84A28',    // Darker red for active states
          // Extended Japanese color palette
          pink: '#FF69B4',       // Sakura pink
          green: '#4CAF50',      // Matcha green
          blue: '#2196F3',       // Indigo blue
          orange: '#FF9800',     // Autumn orange
          purple: '#9C27B0',     // Wisteria purple
          yellow: '#FFD700',     // Golden yellow
          earth: '#8B7355',      // Earth brown
          'earth-dark': '#6B5A45', // Darker earth brown
          // Torii gate colors
          toriiRed: '#C44536',   // Traditional torii red
          toriiBrown: '#8B4513', // Wooden brown
          // Earth tones
          earth: {
            light: '#D2B48C',    // Light tan
            medium: '#BC8F8F',   // Rosy brown
            dark: '#8B7355',     // Dark tan
          },
          // Dark theme earth tones
          'earth-dark': {
            light: '#A89070',    // Darker tan for dark theme
            medium: '#9A7A7A',   // Darker rosy brown
            dark: '#6B5A45',     // Darker tan
          },
          // Enhanced dark mode variants
          'red-glow': '#FF6B6B', // Glowing red for dark mode
          'blue-glow': '#4ECDC4', // Glowing blue for dark mode
          'green-glow': '#45B7D1', // Glowing green for dark mode
          'purple-glow': '#96CEB4', // Glowing purple for dark mode
        },
        // Accent colors
        accent: {
          yellow: '#FFD700',     // Gold for achievements
          orange: '#FFA500',     // Orange for progress bars
          green: '#4CAF50',      // Green for success states
          blue: '#2196F3',       // Blue for info states
          // Dark theme enhanced accents
          'yellow-dark': '#FFE55C',     // Brighter gold for dark theme
          'orange-dark': '#FFB347',     // Enhanced orange for progress bars
          'green-dark': '#66BB6A',      // Brighter green for dark theme
          'blue-dark': '#42A5F5',       // Brighter blue for dark theme
          // Glow variants for dark mode
          'yellow-glow': '#FFF176',     // Glowing yellow
          'orange-glow': '#FFCC02',     // Glowing orange
          'green-glow': '#81C784',      // Glowing green
          'blue-glow': '#64B5F6',       // Glowing blue
        },
        // Status Colors
        status: {
          success: '#4CAF50',    // Green for success
          warning: '#FF9800',    // Orange for warnings
          error: '#F44336',      // Red for errors
          info: '#2196F3',       // Blue for info
        },
        // Theme colors (dark/light only)
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
        // Display fonts for headings
        display: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
        // Japanese fonts
        jp: ['Noto Sans JP', 'Noto Serif JP', 'sans-serif'],
        // Techno font for future neon theme
        techno: ['Orbitron', 'Rajdhani', 'Audiowide', 'sans-serif'],
      },
      fontSize: {
        'hero': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'subhero': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        // Japanese learning platform specific sizes
        'display-large': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-medium': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-small': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        // Japanese learning platform spacing
        'card': '1.5rem',
        'section': '3rem',
        'container': '2rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        // Japanese learning platform border radius
        'button': '0.75rem',     // Primary button radius
        'card': '0.75rem',       // Card radius
        'input': '0.375rem',     // Input radius
        'nav': '0.5rem',         // Navigation radius
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        // Japanese learning platform shadows
        'button': '0 4px 6px -1px rgba(212, 90, 56, 0.2), 0 2px 4px -1px rgba(212, 90, 56, 0.1)',
        'button-hover': '0 10px 15px -3px rgba(212, 90, 56, 0.2), 0 4px 6px -2px rgba(212, 90, 56, 0.1)',
        'card-elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'nav': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'input-focus': '0 0 0 3px rgba(212, 90, 56, 0.1)',
        // Enhanced Dark theme shadows
        'dark-card': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'dark-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'dark-button': '0 4px 6px -1px rgba(212, 90, 56, 0.4), 0 2px 4px -1px rgba(212, 90, 56, 0.3), 0 0 10px rgba(212, 90, 56, 0.2)',
        'dark-glow': '0 0 20px rgba(212, 90, 56, 0.4), 0 0 40px rgba(212, 90, 56, 0.2)',
        'dark-glow-soft': '0 0 15px rgba(212, 90, 56, 0.3)',
        'dark-glow-strong': '0 0 30px rgba(212, 90, 56, 0.5), 0 0 60px rgba(212, 90, 56, 0.3)',
        // Glow effects for different colors
        'glow-red': '0 0 20px rgba(212, 90, 56, 0.4)',
        'glow-blue': '0 0 20px rgba(33, 150, 243, 0.4)',
        'glow-green': '0 0 20px rgba(76, 175, 80, 0.4)',
        'glow-yellow': '0 0 20px rgba(255, 215, 0, 0.4)',
        'glow-orange': '0 0 20px rgba(255, 165, 0, 0.4)',
        'glow-purple': '0 0 20px rgba(156, 39, 176, 0.4)',
      },
      backgroundImage: {
        'tokyo-noise': "url(static/media/noise.svg)",
        'tokyo-city': "url(static/media/cityscape.svg)",
        'tokyo-torii': "url(static/media/torii-pattern.svg)",
        // Japanese learning platform gradients
        'japanese-gradient': 'linear-gradient(135deg, #D45A38 0%, #E67A5A 100%)',
        'background-gradient': 'linear-gradient(135deg, #FAF0E6 0%, #F5F0E8 100%)',
        'card-gradient': 'linear-gradient(135deg, #F5F0E8 0%, #E0E0E0 100%)',
        // Enhanced Dark theme gradients
        'dark-background-gradient': 'linear-gradient(135deg, #0F0F23 0%, #1B1C22 50%, #23242A 100%)',
        'dark-card-gradient': 'linear-gradient(135deg, #1B1C22 0%, #23242A 50%, #2A2B32 100%)',
        'dark-elevated-gradient': 'linear-gradient(135deg, #23242A 0%, #2A2B32 50%, #2F3038 100%)',
        'dark-japanese-gradient': 'linear-gradient(135deg, #D45A38 0%, #E67A5A 100%)',
        'dark-glow-gradient': 'linear-gradient(135deg, rgba(212, 90, 56, 0.1) 0%, rgba(230, 122, 90, 0.1) 100%)',
        // Color-specific gradients for dark mode
        'dark-red-gradient': 'linear-gradient(135deg, #D45A38 0%, #FF6B6B 100%)',
        'dark-blue-gradient': 'linear-gradient(135deg, #2196F3 0%, #4ECDC4 100%)',
        'dark-green-gradient': 'linear-gradient(135deg, #4CAF50 0%, #45B7D1 100%)',
        'dark-yellow-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFE55C 100%)',
        'dark-orange-gradient': 'linear-gradient(135deg, #FF9800 0%, #FFB347 100%)',
        'dark-purple-gradient': 'linear-gradient(135deg, #9C27B0 0%, #96CEB4 100%)',
      },
      keyframes: {
        'scale-up': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' },
        },
        // Japanese learning platform animations
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        // Dark theme specific animations
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(212, 90, 56, 0.4), 0 0 40px rgba(212, 90, 56, 0.2)' 
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(212, 90, 56, 0.6), 0 0 60px rgba(212, 90, 56, 0.4)' 
          },
        },
        'glow-pulse-soft': {
          '0%, 100%': { 
            boxShadow: '0 0 15px rgba(212, 90, 56, 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 25px rgba(212, 90, 56, 0.5)' 
          },
        },
        'float-dark': {
          '0%, 100%': { 
            transform: 'translateY(0px)',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))'
          },
          '50%': { 
            transform: 'translateY(-10px)',
            filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6))'
          },
        },
        'shimmer-dark': {
          '0%': { 
            backgroundPosition: '-200% 0',
            backgroundImage: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
          },
          '100%': { 
            backgroundPosition: '200% 0',
            backgroundImage: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
          },
        },
      },
      animation: {
        'scale-up': 'scale-up 0.3s ease-out',
        // Japanese learning platform animations
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        // Dark theme specific animations
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'glow-pulse-soft': 'glow-pulse-soft 3s ease-in-out infinite',
        'float-dark': 'float-dark 3s ease-in-out infinite',
        'shimmer-dark': 'shimmer-dark 2s ease-in-out infinite',
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