import Busboy from "busboy";
import type { ReadableStream } from "stream/web";
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
      // กำหนดชนิดให้ body ชัดเจน (ReadableStream ของ Uint8Array) แล้วเลี่ยง destructuring
      const body = req.body as ReadableStream<Uint8Array> | null;

      if (!body) {
        busboy.end();
        return;
      }

      const reader = body.getReader();

      // อ่านทีละชิ้นแบบ type-safe
      // - ไม่ destructure (เลี่ยง no-unsafe-assignment)
      // - ตรวจ null/undefined ก่อนแปลง Buffer
      // - value เป็น Uint8Array เมื่อ done === false
      //   (ในบาง env types อาจเป็น union จึงเช็คก่อน)
      while (true) {
        const readResult = await reader.read(); // ReadableStreamReadResult<Uint8Array>
        if (readResult.done) break;

        const chunk: Uint8Array | undefined = readResult.value;
        if (chunk && chunk.byteLength > 0) {
          busboy.write(Buffer.from(chunk));
        }
      }
      busboy.end();
    }

    pipeToBusboy().catch((e) => {
      reject(e instanceof Error ? e : new Error(String(e)));
    });
  });
}
