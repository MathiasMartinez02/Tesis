import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Paleta SIGMA Aeronáutica */
        aviation: {
          50: '#f0f4ff',
          100: '#dce8ff',
          200: '#b9d1ff',
          300: '#7eb0ff',
          400: '#3d87ff',
          500: '#0f62fe',
          600: '#0043ce',
          700: '#002d9c',
          800: '#001d6c',
          900: '#001141',
          950: '#000824',
        },
        /* Superficie / fondos */
        surface: {
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
        /* Estados operacionales */
        status: {
          pending: '#f59e0b',
          'pending-bg': '#fef3c7',
          'pending-border': '#fde68a',
          'in-progress': '#3b82f6',
          'in-progress-bg': '#dbeafe',
          'in-progress-border': '#bfdbfe',
          inspection: '#8b5cf6',
          'inspection-bg': '#ede9fe',
          'inspection-border': '#ddd6fe',
          completed: '#10b981',
          'completed-bg': '#d1fae5',
          'completed-border': '#a7f3d0',
          cancelled: '#ef4444',
          'cancelled-bg': '#fee2e2',
          'cancelled-border': '#fecaca',
          overdue: '#dc2626',
          'overdue-bg': '#fef2f2',
          warning: '#f97316',
          'warning-bg': '#fff7ed',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'sidebar': '1px 0 0 0 rgba(0, 0, 0, 0.08)',
        'dropdown': '0 4px 16px -4px rgba(0, 0, 0, 0.15), 0 2px 8px -4px rgba(0, 0, 0, 0.08)',
        'modal': '0 20px 60px -10px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'sm': '0.375rem',
        DEFAULT: '0.5rem',
        'md': '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      backgroundImage: {
        'gradient-aviation': 'linear-gradient(135deg, #001141 0%, #002d9c 50%, #0043ce 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
      },
      spacing: {
        'sidebar': '260px',
        'sidebar-collapsed': '72px',
        'navbar': '64px',
      },
    },
  },
  plugins: [],
};

export default config;
