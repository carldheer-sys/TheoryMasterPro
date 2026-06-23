/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          900: '#0a0a0f',
          800: '#0f0f17',
          700: '#16161f',
          600: '#1e1e2a',
          500: '#262633'
        },
        accent: {
          DEFAULT: '#7c5cfc',
          hover: '#6a4de6',
          light: '#9d86ff'
        },
        keyred: '#ff3b3b',
        keywhite: '#e8e8ea',
        keyblack: '#1a1a24'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
