// ไฟล์นี้ทำหน้าที่เป็น Root Page สำหรับ Path "/" (เช่น http://localhost:3000/)
// วัตถุประสงค์หลักคือการ Redirect ผู้ใช้ไปยังภาษา Default ที่มี Locale Prefix (เช่น /en)

import { redirect } from "next/navigation";
import { defaultLocale } from "@southern-syntax/config";

export default function RootPageRedirect() {
  // กำหนดภาษา Default ของคุณ (ต้องตรงกับ defaultLocale ใน next-intl.config.ts)

  // ทำการ Redirect Server-side ไปยัง Path ที่มี Locale Prefix
  // เช่น: http://localhost:3000/ จะถูก Redirect ไปยัง http://localhost:3000/en
  // หน้านี้ทำหน้าที่เดียวคือ redirect ไปยังภาษาเริ่มต้น
  // เพื่อให้แน่ใจว่า path "/" จะไม่แสดงหน้า 404
  redirect(`/${defaultLocale}`);
}
