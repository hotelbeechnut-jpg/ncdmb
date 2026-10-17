/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        paper: '#FAF8FF',
        lavender: {
          100: '#F1ECFF',
          300: '#CBB8FF',
        },
        purple: {
          500: '#7C3AED',
          700: '#5B21B6',
          900: '#2E1065',
        },
        ink: '#1B1230',
        gold: '#F5B93B',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        cardlg: '28px',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(46,16,101,0.25)',
        lift: '0 20px 60px -15px rgba(46,16,101,0.35)',
      },
    },
  },
  plugins: [],
}
