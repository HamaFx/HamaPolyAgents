import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bgPrimary: "rgb(var(--bg-primary) / <alpha-value>)",
        bgCard: "rgb(var(--bg-card) / <alpha-value>)",
        bgCardHover: "rgb(var(--bg-card-hover) / <alpha-value>)",
        bgInput: "rgb(var(--bg-input) / <alpha-value>)",
        textPrimary: "rgb(var(--text-primary) / <alpha-value>)",
        textSecondary: "rgb(var(--text-secondary) / <alpha-value>)",
        textMuted: "rgb(var(--text-muted) / <alpha-value>)",
        accentGreen: "rgb(var(--accent-green) / <alpha-value>)",
        accentRed: "rgb(var(--accent-red) / <alpha-value>)",
        accentBlue: "rgb(var(--accent-blue) / <alpha-value>)",
        accentYellow: "rgb(var(--accent-yellow) / <alpha-value>)",
        accentCyan: "rgb(var(--accent-cyan) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)"
      },
      boxShadow: {
        panel: "0 12px 34px -20px rgba(0, 0, 0, 0.85)",
        glow: "0 0 0 1px rgba(99, 102, 241, 0.2), 0 15px 35px -20px rgba(99, 102, 241, 0.6)"
      },
      animation: {
        pulseSoft: "pulse-soft 2.2s ease-in-out infinite",
        slideIn: "slide-in 0.6s ease-out forwards"
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" }
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
