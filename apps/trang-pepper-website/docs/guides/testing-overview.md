# 🧪 Testing Overview for Trang Pepper CMS

## ✅ ระบบทดสอบที่ใช้งาน

- **Test Runner:** [Vitest](https://vitest.dev)
- **Test Utilities (React Components):** [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)
- **Custom Matchers (DOM):** [@testing-library/jest-dom](https://github.com/testing-library/jest-dom)
- **Test Environment:** `jsdom` (สำหรับ Environment ที่จำลอง DOM ใน Node.js)

## 🧠 แนวทางการทดสอบ (Test Strategy)

- 🔹 **Unit Test:** ใช้ Vitest ร่วมกับ Testing Library สำหรับ component-based test
- 🔹 **Integration Test:** จำลองการ render + interaction ภายใน component เดียว
- 🔸 **E2E Test:** _(วางแผนใช้ _[_Playwright_](https://playwright.dev)_ ในอนาคต)_

## 🗂 โฟลเดอร์และไฟล์ที่เกี่ยวข้อง

| ตำแหน่ง                       | คำอธิบาย                                                                            |
| :---------------------------- | :---------------------------------------------------------------------------------- |
| `vitest.config.mts`           | กำหนดค่า Vitest เช่น Path ของ Test files, Environment, และ Setup files.             |
| `src/__tests__/setupTests.ts` | ไฟล์สำหรับตั้งค่า Global Test Environment (เช่น `jest-dom` matchers, Global Mocks). |
| `tsconfig.vitest.json`        | แยกการตั้งค่า TypeScript เฉพาะสำหรับ Test files.                                    |

> ✅ Test file ทั้งหมดควรใช้นามสกุล `.test.ts`, `.test.tsx`, `.spec.ts` หรือ `.spec.tsx` และสามารถวางไว้ที่ใดก็ได้ในโฟลเดอร์ `src/` (ใกล้กับ Component ที่ทดสอบ)

---

## ✅ ตัวอย่างการเขียน Test

```typescript jsx
// 📄 src/components/HomeContent.test.tsx
import { render, screen } from '@testing-library/react'; // ไม่ต้อง import React เพราะ JSX transform
import { describe, it, expect } from 'vitest';
import HomeContent from './HomeContent'; // สมมติว่า HomeContent อยู่ในโฟลเดอร์เดียวกัน

describe('<HomeContent />', () => {
  it('renders heading and link', () => {
    render(<HomeContent />);

    // ตรวจสอบว่า Component แสดงข้อความที่คาดหวัง
    expect(screen.getByText(/welcome to trang pepper cms/i)).toBeInTheDocument();
    expect(screen.getByText(/click me/i)).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes('Learn More'))).toBeInTheDocument();
  });
});
```

---

## ⚠️ สิ่งที่มักลืม (Common Pitfalls)

| ปัญหา                                | แนวทางแก้                                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| JSX แล้วขึ้น `React is not defined`  | ต้อง `import React from 'react'` ใน test และ component ที่ใช้ใน test                     |
| ใช้ `toBeInTheDocument()` แล้ว error | ต้อง `import '@testing-library/jest-dom'` ใน `setupTests.ts` หรือไฟล์ test               |
| Vitest ไม่เจอ test                   | ตรวจ `vitest.config.ts` ว่า `include: ['src/**/*.{test,spec}.{ts,tsx}']` ครอบคลุมหรือไม่ |

---

## 🧼 เคล็ดลับ: ป้องกันคำเตือน CJS build deprecated

หากคุณเจอคำเตือนนี้ใน terminal:

> `The CJS build of Vite's Node API is deprecated...`

ให้แก้ไขดังนี้:

- ✅ เปลี่ยนชื่อไฟล์ `vitest.config.ts` → `vitest.config.mts` (เป็น .mts เพื่อบอกว่าเป็น ES Module)
- ✅ เพิ่ม `"type": "module"` ใน `package.json` ที่ Root ของโปรเจกต์ (ถ้ายังไม่มี)

แค่นี้ก็จะไม่มีคำเตือนอีก 🎉

---

## 🔄 ขั้นตอนหลังสร้าง Component ใหม่

1. สร้างไฟล์ `.tsx` (หรือ `.ts`) สำหรับ Component หรือ Logic
2. สร้างไฟล์ Test `.test.tsx` (หรือ `.test.ts`) คู่กัน โดยวางใกล้กันในโฟลเดอร์เดียวกัน (หรือใน `src/__tests__/` ถ้าคุณต้องการแยก).
3. รันคำสั่ง:

```bash
pnpm test      # หรือ: pnpm vitest
```

> 🎯 เป้าหมายระยะต่อไป: สร้าง CLI generator เพื่อสร้าง `.tsx + .test.tsx` พร้อมกัน (วางแผนใน Phase 4 หรือ Future Enhancements)

---

## 🔜 แผนต่อยอด

| รายการ                                                          | สถานะ                                       |
| --------------------------------------------------------------- | ------------------------------------------- |
| ✅ ตั้งระบบ Unit Test ด้วย Vitest + RTL                         | เสร็จสมบูรณ์ (Implemented)                  |
| 🟡 รวม test script เข้ากับ CI เช่น GitHub Actions (หรือ Vercel) | รอดำเนินการ                                 |
| 🟡 ติดตั้ง Playwright สำหรับ E2E test                           | รอดำเนินการ                                 |
| 🟡 สร้าง CLI สร้าง component + test อัตโนมัติ                   | วางแผนใน Phase 4 (หรือ Future Enhancements) |

---

## ✍️ ผู้จัดทำ

- Isara Chumsri (2024–2025)
- Codex + ChatGPT (ระบบผู้ช่วยร่วมพัฒนา)
