/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0F1117',
        surface:  '#1A1D27',
        surface2: '#22263A',
        accent:   '#6C63FF',
        accent2:  '#FF6584',
        accent3:  '#43E97B',
        dim:      '#7B82A8',
        border:   '#2E3250',
        today:    '#FFD166',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn:   { from: { opacity: 0, transform: 'translateX(-12px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        flipIn:    { from: { opacity: 0, transform: 'rotateY(-15deg) scale(0.97)' }, to: { opacity: 1, transform: 'rotateY(0) scale(1)' } },
        pulse2:    { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        bounce2:   { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.08)' } },
      },
      animation: {
        'fade-in':  'fadeIn 0.35s ease both',
        'slide-in': 'slideIn 0.3s ease both',
        'flip-in':  'flipIn 0.4s ease both',
        'shimmer':  'shimmer 2s linear infinite',
        'bounce2':  'bounce2 0.6s ease',
      },
    },
  },
  plugins: [],
}
