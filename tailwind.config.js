/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors - Modern Blue Palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Main brand color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        
        // Secondary Accent - Purple for highlights
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        
        // Accent Colors for variety
        accent: {
          cyan: {
            light: '#67e8f9',
            DEFAULT: '#06b6d4',
            dark: '#0891b2',
          },
          emerald: {
            light: '#6ee7b7',
            DEFAULT: '#10b981',
            dark: '#059669',
          },
          amber: {
            light: '#fcd34d',
            DEFAULT: '#f59e0b',
            dark: '#d97706',
          },
          rose: {
            light: '#fda4af',
            DEFAULT: '#f43f5e',
            dark: '#e11d48',
          },
        },
        
        // Semantic Colors
        success: {
          light: '#86efac',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        warning: {
          light: '#fde047',
          DEFAULT: '#eab308',
          dark: '#ca8a04',
        },
        error: {
          light: '#fca5a5',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        info: {
          light: '#93c5fd',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        
        // Neutral Grays - Slate palette for professional look
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        
        // Background & Surface colors
        background: {
          light: '#ffffff',
          DEFAULT: '#f8fafc',
          dark: '#0f172a',
          card: {
            light: '#ffffff',
            dark: '#1e293b',
          },
        },
        
        // Text colors
        text: {
          primary: {
            light: '#0f172a',
            dark: '#f1f5f9',
          },
          secondary: {
            light: '#475569',
            dark: '#cbd5e1',
          },
          muted: {
            light: '#64748b',
            dark: '#94a3b8',
          },
        },
        
        // Border colors
        border: {
          light: '#e2e8f0',
          DEFAULT: '#cbd5e1',
          dark: '#334155',
        },
      },
      
      // Gradient definitions
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        'gradient-accent': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-warm': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
      
      // Box shadows for depth
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 12px 30px -4px rgba(0, 0, 0, 0.1)',
        'strong': '0 10px 40px -5px rgba(0, 0, 0, 0.2), 0 15px 50px -10px rgba(0, 0, 0, 0.15)',
        'glow-primary': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-secondary': '0 0 20px rgba(168, 85, 247, 0.3)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      
      // Animation durations
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      
      // Custom animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      // Typography
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
