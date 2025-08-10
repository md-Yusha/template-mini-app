import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        // Cyberpunk Neon Colors
        "neon-cyan": "var(--neon-cyan)",
        "neon-magenta": "var(--neon-magenta)",
        "neon-green": "var(--neon-green)",
        "neon-yellow": "var(--neon-yellow)",
        "neon-orange": "var(--neon-orange)",

        // Glassmorphism
        "glass-bg": "var(--glass-bg)",
        "glass-border": "var(--glass-border)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "neon-pulse": "neon-pulse 2s ease-in-out infinite alternate",
        "neon-flicker": "neon-flicker 0.5s ease-in-out infinite",
        "cyberpunk-scan": "cyberpunk-scan 2s linear infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
      keyframes: {
        "neon-pulse": {
          "0%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
        "neon-flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "cyberpunk-scan": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow:
              "0 0 20px rgba(0, 230, 255, 0.5), 0 0 40px rgba(0, 230, 255, 0.3)",
          },
          "50%": {
            boxShadow:
              "0 0 30px rgba(0, 230, 255, 0.8), 0 0 60px rgba(0, 230, 255, 0.5)",
          },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "neon-cyan":
          "0 0 20px rgba(0, 230, 255, 0.5), 0 0 40px rgba(0, 230, 255, 0.3)",
        "neon-magenta":
          "0 0 20px rgba(255, 77, 210, 0.5), 0 0 40px rgba(255, 77, 210, 0.3)",
        "neon-green":
          "0 0 20px rgba(0, 255, 163, 0.5), 0 0 40px rgba(0, 255, 163, 0.3)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
    },
  },
} satisfies Config;
