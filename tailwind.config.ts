import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#E8EAF0",
          surface: "#F4F5F8",
          card: "#FFFFFF",
        },
        brand: {
          DEFAULT: "#16A34A",
          hover: "#15803D",
          light: "#BBF7D0",
          medium: "#4ADE80",
          dark: "#166534",
        },
        status: {
          warning: "#F59E0B",
          danger: "#DC2626",
          success: "#16A34A",
          info: "#2563EB",
        },
        dsa: {
          text: "#20212A",
          muted: "#64748B",
          subtle: "#94A3B8",
          border: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        sm: "10px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        soft: "6px 6px 12px rgba(0, 0, 0, 0.06), -6px -6px 12px rgba(255, 255, 255, 0.55)",
        inset: "inset 4px 4px 8px rgba(0, 0, 0, 0.05), inset -4px -4px 8px rgba(255, 255, 255, 0.45)",
        card: "0 4px 12px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
