import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "local",
    include: ["test/local/**/*.local-test.ts"],
    environment: "node",
    testTimeout: 600000,
    maxConcurrency: 1,
    fileParallelism: false,
    sequence: {
      concurrent: false,
      shuffle: false,
    },
  },
});
