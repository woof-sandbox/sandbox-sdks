import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "local",
    include: ["test/local/**/*.local-test.ts"],
    environment: "node",
    testTimeout: 60000,
    sequence: {
      concurrent: false,
    },
  },
});
