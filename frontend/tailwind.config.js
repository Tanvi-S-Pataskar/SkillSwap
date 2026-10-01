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
        dark: {
          950: '#070A12', // Near-black / dark navy background
          900: '#0B101E',
          850: '#0F1629',
          800: '#141D33',
          700: '#1E2945',
          600: '#334166',
        },
        charcoal: {
          card: '#121826',
          hover: '#192236',
          muted: '#1E273D',
        },
        violet: {
          glow: '#9333EA',
          electric: '#8B5CF6',
          light: '#A78BFA',
        },
        accent: {
          gradientFrom: '#8B5CF6',
          gradientVia: '#6366F1',
          gradientTo: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(139, 92, 246, 0.25)',
        'glow-md': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-lg': '0 0 40px -10px rgba(139, 92, 246, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
