/**
 * @oxog/docs-core - Kernel Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Kernel, PluginAPI } from "../src/kernel.js";
import type { DocsPlugin, DocsConfig } from "../src/types.js";

describe("Kernel", () => {
  let kernel: Kernel;

  beforeEach(() => {
    kernel = new Kernel();
  });

  afterEach(async () => {
    await kernel.destroy();
  });

  describe("use()", () => {
    it("should register a plugin", () => {
      const plugin: DocsPlugin = {
        name: "test-plugin",
        version: "1.0.0",
      };

      kernel.use(plugin);

      expect(kernel.getPlugin("test-plugin")).toBe(plugin);
    });

    it("should throw when registering duplicate plugin", () => {
      const plugin: DocsPlugin = {
        name: "test-plugin",
        version: "1.0.0",
      };

      kernel.use(plugin);

      expect(() => kernel.use(plugin)).toThrow(
        "Plugin 'test-plugin' is already registered",
      );
    });

    it("should throw when using plugin on destroyed kernel", async () => {
      await kernel.destroy();

      const plugin: DocsPlugin = {
        name: "test-plugin",
        version: "1.0.0",
      };

      expect(() => kernel.use(plugin)).toThrow(
        "Cannot use plugin on destroyed kernel",
      );
    });

    it("should return kernel for chaining", () => {
      const plugin: DocsPlugin = {
        name: "test",
        version: "1.0.0",
      };

      const result = kernel.use(plugin);

      expect(result).toBe(kernel);
    });
  });

  describe("getPlugin()", () => {
    it("should return undefined for non-existent plugin", () => {
      expect(kernel.getPlugin("non-existent")).toBeUndefined();
    });

    it("should return registered plugin", () => {
      const plugin: DocsPlugin = {
        name: "test",
        version: "1.0.0",
      };

      kernel.use(plugin);

      expect(kernel.getPlugin("test")).toBe(plugin);
    });
  });

  describe("listPlugins()", () => {
    it("should return empty array when no plugins", () => {
      expect(kernel.listPlugins()).toEqual([]);
    });

    it("should return all registered plugins", () => {
      const plugin1: DocsPlugin = { name: "plugin-1", version: "1.0.0" };
      const plugin2: DocsPlugin = { name: "plugin-2", version: "1.0.0" };

      kernel.use(plugin1);
      kernel.use(plugin2);

      expect(kernel.listPlugins()).toHaveLength(2);
    });

    it("should maintain registration order", () => {
      const plugin1: DocsPlugin = { name: "plugin-1", version: "1.0.0" };
      const plugin2: DocsPlugin = { name: "plugin-2", version: "1.0.0" };
      const plugin3: DocsPlugin = { name: "plugin-3", version: "1.0.0" };

      kernel.use(plugin1);
      kernel.use(plugin2);
      kernel.use(plugin3);

      const plugins = kernel.listPlugins();
      expect(plugins[0]?.name).toBe("plugin-1");
      expect(plugins[1]?.name).toBe("plugin-2");
      expect(plugins[2]?.name).toBe("plugin-3");
    });
  });

  describe("on() / off()", () => {
    it("should register event listener", () => {
      const callback = vi.fn();

      kernel.on("onBuildStart", callback);
      kernel.emit("onBuildStart");

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should remove event listener", () => {
      const callback = vi.fn();

      kernel.on("onBuildStart", callback);
      kernel.off("onBuildStart", callback);
      kernel.emit("onBuildStart");

      expect(callback).not.toHaveBeenCalled();
    });

    it("should support multiple listeners", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      kernel.on("onBuildStart", callback1);
      kernel.on("onBuildStart", callback2);
      kernel.emit("onBuildStart");

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should pass arguments to listeners", async () => {
      const config: DocsConfig = { title: "Test" };
      const callback = vi.fn();

      kernel.on("onConfig", (cfg) => {
        callback(cfg);
      });

      await kernel.emit("onConfig", config, new AbortController().signal);

      expect(callback).toHaveBeenCalledWith(config);
    });

    it("should not register listener when destroyed", async () => {
      await kernel.destroy();

      const callback = vi.fn();
      kernel.on("onBuildStart", callback);
      kernel.emit("onBuildStart");

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("emit()", () => {
    it("should call all listeners", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      kernel.on("onBuildStart", callback1);
      kernel.on("onBuildStart", callback2);
      kernel.emit("onBuildStart");

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should handle async listeners", async () => {
      const callback = vi.fn().mockResolvedValue(undefined);

      kernel.on("onBuildStart", callback);
      await kernel.emit("onBuildStart");

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should collect errors and emit onError", async () => {
      const error = new Error("Test error");
      const errorHandler = vi.fn();

      kernel.on("onBuildStart", () => {
        throw error;
      });
      kernel.on("onError", (err) => errorHandler(err));

      await kernel.emit("onBuildStart");

      expect(errorHandler).toHaveBeenCalledWith(error);
    });
  });

  describe("runWithErrorBoundary()", () => {
    it("should return result of function", () => {
      const result = kernel.runWithErrorBoundary(() => "test");

      expect(result).toBe("test");
    });

    it("should catch errors and emit onError", () => {
      const error = new Error("Test error");
      const errorHandler = vi.fn();

      kernel.on("onError", (err) => errorHandler(err));

      expect(() =>
        kernel.runWithErrorBoundary(() => {
          throw error;
        }),
      ).toThrow(error);

      expect(errorHandler).toHaveBeenCalledWith(error);
    });
  });

  describe("runWithErrorBoundaryAsync()", () => {
    it("should return result of async function", async () => {
      const result = await kernel.runWithErrorBoundaryAsync(async () => "test");

      expect(result).toBe("test");
    });

    it("should catch async errors", async () => {
      const error = new Error("Test error");

      await expect(
        kernel.runWithErrorBoundaryAsync(async () => {
          throw error;
        }),
      ).rejects.toThrow(error);
    });
  });

  describe("getPluginOrder()", () => {
    it("should return plugin registration order", () => {
      kernel.use({ name: "a", version: "1.0.0" });
      kernel.use({ name: "b", version: "1.0.0" });
      kernel.use({ name: "c", version: "1.0.0" });

      expect(kernel.getPluginOrder()).toEqual(["a", "b", "c"]);
    });
  });

  describe("isDestroyed()", () => {
    it("should return false initially", () => {
      expect(kernel.isDestroyed()).toBe(false);
    });

    it("should return true after destroy", async () => {
      await kernel.destroy();

      expect(kernel.isDestroyed()).toBe(true);
    });
  });

  describe("destroy()", () => {
    it("should call onDestroy on all plugins", async () => {
      const onDestroy1 = vi.fn();
      const onDestroy2 = vi.fn();

      kernel.use({
        name: "plugin-1",
        version: "1.0.0",
        onDestroy: onDestroy1,
      });
      kernel.use({
        name: "plugin-2",
        version: "1.0.0",
        onDestroy: onDestroy2,
      });

      await kernel.destroy();

      expect(onDestroy1).toHaveBeenCalledTimes(1);
      expect(onDestroy2).toHaveBeenCalledTimes(1);
    });

    it("should clear plugins", async () => {
      kernel.use({ name: "test", version: "1.0.0" });
      await kernel.destroy();

      expect(kernel.listPlugins()).toEqual([]);
    });

    it("should be idempotent", async () => {
      kernel.use({ name: "test", version: "1.0.0" });

      await kernel.destroy();
      await kernel.destroy();

      expect(kernel.listPlugins()).toEqual([]);
    });

    it("should handle onDestroy error", async () => {
      kernel.use({
        name: "error-plugin",
        version: "1.0.0",
        onDestroy: async () => {
          throw new Error("Destroy error");
        },
      });

      // Should not throw
      await kernel.destroy();
      expect(kernel.listPlugins()).toEqual([]);
    });

    it("should skip undefined plugin names", async () => {
      kernel.use({ name: "valid-plugin", version: "1.0.0" });
      // Add undefined to pluginOrder to test the skip
      kernel["pluginOrder"].push(undefined as unknown as string);

      // Should not throw
      await kernel.destroy();
      expect(kernel.listPlugins()).toEqual([]);
    });

    it("should skip null plugin names", async () => {
      kernel.use({ name: "valid-plugin", version: "1.0.0" });
      // Add null to pluginOrder to test the skip
      kernel["pluginOrder"].push(null as unknown as string);

      // Should not throw
      await kernel.destroy();
      expect(kernel.listPlugins()).toEqual([]);
    });
  });

  describe("runWithErrorBoundaryAsync", () => {
    it("should return non-Promise result directly", async () => {
      const result = kernel.runWithErrorBoundaryAsync(() => "sync-result");
      expect(await result).toBe("sync-result");
    });

    it("should await Promise result", async () => {
      const result = kernel.runWithErrorBoundaryAsync(async () => "async-result");
      expect(await result).toBe("async-result");
    });
  });

  describe("Kernel.plugins", () => {
    describe("markdown()", () => {
      it("should create markdown transformer plugin", () => {
        const transformer = async (ast: MarkdownAST) => ast;
        const plugin = PluginAPI.markdown(transformer);

        expect(plugin.name).toBe("markdown-transformer");
        expect(plugin.version).toBe("1.0.0");
        expect(typeof plugin.onMarkdownParse).toBe("function");
      });
    });

    describe("html()", () => {
      it("should create HTML transformer plugin", () => {
        const transformer = async (html: string) => html;
        const plugin = PluginAPI.html(transformer);

        expect(plugin.name).toBe("html-transformer");
        expect(plugin.version).toBe("1.0.0");
        expect(typeof plugin.onHtmlRender).toBe("function");
      });
    });

    describe("content()", () => {
      it("should create content processor plugin", () => {
        const processor = async (files: ContentFile[]) => files;
        const plugin = PluginAPI.content(processor);

        expect(plugin.name).toBe("content-processor");
        expect(plugin.version).toBe("1.0.0");
        expect(typeof plugin.onContentLoad).toBe("function");
      });
    });

    describe("config()", () => {
      it("should create config modifier plugin", () => {
        const modifier = (config: DocsConfig) => config;
        const plugin = PluginAPI.config(modifier);

        expect(plugin.name).toBe("config-modifier");
        expect(plugin.version).toBe("1.0.0");
        expect(typeof plugin.onConfig).toBe("function");
      });
    });
  });
});
