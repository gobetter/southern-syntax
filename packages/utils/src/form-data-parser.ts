// packages/utils/src/form-data-parser.ts
import Busboy from "busboy";
import type { File } from "@southern-syntax/types";
import type { IncomingHttpHeaders } from "http";

interface ParsedFormData {
  fields: Record<string, string>;
  files: Record<string, File[]>;
}

export async function parseMultipartFormData(
  req: Request
): Promise<ParsedFormData> {
  return new Promise((resolve, reject) => {
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return reject(
        new Error("Invalid content-type. Expected multipart/form-data.")
      );
    }

    // แปลง Headers object ของ Request ให้เป็น IncomingHttpHeaders โดยประมาณ
    const headers: IncomingHttpHeaders = {};
    req.headers.forEach((value, key) => {
      // IncomingHttpHeaders รองรับ string | string[] | undefined
      headers[key.toLowerCase()] = value;
    });

    let busboy: Busboy.Busboy;
    try {
      busboy = Busboy({ headers });
    } catch (e) {
      return reject(e instanceof Error ? e : new Error(String(e)));
    }

    const fields: Record<string, string> = {};
    const files: Record<string, File[]> = {};
    const filePromises: Promise<void>[] = [];

    busboy.on("field", (name: string, val: string) => {
      fields[name] = val;
    });

    busboy.on(
      "file",
      (
        name: string,
        fileStream: NodeJS.ReadableStream,
        info: { filename: string; encoding: string; mimeType: string }
      ) => {
        const { filename, encoding, mimeType } = info;
        const chunks: Buffer[] = [];

        const filePromise = new Promise<void>((resolveFile, rejectFile) => {
          // ระบุชนิด chunk ให้ชัดเจนเป็น Buffer
          fileStream.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
          });

          fileStream.on("end", () => {
            if (!files[name]) files[name] = [];
            files[name].push({
              filename,
              encoding,
              mimeType,
              content: Buffer.concat(chunks),
            });
            resolveFile();
          });

          fileStream.on("error", (err) => {
            rejectFile(err instanceof Error ? err : new Error(String(err)));
          });
        });

        filePromises.push(filePromise);
      }
    );

    busboy.on("error", (err) => {
      reject(err instanceof Error ? err : new Error(String(err)));
    });

    // หลีกเลี่ยง async callback บน event (กัน no-misused-promises)
    busboy.on("finish", () => {
      Promise.all(filePromises)
        .then(() => resolve({ fields, files }))
        .catch((err) =>
          reject(err instanceof Error ? err : new Error(String(err)))
        );
    });

    async function pipeToBusboy() {
      if (!req.body) return busboy.end();
      const reader = req.body.getReader();
      // อ่านเป็นชิ้นๆ แล้วส่งเข้า busboy
      // แปลง Uint8Array -> Buffer ให้ชัดเจน

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        busboy.write(Buffer.from(value)); // ✅ ชัดเจนว่าคือ Buffer
      }
      busboy.end();
    }

    pipeToBusboy().catch((e) => {
      reject(e instanceof Error ? e : new Error(String(e)));
    });
  });
}
