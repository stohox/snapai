/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{js,ts,jsx,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b'
        },
        surface: {
          DEFAULT: '#0f0f18',
          50: '#18182a',
          100: '#1e1e32',
          200: '#262640',
          300: '#2e2e4a',
          400: '#3a3a58'
        }
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(99, 102, 241, 0.35)',
        card: '0 1px 2px rgba(0,0,0,0.2), 0 8px 24px -8px rgba(0,0,0,0.3)'
      }
    }
  },
  plugins: []
}
