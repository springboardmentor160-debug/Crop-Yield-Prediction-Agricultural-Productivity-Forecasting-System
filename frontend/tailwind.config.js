/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pine: {
          50: "#eef4f1",
          100: "#d3e3db",
          200: "#a7c7b7",
          300: "#7aab93",
          400: "#4d8f6f",
          500: "#2f6b4f",
          600: "#1f4b3f",
          700: "#173a31",
          800: "#122c26",
          900: "#0d201b",
        },
        gold: {
          50: "#fbf6e9",
          100: "#f3e5bd",
          200: "#e9d18d",
          300: "#deba5c",
          400: "#d3a538",
          500: "#c99a2e",
          600: "#a97e22",
          700: "#87611a",
          800: "#634713",
          900: "#40300c",
        },
        soil: {
          50: "#f4efe9",
          100: "#e3d3c2",
          400: "#8a6547",
          600: "#6b4a31",
          800: "#3f2b1c",
        },
        canvas: "#f6f7f4",
        risk: {
          low: "#2f6b4f",
          moderate: "#c99a2e",
          high: "#b3452e",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        rows: "repeating-linear-gradient(180deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 14px)",
      },
    },
  },
  plugins: [],
};
