import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./modals/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors:{
        "item-bd" : "#813E14FF",
        "fg" : "#CB7B54FF",
        "fg-shadow" : "#A36445FF",
        "fg-item" : "#6C3318FF",
        "bg" : "#6C3318FF",
        "bg-sub" : "#B76352FF"
      },
      fontFamily :{

      }
    },
  },
  plugins: [],
};
export default config;
