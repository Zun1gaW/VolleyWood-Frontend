/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        voley: {
          light: "#3b82f6",
          dark: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};
