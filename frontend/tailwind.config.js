/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        brand: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
        },
        accent: '#22C55E',
      },
    },
  },
  plugins: [],
}
