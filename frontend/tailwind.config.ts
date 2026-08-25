import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#090A0F",
        card: "#10121A",
        "card-hover": "#151824",
        border: "#1C2030",
        "border-strong": "#282E45",
        accent: "#6366F1",
        "accent-hover": "#4F46E5",
        "accent-glow": "rgba(99, 102, 241, 0.15)",
        cyan: {
          400: "#22D3EE",
          500: "#06B6D4",
        },
        text: {
          DEFAULT: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
        tag: {
          bg: "#161926",
          text: "#94A3B8",
        },
        ok: "#10B981",
        err: "#EF4444",
        warn: "#F59E0B",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(99, 102, 241, 0.25)",
        "glow-sm": "0 0 12px -3px rgba(99, 102, 241, 0.2)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
