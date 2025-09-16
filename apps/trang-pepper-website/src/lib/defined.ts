export const isDef = <T>(v: T | undefined | null): v is T =>
  v !== undefined && v !== null;

// รวมเฉพาะคีย์ที่มีค่าจริงๆ (ไม่ push undefined เข้าไปใน object)
export function pickDefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as any)[k] = v;
  }
  return out;
}
