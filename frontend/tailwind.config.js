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
          light: "#FF7AAE",
          dark: "#00FFFF",
        },
        secondary: {
          light: "#A259FF",
          dark: "#C362FF",
        },
        accent: "#D9C3F7",
        'primary-light': '#FF7AAE',
        'primary-neon': '#00FFFF',
        'deep-indigo': '#100A25',
        'near-black': '#050810',
        'bg-light-start': '#FFF8F0',
        'bg-light-end': '#FFEBF3',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #FF7AAE 0%, #A259FF 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00FFFF 0%, #C362FF 100%)',
        'deep-space': 'linear-gradient(135deg, #050810 0%, #100A25 100%)',
        'soft-gradient': 'linear-gradient(135deg, #FFF8F0 0%, #FFEBF3 100%)',
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
