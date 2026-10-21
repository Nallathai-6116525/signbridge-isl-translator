/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#231E18', soft: '#4A4238', mute: '#7A7064' },
        sand: { 50: '#FBF8F3', 100: '#F4EFE6', 200: '#E9E1D3', 300: '#D8CCB8' },
        teal: { 50: '#E9F3F3', 100: '#CFE4E5', 500: '#2A7A82', 600: '#1F5F66', 700: '#17484E', 900: '#0E2C30' },
        amber: { 50: '#FBF2E6', 100: '#F3DFC2', 500: '#C98A3A', 600: '#B5762A', 700: '#8E5A1E' },
        moss: { 50: '#EAF2EC', 500: '#3C7A50', 600: '#2E5E3E' },
        rust: { 50: '#FBEDEB', 500: '#C0533F', 600: '#A8433A' },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(35,30,24,.06), 0 8px 24px -12px rgba(35,30,24,.18)',
        lift: '0 2px 4px rgba(35,30,24,.06), 0 18px 40px -16px rgba(35,30,24,.28)',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(.92)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        rise: { '0%': { transform: 'translateY(8px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
      },
      animation: { pop: 'pop .25s ease-out', rise: 'rise .4s ease-out both' },
    },
  },
  plugins: [],
};
