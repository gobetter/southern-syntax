import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["scripts/__tests__/**/*.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@southern-syntax": new URL("../packages/", import.meta.url).pathname,
    },
  },
});
