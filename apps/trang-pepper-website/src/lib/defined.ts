// apps/trang-pepper-website/src/lib/defined.ts
export const isDef = <T>(v: T | undefined | null): v is T =>
  v !== undefined && v !== null;

/** เก็บเฉพาะพร็อพที่ค่า !== undefined */
export function pickDefined<T extends Record<PropertyKey, unknown>>(
  obj: T
): { [K in keyof T]?: Exclude<T[K], undefined> } {
  const out = {} as { [K in keyof T]?: Exclude<T[K], undefined> };

  for (const k of Object.keys(obj) as (keyof T)[]) {
    const v = obj[k];
    if (v !== undefined) {
      // บอก TS ว่า v ตัด undefined แล้ว
      out[k] = v as Exclude<T[typeof k], undefined>;
    }
  }
  return out;
}

/** ถ้าต้องการตัดทั้ง undefined และ null */
export function pickNonNil<T extends Record<PropertyKey, unknown>>(
  obj: T
): { [K in keyof T]?: Exclude<T[K], undefined | null> } {
  const out = {} as { [K in keyof T]?: Exclude<T[K], undefined | null> };

  for (const k of Object.keys(obj) as (keyof T)[]) {
    const v = obj[k];
    if (v !== undefined && v !== null) {
      out[k] = v as Exclude<T[typeof k], undefined | null>;
    }
  }
  return out;
}
