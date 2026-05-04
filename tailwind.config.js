/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-medis': '#0f1432',
        'merah-medis': '#b40000',
        'hijau-medis': '#006400',
      }
    },
  },
  plugins: [],
}