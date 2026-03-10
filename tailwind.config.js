/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",
        "accent-glow": "var(--accent-glow)",
        card: "var(--card)",
        border: "var(--border)",
      },
    },
  },
  plugins: [],
}
