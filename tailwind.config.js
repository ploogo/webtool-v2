/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neon Green
        neon: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        // Dark Mode Grays
        jet: {
          50: '#F7F7F8',
          100: '#ECECED',
          200: '#DCDCDD',
          300: '#B8B8B9',
          400: '#92929A',
          500: '#6F6F78',
          600: '#4A4A52',
          700: '#333338',
          800: '#1E1E21',
          900: '#121214',
          950: '#09090B',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
