/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#A952B9',
          50: '#faf2fc',
          100: '#f4e3f8',
          200: '#eacaf2',
          300: '#dba4e8',
          400: '#c574db',
          500: '#A952B9',
          600: '#923b9f',
          700: '#7a2f84',
          800: '#65296c',
          900: '#532558',
          950: '#341038',
        },
        ops: {
          bg: '#080c14',
          bgSecondary: '#0f172a',
          surface: '#1e293b',
          surfaceHover: '#334155',
          panel: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(255, 255, 255, 0.1)',
          borderLight: 'rgba(255, 255, 255, 0.2)',
          textMuted: '#94a3b8',
          textBright: '#f8fafc',
          blue: '#38bdf8',
          blueDark: '#0284c7',
          amber: '#fbbf24',
          red: '#f87171',
          green: '#34d399',
          purple: '#a855f7',
          cyan: '#22d3ee',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        glassGlow: '0 0 25px -3px rgba(56, 189, 248, 0.25)',
        glowBlue: '0 0 20px -3px rgba(56, 189, 248, 0.45)',
        glowAmber: '0 0 20px -3px rgba(251, 191, 36, 0.45)',
        glowRed: '0 0 20px -3px rgba(248, 113, 113, 0.45)',
        glowGreen: '0 0 20px -3px rgba(52, 211, 153, 0.45)',
      }
    },
  },
  plugins: [],
}
