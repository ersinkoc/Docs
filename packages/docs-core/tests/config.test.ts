/**
 * @oxog/docs-core - Config Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ConfigLoader } from "../src/config.js";
import type { DocsConfig } from "../src/types.js";

describe("ConfigLoader", () => {
  let loader: ConfigLoader;

  beforeEach(() => {
    loader = new ConfigLoader();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("detectConfigPath()", () => {
    it("should return undefined when no config exists", () => {
      vi.spyOn(require("node:fs"), "existsSync").mockReturnValue(false);

      const path = loader.detectConfigPath("/non-existent");

      expect(path).toBeUndefined();
    });
  });

  describe("load()", () => {
    it("should throw for unsupported extension", async () => {
      await expect(loader.load("/test.json")).rejects.toThrow(
        "Unsupported config file extension: .json",
      );
    });
  });

  describe("resolve()", () => {
    it("should apply defaults", async () => {
      const adapter = {
        name: "test",
        createRenderer: () => ({ render: () => "" }),
      };
      const config = await loader.resolve({
        adapter: adapter as DocsConfig["adapter"],
      });

      expect(config.title).toBe("Documentation");
      expect(config.description).toBe("");
      expect(config.base).toBe("/");
      expect(config.srcDir).toBe("docs");
      expect(config.outDir).toBe("dist");
    });

    it("should use provided values", async () => {
      const adapter = {
        name: "test",
        createRenderer: () => ({ render: () => "" }),
      };
      const config = await loader.resolve({
        adapter: adapter as DocsConfig["adapter"],
        title: "My Docs",
        description: "My description",
        base: "/docs/",
        srcDir: "my-docs",
        outDir: "build",
      });

      expect(config.title).toBe("My Docs");
      expect(config.description).toBe("My description");
      expect(config.base).toBe("/docs/");
      expect(config.srcDir).toBe("my-docs");
      expect(config.outDir).toBe("build");
    });

    it("should throw when adapter is missing", async () => {
      await expect(loader.resolve({})).rejects.toThrow("Adapter is required");
    });
  });

  describe("validate()", () => {
    it("should pass for valid config", () => {
      const adapter = {
        name: "test",
        createRenderer: () => ({ render: () => "" }),
      };
      const config: DocsConfig = {
        title: "Test",
        adapter: adapter as DocsConfig["adapter"],
      };

      const result = loader.validate(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail when title is missing", () => {
      const adapter = {
        name: "test",
        createRenderer: () => ({ render: () => "" }),
      };
      const config = {
        title: undefined,
        adapter: adapter as DocsConfig["adapter"],
      } as unknown as DocsConfig;

      const result = loader.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.path).toBe("title");
    });

    it("should fail when adapter is missing", () => {
      const config = {
        title: "Test",
        adapter: undefined,
      } as unknown as DocsConfig;

      const result = loader.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === "adapter")).toBe(true);
    });

    it("should fail when srcDir is not a string", () => {
      const adapter = {
        name: "test",
        createRenderer: () => ({ render: () => "" }),
      };
      const config = {
        title: "Test",
        adapter: adapter as DocsConfig["adapter"],
        srcDir: 123,
      } as unknown as DocsConfig;

      const result = loader.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === "srcDir")).toBe(true);
    });
  });
});
