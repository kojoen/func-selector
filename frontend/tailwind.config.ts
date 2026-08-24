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
        bg: "#111113",
        card: "#19191C",
        border: "#2A2A2E",
        "border-strong": "#3A3A40",
        accent: "#E8553A",
        "accent-hover": "#D44A32",
        text: {
          DEFAULT: "#ECECEF",
          secondary: "#8B8B93",
          muted: "#5C5C63",
        },
        tag: {
          bg: "#222226",
          text: "#9E9EA6",
        },
        ok: "#34D399",
        err: "#F87171",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
