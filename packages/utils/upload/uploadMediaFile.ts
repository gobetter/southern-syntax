import { DuplicateFileError, TranslatedUploadError } from "../errors";

export async function uploadMediaFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/media/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({
      error: "unexpected_api_error", // Key สำรองกรณี parse JSON ไม่ได้
      context: { filename: file.name },
    }))) as { error: string; context?: Record<string, string | number> };

    const messageKey = errorData.error;
    const context: Record<string, string | number> = errorData.context || {
      filename: file.name,
    };

    if (messageKey === "error.duplicate_file") {
      throw new DuplicateFileError(context);
    }

    throw new TranslatedUploadError(messageKey, context);
  }

  return file.name;
}
