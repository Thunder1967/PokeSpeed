/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f1115', // Dark e-sports background
        surface: 'rgba(30, 33, 40, 0.7)', // Glassmorphism surface
        threat: {
          a: '#3b82f6', // Blue for A
          b: '#eab308', // Yellow for B
          both: '#ef4444', // Red/Magenta for A+B
        }
      }
    },
  },
  plugins: [],
}
