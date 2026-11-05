/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070B12',
          900: '#0B0F19',
          850: '#0E1420',
          800: '#111827',
          700: '#1B2437',
          600: '#283349',
        },
        brand: {
          cyan: '#06B6D4',
          teal: '#22D3EE',
          indigo: '#6366F1',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'Lateef', 'serif'],
      },
      boxShadow: {
        depth:
          '0 24px 60px -28px rgba(0,0,0,0.85), 0 12px 28px -18px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.4)',
        'depth-sm':
          '0 12px 32px -18px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.35)',
        glow: '0 0 0 1px rgba(6,182,212,0.45), 0 0 42px -10px rgba(6,182,212,0.55)',
        'glow-sm': '0 0 24px -8px rgba(6,182,212,0.5)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 24px rgba(6,182,212,0.06)',
      },
      backgroundImage: {
        'glass-sheen':
          'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.015) 42%, rgba(255,255,255,0) 100%)',
        'brand-gradient': 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 48%, #6366F1 120%)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'card-rise': {
          from: { opacity: '0', transform: 'translateY(18px) scale(0.985)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(-14px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.28)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'pulse-live': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(244,63,94,0.55)' },
          '50%': { opacity: '0.85', boxShadow: '0 0 0 6px rgba(244,63,94,0)' },
        },
        'glow-breathe': {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(6,182,212,0.42), 0 0 32px -14px rgba(6,182,212,0.55)' },
          '50%': { boxShadow: '0 0 0 1px rgba(6,182,212,0.62), 0 0 48px -10px rgba(6,182,212,0.72)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(1.9)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'card-rise': 'card-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        wave: 'wave 1.1s ease-in-out infinite',
        'pulse-live': 'pulse-live 1.6s ease-in-out infinite',
        'glow-breathe': 'glow-breathe 3.4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'ping-slow': 'ping-slow 2.4s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
