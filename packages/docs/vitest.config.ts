import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    resolve: {
      alias: {
        "@oxog/docs-core": resolve(__dirname, "../docs-core/src/index.ts"),
        "@oxog/docs-theme-default": resolve(__dirname, "../docs-theme-default/src/index.ts"),
        "@oxog/docs-vanilla": resolve(__dirname, "../docs-vanilla/src/index.ts"),
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "*.config.*"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
