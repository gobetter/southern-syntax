// packages/i18n/src/index.ts
export * from "./request";
export * from "./utils";

// อยาก expose ให้ import จาก root ก็ re-export แบบนี้ (ไม่ต้อง import เข้ามาก่อน)
export { default as enMessages } from "./messages/en";
export { default as thMessages } from "./messages/th";

// ถ้าจำเป็นต้องมี all-in-one map ให้ย้ายไปไฟล์แยก
// export * as allMessages from "./messages"; // หรือทำไฟล์ all-messages.ts แยก

/*
export * from "./request";
export * from "./utils";

// ✅ รวม messages ทุกภาษาเป็น map เดียว
import en from "./messages/en";
import th from "./messages/th";

export const messages = { en, th } as const;
export type AppLocale = keyof typeof messages;

// (ถ้าจำเป็นต้องมี type ของ EN แยก ค่อย export เพิ่มได้)
// export type EnMessages = typeof en;

// Export a typed version of the English messages
// import enMessages from "./messages/en";
// export { enMessages };
export { default as enMessages } from "./messages/en";
*/
