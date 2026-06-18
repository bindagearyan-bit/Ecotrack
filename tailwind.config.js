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
        brand: {
          green: '#2D6A4F',
          lightGreen: '#52B788',
          blue: '#1A759F',
          bg: '#F8F9FA',
          card: '#FFFFFF',
          red: '#E63946',
          orange: '#F4A261',
          text: '#1A1A2E',
          textSecondary: '#6B7280',
          
          // Dark Mode Color Palette
          darkBg: '#0A1A0A',
          darkCard: '#1A2E1A',
          darkText: '#E8F5E9',
          darkBorder: '#2D4A2D',
          darkSidebar: '#0F1F0F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
