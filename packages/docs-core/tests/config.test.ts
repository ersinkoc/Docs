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

    it("should resolve adapter from function", async () => {
      const adapterObj = {
        name: "test",
        createRenderer: () => ({ render: () => "" }),
      };
      const config = await loader.resolve({
        adapter: () => adapterObj,
      });

      expect(config.adapter).toBe(adapterObj);
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

    it("should fail when outDir is not a string", () => {
      const adapter = {
        name: "test",
        createRenderer: () => ({ render: () => "" }),
      };
      const config = {
        title: "Test",
        adapter: adapter as DocsConfig["adapter"],
        outDir: true,
      } as unknown as DocsConfig;

      const result = loader.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === "outDir")).toBe(true);
    });

    it("should fail when base is not a string", () => {
      const adapter = {
        name: "test",
        createRenderer: () => ({ render: () => "" }),
      };
      const config = {
        title: "Test",
        adapter: adapter as DocsConfig["adapter"],
        base: 123,
      } as unknown as DocsConfig;

      const result = loader.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === "base")).toBe(true);
    });

    it("should fail when adapter name is missing", () => {
      const adapter = {
        name: undefined,
        createRenderer: () => ({ render: () => "" }),
      };
      const config = {
        title: "Test",
        adapter: adapter as unknown as DocsConfig["adapter"],
      } as DocsConfig;

      const result = loader.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === "adapter.name")).toBe(true);
    });
  });

  describe("loadAndResolve()", () => {
    it("should throw when config not found", async () => {
      vi.spyOn(require("node:fs"), "existsSync").mockReturnValue(false);

      await expect(loader.loadAndResolve("/non-existent.ts")).rejects.toThrow(
        "Config file not found",
      );
    });

    it("should throw when adapter is missing", async () => {
      // Create a temporary invalid config
      const { join } = require("node:path");
      const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
      const testDir = join(__dirname, "test-config");
      const configPath = join(testDir, "docs.config.ts");

      try {
        mkdirSync(testDir, { recursive: true });
        // Config without required adapter
        writeFileSync(
          configPath,
          `export default { srcDir: "docs" };`,
        );

        await expect(loader.loadAndResolve(configPath, __dirname)).rejects.toThrow(
          "Adapter is required",
        );
      } finally {
        rmSync(testDir, { recursive: true, force: true });
      }
    });

    it("should throw validation errors for invalid adapter", async () => {
      const { join } = require("node:path");
      const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
      const testDir = join(__dirname, "test-invalid-config");
      const configPath = join(testDir, "docs.config.ts");

      try {
        mkdirSync(testDir, { recursive: true });
        // Config with missing adapter.name
        writeFileSync(
          configPath,
          `export default {
  title: "Test",
  adapter: {
    createRenderer: () => ({ render: () => "" })
  }
};`,
        );

        await expect(loader.loadAndResolve(configPath, __dirname)).rejects.toThrow(
          "Configuration validation failed",
        );
      } finally {
        rmSync(testDir, { recursive: true, force: true });
      }
    });
  });

  describe("getResolver()", () => {
    it("should return TypeScript resolver for .ts files", () => {
      const resolver = (loader as unknown as {
        getResolver: (path: string) => { extensions: string[] } | undefined;
      }).getResolver("/test.ts");

      expect(resolver).toBeDefined();
      expect(resolver?.extensions).toContain(".ts");
    });

    it("should return TypeScript resolver for .mts files", () => {
      const resolver = (loader as unknown as {
        getResolver: (path: string) => { extensions: string[] } | undefined;
      }).getResolver("/test.mts");

      expect(resolver).toBeDefined();
      expect(resolver?.extensions).toContain(".mts");
    });

    it("should return JavaScript resolver for .js files", () => {
      const resolver = (loader as unknown as {
        getResolver: (path: string) => { extensions: string[] } | undefined;
      }).getResolver("/test.js");

      expect(resolver).toBeDefined();
      expect(resolver?.extensions).toContain(".js");
    });

    it("should return JavaScript resolver for .mjs files", () => {
      const resolver = (loader as unknown as {
        getResolver: (path: string) => { extensions: string[] } | undefined;
      }).getResolver("/test.mjs");

      expect(resolver).toBeDefined();
      expect(resolver?.extensions).toContain(".mjs");
    });

    it("should return undefined for unsupported extensions", () => {
      const resolver = (loader as unknown as {
        getResolver: (path: string) => { extensions: string[] } | undefined;
      }).getResolver("/test.json");

      expect(resolver).toBeUndefined();
    });
  });
});

describe("createDefaultConfig", () => {
  it("should create config with adapter", async () => {
    const adapter = {
      name: "test",
      createRenderer: () => ({ render: () => "" }),
    };

    const { createDefaultConfig } = await import("../src/config.js");
    const config = createDefaultConfig(adapter);

    expect(config.title).toBe("Documentation");
    expect(config.description).toBe("");
    expect(config.base).toBe("/");
    expect(config.srcDir).toBe("docs");
    expect(config.outDir).toBe("dist");
    expect(config.adapter).toBe(adapter);
    expect(config.theme).toBeUndefined();
    expect(config.plugins).toEqual([]);
    expect(config.vite).toBeUndefined();
  });
});

describe("JavaScriptResolver", () => {
  it("should load .js config file", async () => {
    const { join } = require("node:path");
    const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
    const testDir = join(__dirname, "test-js-config");
    const configPath = join(testDir, "docs.config.js");

    try {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(
        configPath,
        `module.exports = {
  title: "JS Config Test",
  adapter: {
    name: "test",
    createRenderer: () => ({ render: () => "" })
  }
};`,
      );

      const { ConfigLoader } = await import("../src/config.js");
      const loader = new ConfigLoader();
      const rawConfig = await loader.load(configPath);

      expect(rawConfig.title).toBe("JS Config Test");
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });
});
