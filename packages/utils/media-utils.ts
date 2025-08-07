// Helper function สำหรับแปลง Prisma.JsonValue ที่ซับซ้อนให้เป็น Record ที่ใช้งานง่าย
export function parseVariantRecord(
  value: unknown
): Record<string, string> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, string>;
  }
  return null;
}

// ใช้สำหรับหาค่า id ที่มีร่วมกันระหว่างหลายกลุ่ม
export function getCommonIds<T extends { id: string }>(
  items: T[][]
): Set<string> {
  if (!items.length) return new Set();
  return items.reduce(
    (acc, current) => {
      const currentIds = new Set(current.map((i) => i.id));
      return new Set([...acc].filter((id) => currentIds.has(id)));
    },
    new Set(items[0].map((i) => i.id))
  );
}

// ดึง path ของไฟล์จาก URL ของ Media Variants ที่เก็บใน Supabase Storage
export function extractStoragePaths(
  variants: unknown,
  bucket: string
): string[] {
  const record = parseVariantRecord(variants);
  if (!record) return [];

  return Object.values(record)
    .map((url) => {
      try {
        const urlParts = new URL(url);
        return urlParts.pathname.split(`/${bucket}/`)[1];
      } catch {
        return null;
      }
    })
    .filter((path): path is string => !!path);
}
