/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F7F8FC',
          dark: '#0B1120',
        },
        card: {
          light: '#FFFFFF',
          dark: '#111827',
        },
        primary: '#F43F5E', // Rose 500
        secondary: '#EC4899', // Pink 500
        cyan: '#F97316', // Orange 500
        text: {
          primary: {
            light: '#111827',
            dark: '#F9FAFB',
          },
          secondary: {
            light: '#6B7280',
            dark: '#94A3B8',
          }
        },
        border: {
          light: 'rgba(15, 23, 42, 0.06)',
          dark: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
