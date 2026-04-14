/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard",
          "Apple SD Gothic Neo",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50:  "#e6f1fb",
          100: "#b5d4f4",
          400: "#378add",
          600: "#185fa5",
          800: "#0c447c",
          900: "#042c53",
        },
      },
    },
  },
  plugins: [],
};
