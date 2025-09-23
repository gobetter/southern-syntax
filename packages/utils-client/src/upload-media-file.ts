import { DuplicateFileError, TranslatedUploadError } from "@southern-syntax/utils";

export async function uploadMediaFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/media/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    // ให้ fallback key เป็นรูปแบบที่ถูกต้องตั้งแต่ต้น
    const errorData = (await response.json().catch(() => ({
      error: "error.unexpected_api_error", // ✅ ต้องขึ้นต้นด้วย "error."
      context: { filename: file.name },
    }))) as { error: string; context?: Record<string, string | number> };

    // แคบชนิดให้เป็น `error.${string}` อย่างปลอดภัย
    const messageKey: `error.${string}` =
      typeof errorData.error === "string" &&
      errorData.error.startsWith("error.")
        ? (errorData.error as `error.${string}`)
        : "error.unexpected_api_error";

    const context: Record<string, string | number> = errorData.context ?? {
      filename: file.name,
    };

    if (messageKey === "error.duplicate_file") {
      throw new DuplicateFileError(context);
    }

    throw new TranslatedUploadError(messageKey, context);
  }

  return file.name;
}
