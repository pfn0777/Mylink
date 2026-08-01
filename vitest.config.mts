import { defineConfig } from "vitest/config";
import path from "node:path";

process.loadEnvFile(path.resolve(import.meta.dirname, ".env.local"));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
});
