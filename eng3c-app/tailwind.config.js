/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        sunken: token('sunken'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        pen: token('pen'),
        onpen: token('onpen'),
        onhl: token('onhl'),
        good: token('good'),
        warn: token('warn'),
        bad: token('bad'),
        strandA: token('strand-a'),
        strandB: token('strand-b'),
        strandC: token('strand-c'),
        strandD: token('strand-d'),
        hlThesis: token('hl-thesis'),
        hlFact: token('hl-fact'),
        hlOpinion: token('hl-opinion'),
        hlInference: token('hl-inference'),
      },
      fontFamily: {
        display: ['"Zilla Slab"', 'Rockwell', '"Roboto Slab"', 'Georgia', 'serif'],
        sans: ['Lexend', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        read: ['Literata', 'Georgia', '"Times New Roman"', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        lift: '0 1px 2px rgb(var(--shadow) / 0.06), 0 4px 16px rgb(var(--shadow) / 0.06)',
      },
    },
  },
  plugins: [],
};
