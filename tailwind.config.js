/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tło strony
        'warm-beige': '#FBF4E8',
        'light-green-bg': '#F6FAF4',
        
        // Nagłówki i ważne elementy
        'dark-green': '#2F5C3A',
        
        // Przyciski CTA
        'pastel-blue': {
          DEFAULT: '#48A7C9',
          hover: '#3A8BA8',
        },
        
        // Ikony, akcenty
        'light-green': '#C4DEBE',
        
        // Drobne akcenty
        'accent-yellow': '#F4D34E',
        'accent-orange': '#E27B5E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};