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
        bg: {
          DEFAULT: "#0C0C0E",
          raised: "#111114",
        },
        surface: {
          DEFAULT: "#161619",
          hover: "#1C1C20",
          active: "#222228",
        },
        border: {
          DEFAULT: "#232329",
          hover: "#2E2E38",
          accent: "#393945",
        },
        accent: {
          DEFAULT: "#818CF8",
          hover: "#6366F1",
          muted: "#4338CA",
          glow: "rgba(129, 140, 248, 0.12)",
          soft: "rgba(129, 140, 248, 0.08)",
        },
        teal: {
          DEFAULT: "#2DD4BF",
          muted: "rgba(45, 212, 191, 0.12)",
        },
        text: {
          DEFAULT: "#EDEDEF",
          secondary: "#8A8A98",
          muted: "#55555F",
          inverse: "#0C0C0E",
        },
        ok: { DEFAULT: "#34D399", muted: "rgba(52, 211, 153, 0.12)" },
        err: { DEFAULT: "#F87171", muted: "rgba(248, 113, 113, 0.12)" },
        warn: { DEFAULT: "#FBBF24", muted: "rgba(251, 191, 36, 0.12)" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "Menlo", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        glow: "0 0 24px -4px rgba(129, 140, 248, 0.18)",
        "glow-sm": "0 0 12px -2px rgba(129, 140, 248, 0.14)",
        "glow-lg": "0 0 40px -8px rgba(129, 140, 248, 0.22)",
        float: "0 8px 32px -8px rgba(0, 0, 0, 0.5)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
