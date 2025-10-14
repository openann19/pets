/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Enhanced color system from unified design system
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21b6',
          900: '#581c87',
          950: '#3b0764',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Enhanced neutral colors for dark mode
        neutral: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Dark mode specific colors
        dark: {
          bg: {
            primary: '#0a0a0a',
            secondary: '#111111',
            tertiary: '#1a1a1a',
            elevated: '#262626',
            surface: '#1e1e1e',
            overlay: 'rgba(0, 0, 0, 0.8)',
          },
          text: {
            primary: '#ffffff',
            secondary: '#d4d4d4',
            tertiary: '#a3a3a3',
            inverse: '#0a0a0a',
          },
          border: {
            primary: '#262626',
            secondary: '#404040',
            accent: '#525252',
          },
          glass: {
            bg: 'rgba(255, 255, 255, 0.05)',
            border: 'rgba(255, 255, 255, 0.1)',
            backdrop: 'rgba(0, 0, 0, 0.3)',
          },
        },
      },

      // Enhanced typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // Premium animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'holographic': 'holographic 4s ease infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },

      // Premium keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.6)' },
        },
        holographic: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },

      // Enhanced shadows with dark mode variants
      boxShadow: {
        'premium': '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
        'premium-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow-primary': '0 20px 40px -12px rgba(236, 72, 153, 0.4)',
        'glow-secondary': '0 20px 40px -12px rgba(14, 165, 233, 0.4)',
        'glow-purple': '0 20px 40px -12px rgba(168, 85, 247, 0.4)',
        'neon': '0 0 20px currentColor',
        // Dark mode specific shadows
        'dark-premium': '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
        'dark-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'dark-glow-primary': '0 20px 40px -12px rgba(236, 72, 153, 0.3)',
        'dark-glow-secondary': '0 20px 40px -12px rgba(14, 165, 233, 0.3)',
        'dark-elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        'dark-surface': '0 8px 16px -4px rgba(0, 0, 0, 0.4)',
      },

      // Backdrop filters
      backdropBlur: {
        'premium': '16px',
        'premium-lg': '24px',
        'premium-xl': '40px',
      },

      // Enhanced spacing
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },

      // Premium border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Responsive breakpoints
      screens: {
        'xs': '375px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [
    // Custom utilities for premium effects
    function ({ addUtilities }) {
      const newUtilities = {
        '.glass-morphism': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.glass-morphism-dark': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.premium-gradient': {
          background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        },
        '.mesh-gradient': {
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
          backgroundSize: '400% 400%',
          animation: 'holographic 4s ease infinite',
        },
        // Subtle pastel gradient for a sleeker colourful theme
        '.smooth-gradient': {
          background:
            'linear-gradient(135deg, hsl(215,100%,97%) 0%, hsl(203,100%,95%) 35%, hsl(192,100%,93%) 65%, hsl(180,100%,91%) 100%)',
          backgroundSize: '300% 300%',
          animation: 'holographic 20s ease-in-out infinite',
        },
        '.shadow-sleek': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
        '.border-sleek': {
          border: '1px solid rgba(255, 255, 255, 0.25)',
        },
        // Dark mode utilities
        '.dark-glass': {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.dark-surface': {
          background: 'rgb(var(--neutral-100))',
          border: '1px solid rgb(var(--neutral-200))',
        },
        '.dark-elevated': {
          background: 'rgb(var(--neutral-50))',
          border: '1px solid rgb(var(--neutral-200))',
          boxShadow: 'var(--shadow-premium)',
        },
        // Accessibility utilities
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
        '.focus-visible': {
          outline: '2px solid rgb(var(--primary-500))',
          outlineOffset: '2px',
        },
        '.keyboard-navigation *:focus': {
          outline: '2px solid rgb(var(--primary-500))',
          outlineOffset: '2px',
        },
        // High contrast mode
        '.high-contrast': {
          filter: 'contrast(150%) brightness(110%)',
        },
        '.high-contrast *': {
          borderColor: 'currentColor !important',
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
