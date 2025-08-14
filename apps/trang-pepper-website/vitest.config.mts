import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/__setupTests.ts"],
    include: [
      "src/**/*.test.{ts,tsx}",
      "src/**/__tests__/**/*.{test,spec}.{ts,tsx}",
    ],
    // บังคับให้ inline workspace pkg เพื่อให้ alias ถูกใช้ระหว่างแปลงโค้ด
    deps: {
      inline: ["@southern-syntax/db", "server-only"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // ชี้ "server-only" ไปที่สตับของเรา
      "server-only": path.resolve(
        __dirname,
        "./src/__tests__/stubs/server-only.ts"
      ),
    },
  },
  optimizeDeps: {
    // กันไม่ให้ esbuild ไปพรีบันเดิลตัวนี้
    exclude: ["server-only"],
  },
});
