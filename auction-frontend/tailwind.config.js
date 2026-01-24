/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          light: '#1e293b',
          lighter: '#334155',
        },
        accent: {
          gold: '#fbbf24',
          red: '#ef4444',
          green: '#10b981',
        },
        background: {
          DEFAULT: '#fafafa',
          dark: '#f1f5f9',
        }
      }
    },
  },
  plugins: [],
}