/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        panel: '#1a1a1a',
        lavender: {
          light: '#E6E6FA',
          DEFAULT: '#967bb6',
          dark: '#5e4d73'
        },
        seat: {
          available: '#2a2a2a',
          male: '#90ee90',
          female: '#ffb6c1',
          selectedMale: '#bdfcc9',
          selectedFemale: '#ffd1dc'
        }
      },
    },
  },
  plugins: [],
}
