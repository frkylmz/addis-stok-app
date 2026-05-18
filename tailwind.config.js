/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        amber: {
          850: "#6f4e37", // Addis Ababa kurumsal kahve tonu
          950: "#4a3319",
        },
      },
    },
  },
  plugins: [],
};
