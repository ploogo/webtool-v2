/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f5f6f9',
          100: '#ebedf3',
          200: '#d3d7e5',
          300: '#adb4cd',
          400: '#808ab0',
          500: '#606b96',
          600: '#4c557c',
          700: '#3f466a',
          800: '#363c59',
          900: '#2d324c',
          950: '#24293f',
        },
        coral: {
          50: '#fff1f0',
          100: '#ffe4e1',
          200: '#ffc9c0',
          300: '#ffa391',
          400: '#ff7a61',
          500: '#ff5436',
          600: '#ed442f',
          700: '#d63a27',
          800: '#b32e1f',
          900: '#912518',
        },
        brand: {
          coral: '#ed442f',
          navy: '#363c59',
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