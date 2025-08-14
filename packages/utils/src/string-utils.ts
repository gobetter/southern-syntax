import slugify from "slugify";

export function sanitizeFilename(filename: string): string {
  const parts = filename.split(".");
  const extension = parts.pop() || "bin";
  const name = parts.join(".") || "file";

  // ใช้ slugify ทำความสะอาด แต่ปล่อยอักขระไว้บางตัวได้ถ้าต้องการ
  let sanitizedName = slugify(name, {
    lower: true, // แปลงเป็นพิมพ์เล็ก
    strict: true, // ลบทุกอักขระที่ไม่ใช่ a-z0-9
    locale: "th", // รองรับภาษาไทย (optional)
  });

  // fallback หากชื่อไฟล์หายเกลี้ยง
  if (!sanitizedName || sanitizedName.replace(/[^a-z0-9]/g, "").length === 0) {
    sanitizedName = `file-${Date.now()}`;
  }

  return `${sanitizedName}.${extension.toLowerCase()}`;
}
