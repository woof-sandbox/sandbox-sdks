import { defineConfig } from "vitest/config";
import local from "./vitest.config.local";

export default defineConfig({
  test: {
    ...local.test,
    name: "all",
    include: [
      "test/unit/**/*.test.ts",
      "test/e2e/**/*.e2e-test.ts",
      "test/local/**/*.local-test.ts",
    ],
    environment: "node",
  },
});
