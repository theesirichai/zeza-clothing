/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#F5F5F7',
          card: '#FFFFFF',
          dark: '#1D1D1F',
          gray: '#86868B',
          subtle: '#6E6E73',
          border: '#E5E5EA',
          blue: '#0071E3',
          'blue-hover': '#0077ED',
        },
        brand: {
          pink: '#FFF0F3',
          accent: '#FF4E78',
          tag: '#F2F2F7',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"SF Pro Display"',
          '"Prompt"',
          'sans-serif'
        ],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'apple-card': '0 4px 24px -2px rgba(0, 0, 0, 0.04), 0 2px 8px -2px rgba(0, 0, 0, 0.02)',
        'apple-hover': '0 20px 35px -5px rgba(0, 0, 0, 0.08), 0 10px 15px -5px rgba(0, 0, 0, 0.04)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
