/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'hospital': {
          'blue': '#005EB8',    // NHS Blue
          'light': '#00A3E0',   // NHS Light Blue
          'dark': '#003087',    // NHS Dark Blue
          'accent': '#41B6E6',  // NHS Accent Blue
          'white': '#FFFFFF',   // White
          'gray': '#E8EDEE',    // NHS Light Gray
        },
      },
      backgroundColor: {
        "custom-teal": "#00A3E0",
      },
      textColor: {
        "custom-blue": "#FFFFFF",
      },
    },
  },
  plugins: [],
};
