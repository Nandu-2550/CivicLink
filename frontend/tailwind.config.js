/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: "rgba(255, 255, 255, 0.08)",
        "glass-dark": "rgba(2, 6, 23, 0.55)",
      },
      backdropBlur: {
        glass: "16px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(129, 140, 248, 0.35), 0 8px 35px rgba(15, 23, 42, 0.5)",
      },
    },
  },
  plugins: [],
};