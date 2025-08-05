import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}", // ✅ บอกให้ Tailwind รู้จัก UI Package ของเราด้วย
  ],
  theme: {
    extend: {
      // คุณสามารถเพิ่ม theme ที่นี่ได้ในอนาคต
    },
  },
  plugins: [],
};
export default config;
