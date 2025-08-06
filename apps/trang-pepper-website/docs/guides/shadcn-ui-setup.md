# **📦 การติดตั้ง Shadcn UI**

โปรเจกต์นี้ใช้ [shadcn/ui](https://ui.shadcn.com/) เป็นชุด Components ที่ปรับแต่งได้สูง ซึ่งสร้างขึ้นบนพื้นฐานของ Radix UI และ Tailwind CSS เพื่อให้คุณสามารถสร้าง UI ที่สวยงามและมีประสิทธิภาพได้อย่างรวดเร็ว

## **ขั้นตอนการ Initializing shadcn/ui**

เปิด Terminal ในโฟลเดอร์โปรเจกต์ของคุณ (trang-pepper-cms) และรันคำสั่งด้านล่างนี้:

```bash
pnpm dlx shadcn@latest init
```

เมื่อรันคำสั่งแล้ว CLI จะทำการตรวจสอบการตั้งค่าที่มีอยู่แล้วในโปรเจกต์ของคุณ และจะถามคำถามเฉพาะที่จำเป็นเท่านั้น โปรดเลือกตามคำแนะนำดังนี้:

- **✔ Preflight checks.**
- **✔ Verifying framework. Found Next.js.**
- **✔ Validating Tailwind CSS config. Found v4.**
- **✔ Validating import alias.**
- **Which color would you like to use as the base color?**
  - เลือกสีพื้นฐานที่คุณต้องการ (ตามที่คุณได้เลือกไว้คือ Neutral)
- **✔ Writing components.json.**
- **✔ Checking registry.**
- **✔ Updating CSS variables in src/app/globals.css**
- **✔ Installing dependencies.**
- **✔ Created 1 file: \- src/lib/utils.ts**
- **Success\! Project initialization completed. You may now add components.**

โดยปกติ shadcn/ui จะตรวจพบการตั้งค่าที่มีอยู่แล้ว เช่น TypeScript, Global CSS file (src/app/globals.css), Tailwind config (tailwind.config.ts), Import aliases (@/components, @southern-syntax/ui), และการใช้ React Server Components (จาก App Router) จึงไม่จำเป็นต้องถามคำถามเหล่านี้ซ้ำอีกครั้ง

## **การเพิ่ม Components**

หลังจาก Initializing สำเร็จ คุณสามารถเพิ่ม Components ของ shadcn/ui เข้ามาในโปรเจกต์ได้ทีละตัวตามที่คุณต้องการ ตัวอย่างเช่น การเพิ่ม Button:

```bash
pnpm dlx shadcn@latest add button
```

คำสั่งนี้จะดาวน์โหลดโค้ดของ Button component และวางไว้ใน src/components/ui/button.tsx (หรือตาม Path ที่คุณกำหนด)

## **การจัดการรูปแบบโค้ดอัตโนมัติ**

โค้ดที่เพิ่มมาจาก shadcn/ui อาจมีการจัดรูปแบบที่ไม่ตรงกับ ESLint และ Prettier ของคุณ โปรดตั้งค่า Editor (เช่น VS Code) ให้จัดรูปแบบโค้ดและแก้ไขข้อผิดพลาดของ ESLint โดยอัตโนมัติเมื่อบันทึกไฟล์ เพื่อให้การพัฒนาเป็นไปอย่างราบรื่น:

1. **ติดตั้ง VS Code Extensions:**
   - ESLint (โดย Microsoft)
   - Prettier \- Code formatter (โดย Prettier)
2. **เพิ่มโค้ดนี้ในไฟล์ settings.json ของ VS Code:**

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```
