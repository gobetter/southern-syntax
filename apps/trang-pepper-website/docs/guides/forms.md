# **แนวทางการจัดการฟอร์ม (Form Handling Guide)**

เอกสารนี้กำหนดแนวทางและ Best Practice สำหรับการสร้างและจัดการฟอร์มภายในโปรเจกต์ เพื่อให้มั่นใจในความสอดคล้องกัน, ความปลอดภัย, และประสบการณ์การพัฒนาที่ดีที่สุด

## หลักการสำคัญ

1. **Single Source of Truth for Validation:** กฎการตรวจสอบความถูกต้องของข้อมูล (Validation Logic) ทั้งหมดจะต้องถูกกำหนดไว้ที่ **Zod Schema** ในโฟลเดอร์ `src/lib/schemas/` เท่านั้น
2. **End-to-End Type Safety:** ใช้ Type ที่ `infer` จาก Zod Schema (`z.infer<typeof ...>`) ทั้งในฝั่ง Frontend และ Backend
3. **Lean Components:** React Component ควรมีหน้าที่แค่ "แสดงผล" UI และจัดการกับ State ของ UI เท่านั้น Logic การจัดการฟอร์มที่ซับซ้อนควรมอบหมายให้ Library จัดการ

## เครื่องมือหลัก (Core Stack)

- **Form Management:** `react-hook-form`
- **Schema & Validation:** `zod`
- **Resolver:** `@hookform/resolvers/zod`

## ขั้นตอนการสร้างฟอร์มใหม่

1. **สร้างหรือแก้ไข Zod Schema:**
   - ไปที่ `src/lib/schemas/` และสร้างหรือแก้ไข Schema สำหรับข้อมูลของฟอร์มนั้นๆ
   - กำหนดกฎการตรวจสอบทั้งหมดที่นี่ (เช่น `min`, `max`, `email`, `.refine` สำหรับ custom logic)
   - Export ทั้งตัว `schema` และ `type` ที่ได้จาก `z.infer`

   ```ts
   // ตัวอย่าง: src/lib/auth/schemas.ts
   import { z } from 'zod';

   export const credentialsSchema = z.object({
     email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').min(1, 'กรุณากรอกอีเมล'),
     password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
   });

   export type CredentialsInput = z.infer<typeof credentialsSchema>;
   ```

2. **สร้าง Form Component (Client Component):**
   - ใช้ `useForm` hook จาก `react-hook-form`
   - เชื่อมต่อ Zod Schema โดยใช้ `zodResolver`
   - ใช้ Type ที่ `infer` มาเป็น Generic Type ของ `useForm`

   ```tsx
   // src/components/auth/SignInForm.tsx
   'use client';

   import { useForm, type SubmitHandler } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { credentialsSchema, type CredentialsInput } from '@/lib/auth/schemas';

   export default function SignInForm() {
     const {
       register,
       handleSubmit,
       formState: { errors, isSubmitting },
     } = useForm<CredentialsInput>({
       resolver: zodResolver(credentialsSchema),
     });

     const onSubmit: SubmitHandler<CredentialsInput> = async (data) => {
       // ... Logic การส่งข้อมูลที่ผ่านการตรวจสอบแล้วไปที่ API ...
     };

     return (
       <form onSubmit={handleSubmit(onSubmit)}>
         <Input id="email" type="email" {...register('email')} />
         {errors.email && <p>{errors.email.message}</p>}

         <Input id="password" type="password" {...register('password')} />
         {errors.password && <p>{errors.password.message}</p>}

         <Button type="submit" disabled={isSubmitting}>
           Login
         </Button>
       </form>
     );
   }
   ```

3. **จัดการการส่งข้อมูล (Submission Logic):**
   - ฟังก์ชัน `onSubmit` จะถูกเรียกก็ต่อเมื่อข้อมูลผ่านการตรวจสอบจาก Zod แล้วเท่านั้น
   - `data` ที่ได้รับในฟังก์ชัน `onSubmit` จะมี Type ที่ถูกต้องและปลอดภัยเสมอ
   - ทำการเรียก API (เช่น `fetch` หรือ tRPC mutation) ภายในฟังก์ชันนี้

## ข้อดีของแนวทางนี้

- **ลดโค้ดซ้ำซ้อน:** ไม่ต้องเขียน Logic การตรวจสอบ (`if-else`) ใน Component อีกต่อไป
- **บำรุงรักษาง่าย:** หากต้องการเปลี่ยนกฎ Validation สามารถแก้ไขได้ที่ `schemas.ts` ที่เดียว
- **ความปลอดภัยสูง:** มีการตรวจสอบข้อมูลทั้งฝั่ง Client (เพื่อ UX ที่ดี) และฝั่ง Server (เพื่อความปลอดภัย) โดยใช้กฎเดียวกัน
