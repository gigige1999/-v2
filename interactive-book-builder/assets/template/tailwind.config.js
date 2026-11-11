/** 主题色全部来自 CSS 变量（src/styles/themes.css），切换 data-cover / data-paper 即换色。
 *  书页内一律用 ink / accent / paper，不要再写 amber-950 之类的固定色。
 *  例：text-ink  text-ink/60  border-ink/20  bg-ink  text-paper  bg-accent/10  text-foil */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--pp-ink-rgb) / <alpha-value>)',
        accent: 'rgb(var(--pp-accent-rgb) / <alpha-value>)',
        paper: 'var(--pp-bg)',
        paper2: 'var(--pp-bg2)',
        foil: 'var(--cv-foil)',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Songti SC"', 'STSong', '"Noto Serif SC"', 'serif'],
        display: ['"Playfair Display"', '"Songti SC"', 'STSong', 'serif'],
      },
    },
  },
  plugins: [],
};
