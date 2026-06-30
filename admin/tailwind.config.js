/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#003fb1", dark: "#00174d", light: "#dbe1ff", container: "#1a56db" },
        secondary: { DEFAULT: "#00687a", container: "#57dffe", fixed: "#acedff", "fixed-dim": "#4cd7f6" },
        tertiary: { DEFAULT: "#852b00", container: "#ad3b00", fixed: "#ffdbcf", "fixed-dim": "#ffb59a" },
        surface: { DEFAULT: "#0f172a", dim: "#1e293b", bright: "#334155", container: { DEFAULT: "#1e293b", low: "#0f172a", high: "#334155", highest: "#475569", lowest: "#0f172a" }, variant: "#1e293b", tint: "#60a5fa" },
        "on-surface": { DEFAULT: "#f1f5f9", variant: "#94a3b8" },
        "on-primary": { DEFAULT: "#ffffff", container: "#d4dcff" },
        "on-secondary": { DEFAULT: "#ffffff", container: "#006172" },
        "on-tertiary": { DEFAULT: "#ffffff", container: "#ffd4c5" },
        outline: { DEFAULT: "#737686", variant: "#c3c5d7" },
        error: { DEFAULT: "#ba1a1a", container: "#ffdad6" },
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",
        "inverse-primary": "#b5c4ff",
        background: "#0f172a",
        civic: { green: "#16A34A", amber: "#D97706", red: "#DC2626" },
      },
      fontFamily: { sans: ["Inter", "sans-serif"] },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "800" }],
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.03em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg-mobile": ["28px", { lineHeight: "1.2", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1", letterSpacing: "0.01em", fontWeight: "600" }],
      },
      spacing: { gutter: "1.5rem", "container-max": "1280px" },
      borderRadius: { glass: "1rem" },
    },
  },
  plugins: [],
};
