import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: "./",
  build: {
    assetsDir: "",
    modulePreload: {
      polyfill: false
    }
  },
  plugins: [react(), removeMiniToolUnsupportedFiles(mode)],
  test: {
    environment: "node",
    globals: true
  }
}));

function removeMiniToolUnsupportedFiles(mode: string) {
  return {
    name: "remove-minitool-unsupported-files",
    closeBundle() {
      if (mode !== "minitool") return;
      rmSync(resolve("dist-minitool", "fonts", "README.md"), { force: true });
    }
  };
}
