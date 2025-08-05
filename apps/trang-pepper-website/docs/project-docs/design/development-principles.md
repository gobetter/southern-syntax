# **💡 หลักการพัฒนาโครงการ Trang Pepper CMS**

เอกสารนี้สรุปหลักการและปรัชญาสำคัญที่ใช้เป็นแนวทางในการพัฒนาโครงการ Multilingual CMS "Trang Pepper CMS" เพื่อให้มั่นใจในคุณภาพ, ความยืดหยุ่น, และความสามารถในการบำรุงรักษาในระยะยาว

## **🎯 หลักการพัฒนาหลัก**

1. **ความเป็นโมดูล (Modularity):**
   - **แนวคิด:** แบ่งระบบออกเป็นส่วนย่อยๆ ที่ทำงานเป็นอิสระและมีความรับผิดชอบเฉพาะด้าน (Separation of Concerns) เพื่อให้โค้ดสะอาด, เข้าใจง่าย, และลดผลกระทบเมื่อมีการเปลี่ยนแปลง
   - **การนำไปใช้:** จัดโครงสร้างโค้ดเป็นโฟลเดอร์แยกตามฟังก์ชัน (เช่น src/lib/auth/), แยก Service Layer สำหรับ Business Logic.
2. **การนำกลับมาใช้ใหม่ได้ (Reusability):**
   - **แนวคิด:** สร้าง Components, Utility functions, และ Services ที่สามารถนำกลับมาใช้ซ้ำได้ทั่วทั้ง Application.
   - **การนำไปใช้:** พัฒนา UI Components ด้วย Shadcn UI, สร้างฟังก์ชัน Utility ที่นำกลับมาใช้ได้ (เช่น hashPassword, can), แยก Authentication/Authorization Logic เป็น Service.
3. **ความยืดหยุ่น (Flexibility):**
   - **แนวคิด:** ออกแบบระบบที่สามารถปรับเปลี่ยนหรือขยายได้ง่ายในอนาคต โดยเฉพาะการจัดการข้อมูลผ่าน Admin UI โดยไม่ต้องแก้ไขโค้ดหรือรัน Migration.
   - **การนำไปใช้:** การใช้ String type สำหรับ Role/Permission name/action/resource ใน Database, การเพิ่มฟิลด์ key สำหรับ Technical ID, การใช้ Supabase เป็น Database Provider.
4. **ความปลอดภัยด้าน Type (Type Safety):**
   - **แนวคิด:** ใช้ TypeScript ในโหมด Strict เพื่อตรวจจับข้อผิดพลาดที่เกี่ยวกับชนิดข้อมูลตั้งแต่ Compile-time.
   - **การนำไปใช้:** ใช้ Zod สำหรับ Runtime Validation ของข้อมูล Input, ขยาย Type ของ NextAuth.js Session/JWT, สร้าง const objects สำหรับค่าคงที่ของ Roles/Permissions.
5. **การรองรับหลายภาษาอย่างสมบูรณ์ (Comprehensive i18n/l10n Support):**
   - **แนวคิด:** เตรียมพร้อมสำหรับการแปลทั้ง Static Text (UI) และ Dynamic Content (ข้อมูลในฐานข้อมูล) ตั้งแต่การออกแบบโครงสร้างข้อมูล.
   - **การนำไปใช้:** การมี preferredLanguage ใน User Model, การวางแผนการใช้ JSONB data type สำหรับ Dynamic Content, การแยก key (technical) กับ name/description (display) ใน RBAC Models.
6. **การทดสอบ (Testability):**
   - **แนวคิด:** ออกแบบโค้ดให้สามารถทดสอบได้ง่าย และมีการวางแผนสำหรับ Unit, Integration, และ E2E Testing.
   - **การนำไปใช้:** แยก Business Logic ออกเป็น Service, ตั้งค่า Vitest สำหรับ Unit/Component Testing.
7. **การจัดทำเอกสาร (Documentation):**
   - **แนวคิด:** บันทึกการตัดสินใจ, แผนงาน, และคู่มือต่างๆ อย่างละเอียดและเป็นระบบ เพื่อให้เป็นแหล่งข้อมูลที่แท้จริงและช่วยในการ Onboarding/บำรุงรักษาในอนาคต.
   - **การนำไปใช้:** จัดโครงสร้าง docs/ และ project-docs/ อย่างเป็นระเบียบ, บันทึกการตัดสินใจทางเทคนิคใน technical-decisions.md.

## **✍️ ผู้จัดทำ**

- Isara Chumsri (2024–2025)
- Codex \+ ChatGPT (ระบบผู้ช่วยร่วมพัฒนา)
