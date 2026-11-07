/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        logo: '#66142A',
        burgundy: { DEFAULT: '#64152D', dark: '#4A0F21', soft: '#7B2A42' },
        gold: { DEFAULT: '#EAD3A0', deep: '#B9985A' },
        ivory: { DEFAULT: '#F8F3EA', deep: '#EFE7D8' },
        espresso: '#291B1D',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
