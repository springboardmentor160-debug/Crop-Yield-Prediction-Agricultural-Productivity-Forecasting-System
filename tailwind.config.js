/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#0F3D2E',
          800: '#134A38',
          700: '#1B5E42',
          600: '#22714F',
        },
        canopy: {
          600: '#1F9D55',
          500: '#2FB768',
          400: '#57CB86',
          100: '#E4F5EA',
          50: '#F3FAF6',
        },
        signal: {
          600: '#0E7490',
          500: '#1594B4',
          100: '#E1F2F6',
        },
        sand: {
          100: '#F2EFE6',
          50: '#FAFAF7',
        },
        slate: {
          900: '#1C2321',
          700: '#3B4440',
          500: '#6B7570',
          400: '#94A09A',
          200: '#DDE3DE',
          100: '#EDF1EE',
        },
      },
      fontFamily: {
        display: ['"Manrope"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 61, 46, 0.04), 0 4px 16px rgba(15, 61, 46, 0.06)',
        'card-hover': '0 2px 4px rgba(15, 61, 46, 0.06), 0 12px 28px rgba(15, 61, 46, 0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      backgroundImage: {
        contour: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cg fill='none' stroke='%230F3D2E' stroke-opacity='0.06' stroke-width='1.2'%3E%3Cpath d='M-20 40 Q 100 -10 220 40 T 460 40'/%3E%3Cpath d='M-20 90 Q 100 40 220 90 T 460 90'/%3E%3Cpath d='M-20 140 Q 100 90 220 140 T 460 140'/%3E%3Cpath d='M-20 190 Q 100 140 220 190 T 460 190'/%3E%3Cpath d='M-20 240 Q 100 190 220 240 T 460 240'/%3E%3Cpath d='M-20 290 Q 100 240 220 290 T 460 290'/%3E%3Cpath d='M-20 340 Q 100 290 220 340 T 460 340'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
