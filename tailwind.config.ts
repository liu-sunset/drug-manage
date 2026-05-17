/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#fdfbf7",
        foreground: "#2d2d2d",
        primary: {
          DEFAULT: "#ff4d4d",
          foreground: "#ffffff",
          50: "#fff5f5",
          100: "#ffe5e5",
          200: "#ffcccc",
          300: "#ff9999",
          400: "#ff6666",
          500: "#ff4d4d",
          600: "#e63939",
          700: "#cc2626",
          800: "#b31a1a",
          900: "#990d0d",
          950: "#660000",
        },
        secondary: {
          DEFAULT: "#e5e0d8",
          foreground: "#2d2d2d",
        },
        destructive: {
          DEFAULT: "#ff4d4d",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#e5e0d8",
          foreground: "#6b6560",
        },
        accent: {
          DEFAULT: "#2d5da1",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#2d2d2d",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#2d2d2d",
        },
        "ballpoint": "#2d5da1",
        "paper": "#fdfbf7",
        "pencil": "#2d2d2d",
        "marker": "#ff4d4d",
        "postit": "#fff9c4",
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
      },
      fontFamily: {
        heading: ['"Kalam"', 'cursive'],
        body: ['"Patrick Hand"', 'cursive'],
        sans: ['"Patrick Hand"', 'cursive'],
      },
      boxShadow: {
        hard: "4px 4px 0px 0px #2d2d2d",
        "hard-sm": "2px 2px 0px 0px #2d2d2d",
        "hard-lg": "6px 6px 0px 0px #2d2d2d",
        "hard-hover": "2px 2px 0px 0px #2d2d2d",
        "hard-none": "0px 0px 0px 0px #2d2d2d",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
