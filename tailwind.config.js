/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BookMyShow/Eventbrite inspired dark theme
        primary: {
          DEFAULT: '#ff6b6b',
          50: '#fff0f0',
          100: '#ffdddd',
          200: '#ffc1c1',
          300: '#ff9696',
          400: '#ff6b6b',
          500: '#f83b3b',
          600: '#e51d1d',
          700: '#c11414',
          800: '#a01414',
          900: '#841818',
        },
        accent: {
          DEFAULT: '#4ecdc4',
          50: '#effefb',
          100: '#c8fff6',
          200: '#91ffed',
          300: '#53f5e1',
          400: '#4ecdc4',
          500: '#06b6a5',
          600: '#019388',
          700: '#06746e',
          800: '#0a5c59',
          900: '#0d4c4a',
        },
        dark: {
          DEFAULT: '#1a1a2e',
          50: '#f5f5f7',
          100: '#e6e6eb',
          200: '#d0d0d9',
          300: '#aeaebf',
          400: '#85859f',
          500: '#6a6a84',
          600: '#5a5a71',
          700: '#4d4d5e',
          800: '#434350',
          900: '#1a1a2e',
          950: '#0f0f1a',
        },
        surface: {
          DEFAULT: '#16213e',
          light: '#1f2b4d',
          lighter: '#2a3a5f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

