
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-blue': '#002b5e',
        'brand-orange': '#ff4f00'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
