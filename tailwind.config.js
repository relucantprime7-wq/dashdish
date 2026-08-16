/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF8',
        surface: '#FFFFFF',
        'text-primary': '#14151A',
        'text-secondary': '#5C5F6B',
        'text-tertiary': '#9698A3',
        border: '#E8E8E4',
        accent: {
          DEFAULT: '#E4572E',
          pressed: '#C8471F',
        },
        honesty: '#1B8A5A',
        success: '#1B8A5A',
        warning: '#C88A1B',
        error: '#D23C3C',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(20, 21, 26, 0.05), 0 1px 4px -1px rgba(20, 21, 26, 0.03)',
        'sheet': '0 -4px 24px -4px rgba(20, 21, 26, 0.12)',
        'floating': '0 4px 20px -2px rgba(20, 21, 26, 0.15)',
      }
    },
  },
  plugins: [],
}
