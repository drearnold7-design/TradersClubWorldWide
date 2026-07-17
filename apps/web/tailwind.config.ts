// tailwind.config.ts — design tokens for the TCW brand
// Palette carried over from the approved Phase 1 landing page
// (dark ink-navy / gold / emerald luxury finance-travel aesthetic)

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          800: '#111A2E',
          900: '#0B1120', // primary background
        },
        ivory: {
          50: '#F7F5EF',
          100: '#EDEAE0',
          200: '#D8D4C6',
        },
        gold: {
          300: '#E3C874',
          400: '#D4AF37',
          500: '#C9A227', // primary CTA color
        },
        emerald: {
          500: '#0F5132',
          400: '#1C8C56',
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'], // display face — warm, editorial, not the templated Playfair default
        sans: ['"Inter"', 'sans-serif'], // body face
        mono: ['"JetBrains Mono"', 'monospace'], // eyebrows, countdown, data labels
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
