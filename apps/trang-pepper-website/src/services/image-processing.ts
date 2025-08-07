import sharp from "sharp";

// เพิ่ม `name` เข้าไปใน Interface เพื่อการระบุตัวตน
interface ImageVariantConfig {
  name: string;
  width: number;
  height?: number;
  fit?: keyof sharp.FitEnum;
  format: keyof sharp.FormatEnum;
}

// สร้าง Type สำหรับผลลัพธ์ที่ชัดเจน
export interface ProcessedImageVariant {
  name: ImageVariantConfig["name"] | "original";
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

// กำหนดค่า config ของ variants
const IMAGE_VARIANTS: readonly ImageVariantConfig[] = [
  { name: "thumbnail", width: 200, height: 200, fit: "cover", format: "webp" },
  { name: "medium", width: 800, fit: "inside", format: "webp" },
  { name: "large", width: 1280, fit: "inside", format: "webp" },
];

/**
 * รับ Buffer ของรูปภาพเข้ามา แล้วแปลงเป็นขนาดและ format ต่างๆ ที่กำหนดไว้
 * @param imageBuffer Buffer ของรูปภาพต้นฉบับ
 * @param originalFilename ชื่อไฟล์ต้นฉบับ (เช่น 'my-image.jpg')
 * @returns Promise ที่จะ resolve เป็น array ของรูปภาพที่ถูกประมวลผลแล้ว
 */
export async function processImage(
  imageBuffer: Buffer,
  originalFilename: string
): Promise<ProcessedImageVariant[]> {
  const processedImages: ProcessedImageVariant[] = [];
  const filenameWithoutExt = originalFilename.split(".").slice(0, -1).join(".");
  const originalMimeType = `image/${originalFilename.split(".").pop()?.toLowerCase() || "jpeg"}`;

  // ประมวลผลแต่ละ Variant
  for (const variant of IMAGE_VARIANTS) {
    const processedBuffer = await sharp(imageBuffer)
      .resize({
        width: variant.width,
        height: variant.height,
        fit: variant.fit,
        withoutEnlargement: true, // ป้องกันการขยายภาพให้ใหญ่กว่าต้นฉบับ
      })
      .toFormat(variant.format)
      .toBuffer();

    processedImages.push({
      name: variant.name,
      buffer: processedBuffer,
      filename: `${filenameWithoutExt}-${variant.name}.${variant.format}`,
      mimeType: `image/${variant.format}`,
    });
  }

  // เพิ่มไฟล์ต้นฉบับเข้าไปในรายการด้วย
  processedImages.push({
    name: "original",
    buffer: imageBuffer,
    filename: originalFilename,
    mimeType: originalMimeType,
  });

  return processedImages;
}
