/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        night: '#06061a',
        nightish: '#0b0b24',
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(16,185,129,0.45)',
        gold: '0 0 40px -8px rgba(251,191,36,0.5)',
        pink: '0 0 40px -8px rgba(236,72,153,0.5)',
      },
      keyframes: {
        blob: {
          '0%,100%': { transform: 'translate(0px,0px) scale(1)' },
          '33%': { transform: 'translate(40px,-50px) scale(1.15)' },
          '66%': { transform: 'translate(-30px,30px) scale(0.9)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        gradient: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        blob: 'blob 20s infinite ease-in-out',
        float: 'float 6s infinite ease-in-out',
        shimmer: 'shimmer 2.5s infinite',
        pop: 'pop 0.4s ease-out',
        gradient: 'gradient 8s ease infinite',
      },
    },
  },
  plugins: [],
};
