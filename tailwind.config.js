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
        // Light theme colors
        primary: {
          light: '#3B82F6', // blue-500
          DEFAULT: '#2563EB', // blue-600
          dark: '#1D4ED8', // blue-700
        },
        secondary: {
          light: '#10B981', // green-500
          DEFAULT: '#059669', // green-600
          dark: '#047857', // green-700
        },
        // Dark theme colors
        dark: {
          bg: '#1F2937', // gray-800
          card: '#374151', // gray-700
          text: '#F3F4F6', // gray-100
          border: '#4B5563', // gray-600
        },
        // Blue theme colors
        blue: {
          bg: '#EFF6FF', // blue-50
          card: '#DBEAFE', // blue-100
          text: '#1E40AF', // blue-800
          border: '#93C5FD', // blue-300
        },
        // Green theme colors
        green: {
          bg: '#ECFDF5', // green-50
          card: '#D1FAE5', // green-100
          text: '#065F46', // green-800
          border: '#6EE7B7', // green-300
        },
        // Japandi-inspired color palette
        sage: {
          50: '#F5F7F4',
          100: '#E8EDE5',
          200: '#D1DBCB',
          300: '#B4C3A9',
          400: '#8FA583',
          500: '#6B8760', // Base sage green
          600: '#556D4D',
          700: '#42553B',
          800: '#2F3C2A',
          900: '#1C2419',
        },
        charcoal: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#B3B3B3',
          400: '#808080',
          500: '#4D4D4D', // Base charcoal
          600: '#404040',
          700: '#333333',
          800: '#262626',
          900: '#1A1A1A',
        },
        ivory: {
          50: '#FDFDFC',
          100: '#FBFBF9',
          200: '#F7F7F3',
          300: '#F3F3ED',
          400: '#EFEFE7',
          500: '#EBEBE1', // Base ivory
          600: '#D4D4CB',
          700: '#BDBDB4',
          800: '#A6A69E',
          900: '#8F8F87',
        },
        beige: {
          50: '#FDFBF8',
          100: '#FBF7F1',
          200: '#F7EFE3',
          300: '#F3E7D5',
          400: '#EFDFC7',
          500: '#EBD7B9', // Base beige
          600: '#D4C2A7',
          700: '#BDAD95',
          800: '#A69883',
          900: '#8F8371',
        },
        accent: {
          wood: '#8B7355', // Washed wood tone
          gold: '#C4A484', // Muted gold
          rust: '#B85C38', // Rust red
        },
      },
      fontFamily: {
        // Modern serif for headings
        serif: ['Noto Serif JP', 'serif'],
        // Clean sans-serif for body
        sans: ['Noto Sans JP', 'sans-serif'],
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
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 