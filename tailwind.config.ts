import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        saffron: '#FF9933',
        maroon: '#800020',
        'maroon-dark': '#6B001A',
        gold: '#D4A843',
        'gold-light': '#E8C468',
        cream: '#FFF8F0',
        'cream-dark': '#F5EBE0',
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
        ],
        devanagari: [
          '"Noto Sans Devanagari"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease-out',
        fadeIn: 'fadeIn 0.4s ease-out',
        slideIn: 'slideIn 0.5s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        slideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
