import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple-inspired color palette
        primary: {
          DEFAULT: "#0071E3", // SF Blue - Apple's signature blue
          light: "#4DA3FF",
          lighter: "#B8D9FF",
          dark: "#0051BA",
        },
        accent: {
          DEFAULT: "#FF9500", // Apple Orange
          yellow: "#FFD60A",
          green: "#34C759",
          red: "#FF3B30",
          pink: "#FF2D55",
        },
        surface: {
          light: "#F5F5F7", // Apple Light Gray
          lighter: "#FAFAFA",
          DEFAULT: "#FFFFFF",
          dark: "#1D1D1D", // Apple Dark Gray
          darkCard: "#2B2B2B",
          darkCardDeep: "#1F1F1F",
        },
        slate: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      fontFamily: {
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"Helvetica Neue"',
          "sans-serif",
        ],
        body: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"Helvetica Neue"',
          "sans-serif",
        ],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px", letterSpacing: "-0.006em" }],
        sm: ["13px", { lineHeight: "18px", letterSpacing: "-0.008em" }],
        base: ["15px", { lineHeight: "22px", letterSpacing: "-0.012em" }],
        lg: ["17px", { lineHeight: "26px", letterSpacing: "-0.016em" }],
        xl: ["20px", { lineHeight: "30px", letterSpacing: "-0.02em" }],
        "2xl": ["24px", { lineHeight: "36px", letterSpacing: "-0.016em" }],
        "3xl": ["32px", { lineHeight: "48px", letterSpacing: "-0.016em" }],
        "4xl": ["40px", { lineHeight: "56px", letterSpacing: "-0.016em" }],
        "5xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.016em" }],
      },
      boxShadow: {
        xs: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
        sm: "0 2px 8px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
        card: "0 4px 20px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        lg: "0 12px 32px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
        xl: "0 20px 56px rgba(0,0,0,0.14), 0 4px 8px rgba(0,0,0,0.08)",
        "2xl": "0 32px 80px rgba(0,0,0,0.16), 0 8px 16px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      spacing: {
        "0.5": "2px",
        "1": "4px",
        "1.5": "6px",
        "2": "8px",
        "2.5": "10px",
        "3": "12px",
        "3.5": "14px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "9": "36px",
        "10": "40px",
        "12": "48px",
        "14": "56px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "12px",
        lg: "24px",
        xl: "40px",
      },
    },
  },
  plugins: [],
};
export default config;
