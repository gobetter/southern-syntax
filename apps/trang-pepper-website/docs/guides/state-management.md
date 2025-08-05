# Zustand State Management

โครงสร้างเบื้องต้นสำหรับการจัดการ state ส่วนกลางของโปรเจกต์นี้ใช้ [Zustand](https://github.com/pmndrs/zustand).

ไฟล์ store หลักอยู่ใน `src/store/` เพื่อให้สามารถนำไปใช้ได้สะดวกผ่าน alias `@/store`.

ปัจจุบันมีตัวอย่าง `useThemeStore` สำหรับจัดการโหมด `light`/`dark` และบันทึกค่าลง `localStorage` ด้วย middleware `persist`.

สามารถสร้าง store อื่น ๆ เพิ่มเติมในโฟลเดอร์นี้ และ export ผ่าน `src/store/index.ts` ได้เลย
เพื่อให้ส่วนต่าง ๆ ของแอปนำไปใช้ได้ง่ายขึ้น
