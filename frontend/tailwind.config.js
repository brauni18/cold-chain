/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020408',
          900: '#050a14',
          800: '#0a1420',
          700: '#12202f',
          600: '#1a2d40',
        },
        cyan: {
          400: '#00e5ff',
          500: '#00b8d4',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.15), 0 0 40px rgba(0, 229, 255, 0.05)',
        'glow-green': '0 0 8px rgba(34, 197, 94, 0.5)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-light': '0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'tile-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.3)',
        'tile-inset-light': 'inset 0 2px 4px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'card-gradient': 'linear-gradient(180deg, rgba(16, 24, 38, 0.95) 0%, rgba(10, 16, 26, 0.98) 100%)',
        'card-gradient-light': 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 1) 100%)',
      },
    },
  },
  plugins: [],
};
