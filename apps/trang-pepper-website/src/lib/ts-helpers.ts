export type ExactOptional<T> =
  // required keys
  {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K];
  } & // optional keys (ถ้ามี ต้องไม่เป็น undefined)
  {
    [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<
      T[K],
      undefined
    >;
  };

/** คืน object ที่ตัดทุก key ที่มีค่า undefined ทิ้ง (แก้ exactOptionalPropertyTypes) */
export function pickDefined<T extends object>(obj: T): ExactOptional<T> {
  // ใช้ Record<keyof T, unknown> (ไม่ใช่ Partial<T>) เพื่อเลี่ยงการ "แปลง Partial<T> → ชนิดที่เข้มกว่า"
  const out: Record<keyof T, unknown> = {} as Record<keyof T, unknown>;

  for (const key of Object.keys(obj) as (keyof T)[]) {
    const val = obj[key];
    if (val !== undefined) {
      out[key] = val as unknown;
    }
  }

  // แคสต์ผ่าน unknown ตามคำแนะนำของ TS เพื่อยืนยันว่าเราได้คัด undefined ออกที่ runtime แล้ว
  return out as unknown as ExactOptional<T>;
}

/** แปลง Record<string, string | undefined> -> Record<string, string> โดยกรอง undefined ออก */
export function compactRecord(
  obj: Record<string, string | undefined>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

/** บาง prop ต้องเป็น string ไม่รับ undefined → บังคับค่าสำรอง */
export const requiredString = (v: string | undefined, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

/** prop ที่ต้องเป็น null ถ้าไม่มีค่า (เช่น string | null) */
export const orNull = <T>(v: T | undefined | null): T | null =>
  v == null ? null : v;

/** boolean/CheckedState ห้าม undefined */
export const requiredBool = (
  v: boolean | undefined,
  fallback = false
): boolean => (typeof v === "boolean" ? v : fallback);
