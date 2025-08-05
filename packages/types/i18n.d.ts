// src/types/i18n.d.ts

export type LocalizedString = {
  [locale: string]: string; // key เป็น locale code (e.g., "en", "th"), value เป็น string
};

// หากคุณไม่ได้ใช้ next-intl อีกต่อไป, คุณสามารถลบส่วน declare global { interface IntlMessages ... } ออกได้
// หรือปรับให้สอดคล้องกับโครงสร้าง messages ของ i18next หากคุณจะโหลดจาก JSON files
// ตัวอย่าง:
// import 'i18next';
// declare module 'i18next' {
//   interface CustomTypeOptions {
//     defaultNS: 'common';
//     resources: {
// //       common: typeof import('../messages/en.json')['common'];
//       common: typeof import('../messages/common/en.json');
//       auth: typeof import('../messages/auth/en.json');
//     };
//   }
// }
