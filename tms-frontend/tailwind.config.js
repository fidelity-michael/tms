/** @type {import('tailwindcss').Config} */
export default {
  prefix: "tw-",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      dm: ["DM", "sans-serif"],
    },
    extend: {
      colors: {
        "mid-pale-blue": "#6A89A7",
        "light-blue": "#BDDDFC",
        "light-sky-blue": "#88BDF2",
        "dark-sky-blue": "#384959",
        "light-pale-blue-white": "#F5FBFF",
        "gray-300": "#C9D4EA",
        "green-correct": "#C1FFC9",
        "red-incorrect": "#FF7B7B",
      },
    },
  },
  plugins: [],
};
