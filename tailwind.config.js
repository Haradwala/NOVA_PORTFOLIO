/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#07070F',
        bg2: '#0F0F18',
        bg3: '#14141F',
        card: '#18182A',
        card2: '#1E1E30',
        rose: '#E8956D',
        rose2: '#F2B49A',
        violet: '#8B5CF6',
        violet2: '#A78BFA',
        teal: '#2DD4BF',
        muted: '#5A5A78',
        text: '#EEEEF5',
        textd: '#A0A0C0',
      },
    },
  },
  plugins: [],
}
