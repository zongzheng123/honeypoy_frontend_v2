import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: "Oswald, ui-serif", // Adds a new `font-display` class
      },
      backgroundColor: {
        default: "var(--bg,#1F1609)",
      },
      textColor: {
        default: "white",
        sub: "rgba(255,255,255,0.50)",
      },
      outlineColor: {
        base: "var(--button-stroke,rgba(247,147,26,0.20))",
      },
    },
  },
  darkMode: "class",
  plugins: [
     nextui({
    // defaultTheme: "dark",
    themes: {
      dark: {
        colors: {
          primary: "#FFCD4D",
          btn: "var(--Button-Gradient,linear-gradient(180deg,rgba(232,211,124,0.13)_33.67%,#FCD729_132.5%),#F7931A)",
          gray: {
            100: "#f7fafc",
            // ...
            900: "#1a202c",
          },
        }
      }
    }
  })],
};
export default config;
