/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        card: "#f8fafc",
        surface: "#f1f5f9",
        border: "#e2e8f0",
        text: "#0f172a",
        "text-secondary": "#475569",
        "text-muted": "#64748b",
        primary: "#0f172a",
        "primary-light": "#e2e8f0",
        accent: "#ec4899",
        "accent-soft": "#fce7f3",
        like: "#dc2626",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "14px",
        "3xl": "18px",
      },
    },
  },
  plugins: [],
};
