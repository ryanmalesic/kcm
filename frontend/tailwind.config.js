/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        karns: {
          DEFAULT: "#114A96",
          50: "#DFEBFB",
          100: "#C3DAF8",
          200: "#83B3F1",
          300: "#488EEA",
          400: "#1869D3",
          500: "#114A96",
          600: "#0E3B77",
          700: "#0A2E5C",
          800: "#071E3C",
          900: "#041020",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
