import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FFFFFF',
        fg: '#0B0F1A',
        muted: '#F5F6F8',
        'muted-2': '#EEF0F4',
        border: 'rgba(15, 23, 42, 0.10)',
        brand: {
          50: '#FFFBEB',
          100: '#FFF5CC',
          500: '#FFCC00',
          600: '#E6B800',
        },
        slate: {
          300: '#CBD5E1',
          500: '#64748B',
          700: '#334155',
          900: '#0B0F1A',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Inter',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        h1: ['3.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1-mobile': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        h2: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
        h3: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        small: ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '18px',
        xl: '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 2px 8px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)',
        button: '0 1px 2px rgba(15, 23, 42, 0.05)',
        'button-hover': '0 2px 4px rgba(15, 23, 42, 0.08)',
        modal: '0 4px 16px rgba(15, 23, 42, 0.08), 0 16px 48px rgba(15, 23, 42, 0.12)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      transitionDuration: {
        hover: '150ms',
        modal: '220ms',
      },
      animation: {
        'fade-in': 'fadeIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slide-up': 'slideUp 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'toast-in': 'toastIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'toast-out': 'toastOut 150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        toastOut: {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
