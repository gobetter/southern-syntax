import Busboy from "busboy";
import { type File } from "@southern-syntax/types";

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

    // แปลง Headers object ของ Request ให้เป็น plain object
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // ส่ง plain object ที่สร้างขึ้นมาใหม่เข้าไป
    const busboy = Busboy({ headers });

    const fields: Record<string, string> = {};
    const files: Record<string, File[]> = {};
    const filePromises: Promise<void>[] = [];

    busboy.on("field", (name, val) => {
      fields[name] = val;
    });

    busboy.on("file", (name, fileStream, info) => {
      const { filename, encoding, mimeType } = info;
      const chunks: Buffer[] = [];
      const filePromise = new Promise<void>((resolveFile, rejectFile) => {
        fileStream.on("data", (chunk) => chunks.push(chunk));
        fileStream.on("end", () => {
          if (!files[name]) {
            files[name] = [];
          }
          files[name].push({
            filename,
            encoding,
            mimeType,
            content: Buffer.concat(chunks),
          });
          resolveFile();
        });
        fileStream.on("error", rejectFile);
      });
      filePromises.push(filePromise);
    });

    busboy.on("finish", async () => {
      try {
        await Promise.all(filePromises);
        resolve({ fields, files });
      } catch (err) {
        reject(err);
      }
    });

    busboy.on("error", (err) => reject(err));

    // ใช้ async iterator ของ request body ซึ่งเป็นวิธีที่ทันสมัยและปลอดภัย
    async function pipeToBusboy() {
      if (!req.body) return busboy.end();
      const reader = req.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        busboy.write(value);
      }
      busboy.end();
    }

    pipeToBusboy().catch(reject);
  });
}
