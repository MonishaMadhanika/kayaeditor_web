/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4ff',
          100: '#dbe7ff',
          200: '#b6ceff',
          300: '#8db3ff',
          400: '#5d90ff',
          500: '#0B5FFF', // corporate blue
          600: '#094ed4',
          700: '#083ea9',
          800: '#062f80',
          900: '#052463',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        danger: '#dc2626',
      },
    },
  },
  plugins: [],
};


