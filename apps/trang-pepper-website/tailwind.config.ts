import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // ✅ Path ที่ 1: สแกนไฟล์ทั้งหมดที่อยู่ในโฟลเดอร์ src ของแอปพลิเคชัน
    "./src/**/*.{js,ts,jsx,tsx,mdx}",

    // ✅ Path ที่ 2 (สำคัญที่สุด): สแกนไฟล์ทั้งหมดที่อยู่ใน "คลัง UI" ส่วนกลางของเรา
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Tailwind v4 จะดึงค่าสีและตัวแปรจาก globals.css ของคุณโดยอัตโนมัติ
      // คุณไม่จำเป็นต้องประกาศซ้ำที่นี่ แต่สามารถเพิ่มค่าอื่นๆ ได้ถ้าต้องการ
    },
  },
  plugins: [
    // ถ้าคุณใช้ plugin เพิ่มเติม เช่น require("tailwindcss-animate") ให้ใส่ที่นี่
  ],
};
export default config;
