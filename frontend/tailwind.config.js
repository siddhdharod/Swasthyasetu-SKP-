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
        primary: {
          light: "#2563EB",
          dark: "#3B82F6",
        },
        secondary: {
          light: "#0D9488",
          dark: "#14B8A6",
        },
        accent: "#E0F2FE",
        'primary-light': '#2563EB',
        'primary-neon': '#3B82F6',
        'deep-indigo': '#1E293B',
        'near-black': '#0F172A',
        'bg-light-start': '#F8FAFC',
        'bg-light-end': '#F1F5F9',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
        'neon-gradient': 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)',
        'deep-space': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'soft-gradient': 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'glow-pulse': 'glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
