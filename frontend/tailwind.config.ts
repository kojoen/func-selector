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
        bg: "#FAFAF9",
        card: "#FFFFFF",
        border: "#E8E5E0",
        "border-strong": "#D4D0C8",
        accent: "#E8553A",
        "accent-hover": "#D44A32",
        text: {
          DEFAULT: "#1C1917",
          secondary: "#78716C",
          muted: "#A8A29E",
        },
        tag: {
          bg: "#F5F3EF",
          text: "#57534E",
        },
        ok: "#16A34A",
        err: "#DC2626",
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
