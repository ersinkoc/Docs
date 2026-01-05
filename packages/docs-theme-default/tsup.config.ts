import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/styles/index.ts"],
  format: ["esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  outDir: "dist",
  packages: "package",
});
