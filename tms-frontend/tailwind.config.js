/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");
const withMT = require("@material-tailwind/react/utils/withMT");
export default withMT({
  prefix: "tw-",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", flowbite.content(),],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM", "sans-serif"],
      },
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
  plugins: [flowbite.plugin(),],
});
