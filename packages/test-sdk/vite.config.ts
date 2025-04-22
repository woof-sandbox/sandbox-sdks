import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@woof-software/comet-sdk-wagmi": path.resolve(
        __dirname,
        "../comet-sdk-wagmi/src",
      ),
      "@woof-software/comet-sdk": path.resolve(__dirname, "../comet-sdk/src"),
    },
  },
});
