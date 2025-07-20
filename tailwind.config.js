
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  daisyui: {
    themes: ["light", "night"],
    darkTheme: "night",
    base: true,
    styled: true,
    utils: true,
    logs: false,
    rtl: false,
    prefix: "",
  },
  plugins: [
    require('daisyui'),
  ],
}
