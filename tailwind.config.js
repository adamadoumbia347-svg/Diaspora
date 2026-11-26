/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./build.mjs', './src/**/*.{mjs,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        alpine: {
          pine: '#1B4332', pineDark: '#122E22', pineLight: '#2D6A4F',
          stone: '#F7F6F2', stoneDark: '#EAE7DF',
          terracotta: '#B8501A', terracottaHover: '#9A4012', slate: '#1E293B',
        },
      },
    },
  },
};
