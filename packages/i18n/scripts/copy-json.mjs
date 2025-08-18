import { cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const from = join(__dirname, "..", "src", "messages");
const to = join(__dirname, "..", "dist", "messages");

try {
  await cp(from, to, { recursive: true });
  console.log(`[i18n] Copied JSON messages to ${to}`);
} catch (err) {
  if (err?.code === "ENOENT") {
    console.warn("[i18n] No messages directory to copy");
  } else {
    console.error("[i18n] Failed to copy JSON messages", err);
    process.exit(1);
  }
}
