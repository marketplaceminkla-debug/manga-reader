import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F1923",
        panel: "#151F2A",
        line: "#1E2D3D",
        paper: "#F8FAFC",
        muted: "#7A8FA6",
        // MangaFinn palette
        purple: "#7C3AED",
        "purple-light": "#A78BFA",
        amber: "#F59E0B",
        pink: "#FB7185",
        mint: "#34D399",
        // semantic
        stamp: "#7C3AED",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "logo-draw": {
          "0%": { strokeDashoffset: "300" },
          "100%": { strokeDashoffset: "0" },
        },
        "loading-bar": {
          "0%": { width: "0%", opacity: "1" },
          "80%": { width: "85%", opacity: "1" },
          "100%": { width: "100%", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "logo-draw": "logo-draw 1s ease-out both",
        "loading-bar": "loading-bar 1.8s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
