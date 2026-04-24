
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'switch-bold': ['"SWITCH COMMERCE BOLD"', 'system-ui', 'sans-serif'],
        'switch-reg': ['"SWITCH COMMERCE REG"', 'system-ui', 'sans-serif'],
      },
      colors: {
        'brand-blue': '#002b5e',
        'brand-orange': '#ff4f00'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
