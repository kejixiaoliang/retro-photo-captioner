import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  build: {
    assetsDir: "",
    modulePreload: {
      polyfill: false
    }
  },
  plugins: [react()],
  test: {
    environment: "node",
    globals: true
  }
});
