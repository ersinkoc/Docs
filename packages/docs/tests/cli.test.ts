/**
 * @oxog/docs - CLI Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("CLI", () => {
  describe("init command", () => {
    it("should export init function", async () => {
      const { init } = await import("../src/commands/init.js");
      expect(typeof init).toBe("function");
    });
  });

  describe("dev command", () => {
    it("should export dev function", async () => {
      const { dev } = await import("../src/commands/dev.js");
      expect(typeof dev).toBe("function");
    });
  });

  describe("build command", () => {
    it("should export build function", async () => {
      const { build } = await import("../src/commands/build.js");
      expect(typeof build).toBe("function");
    });
  });

  describe("preview command", () => {
    it("should export preview function", async () => {
      const { preview } = await import("../src/commands/preview.js");
      expect(typeof preview).toBe("function");
    });
  });

  describe("new command", () => {
    it("should export newPage function", async () => {
      const { newPage } = await import("../src/commands/new.js");
      expect(typeof newPage).toBe("function");
    });
  });
});

describe("Framework Detection", () => {
  it("should export detectFramework", async () => {
    const { detectFramework } = await import("../src/utils/framework.js");
    expect(typeof detectFramework).toBe("function");
  });

  it("should export getAdapterPackage", async () => {
    const { getAdapterPackage } = await import("../src/utils/framework.js");
    expect(getAdapterPackage("react")).toBe("@oxog/docs-react");
    expect(getAdapterPackage("vue")).toBe("@oxog/docs-vue");
    expect(getAdapterPackage("vanilla")).toBe("@oxog/docs-vanilla");
  });

  it("should export getAdapterFactory", async () => {
    const { getAdapterFactory } = await import("../src/utils/framework.js");
    expect(getAdapterFactory("react")).toBe("react()");
    expect(getAdapterFactory("vue")).toBe("vue()");
    expect(getAdapterFactory("vanilla")).toBe("vanilla()");
  });
});

describe("defineConfig", () => {
  it("should return config as-is", async () => {
    const { defineConfig } = await import("../src/index.js");
    const config = { title: "Test" };
    const result = defineConfig(config as any);
    expect(result).toBe(config);
  });
});
