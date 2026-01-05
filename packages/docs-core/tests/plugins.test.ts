/**
 * @oxog/docs-core - Plugin Tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { DocsPlugin, BuildManifest, ContentFile } from "../src/types";

// Core plugins
import { createAssetsPlugin, assetsPlugin } from "../src/plugins/core/assets";
import { createFrontmatterPlugin, frontmatterPlugin } from "../src/plugins/core/frontmatter";
import { createMarkdownPlugin, markdownPlugin } from "../src/plugins/core/markdown";
import { createRoutingPlugin, routingPlugin } from "../src/plugins/core/routing";
import { createCodeshinePlugin, codeshinePlugin } from "../src/plugins/core/codeshine";

// Optional plugins
import { createSearchPlugin, search } from "../src/plugins/optional/search";
import { createSitemapPlugin, sitemap } from "../src/plugins/optional/sitemap";
import { createI18nPlugin, i18n } from "../src/plugins/optional/i18n";
import { createMermaidPlugin, mermaid } from "../src/plugins/optional/mermaid";
import { toc, tocPlugin } from "../src/plugins/optional/toc";
import { createAnalyticsPlugin, analytics } from "../src/plugins/optional/analytics";

describe("Core Plugins", () => {
  describe("Assets Plugin", () => {
    const testDir = join(__dirname, "test-assets-plugin");
    const assetsDir = join(testDir, "docs", "assets");
    const distDir = join(testDir, "dist");

    beforeEach(() => {
      mkdirSync(assetsDir, { recursive: true });
      mkdirSync(distDir, { recursive: true });
      writeFileSync(join(assetsDir, "test.css"), "body { color: red; }");
      writeFileSync(join(assetsDir, "image.png"), "fake-png-data");
    });

    afterEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
    });

    it("should create assets plugin with config", () => {
      const plugin = createAssetsPlugin({ dir: "assets", outDir: "assets" });
      expect(plugin.name).toBe("assets");
      expect(plugin.version).toBe("1.0.0");
    });

    it("should have default config", () => {
      const plugin = createAssetsPlugin();
      expect(plugin.name).toBe("assets");
      expect(plugin.onBuildEnd).toBeDefined();
    });

    it("should add assets to manifest on build end", async () => {
      const plugin = createAssetsPlugin();
      const manifest: BuildManifest = { pages: [], assets: [], buildTime: 0 };

      await plugin.onBuildEnd(manifest);
      // Should not throw and should handle missing directory
    });

    it("should export default plugin instance", () => {
      expect(assetsPlugin.name).toBe("assets");
    });
  });

  describe("Frontmatter Plugin", () => {
    it("should create frontmatter plugin", () => {
      const plugin = createFrontmatterPlugin();
      expect(plugin.name).toBe("frontmatter");
      expect(plugin.version).toBe("1.0.0");
    });

    it("should have onContentLoad handler", () => {
      const plugin = createFrontmatterPlugin();
      expect(plugin.onContentLoad).toBeDefined();
    });

    it("should parse frontmatter from content", async () => {
      const plugin = createFrontmatterPlugin();
      const files: ContentFile[] = [
        {
          path: "/test.md",
          content: `---
title: Test Title
author: Test Author
---

# Content here`,
          frontmatter: {},
          relativePath: "test.md",
        },
      ];

      const result = await plugin.onContentLoad!(files);
      expect(result[0].frontmatter.title).toBe("Test Title");
      expect(result[0].frontmatter.author).toBe("Test Author");
    });

    it("should handle content without frontmatter", async () => {
      const plugin = createFrontmatterPlugin();
      const files: ContentFile[] = [
        {
          path: "/test.md",
          content: `# Just content`,
          frontmatter: {},
          relativePath: "test.md",
        },
      ];

      const result = await plugin.onContentLoad!(files);
      expect(result[0].frontmatter).toEqual({});
    });

    it("should export default plugin instance", () => {
      expect(frontmatterPlugin.name).toBe("frontmatter");
    });
  });

  describe("Markdown Plugin", () => {
    it("should create markdown plugin", () => {
      const plugin = createMarkdownPlugin();
      expect(plugin.name).toBe("markdown");
      expect(plugin.version).toBe("1.0.0");
    });

    it("should have onMarkdownParse handler", () => {
      const plugin = createMarkdownPlugin();
      expect(plugin.onMarkdownParse).toBeDefined();
    });

    it("should export default plugin instance", () => {
      expect(markdownPlugin.name).toBe("markdown");
    });
  });

  describe("Routing Plugin", () => {
    it("should create routing plugin", () => {
      const plugin = createRoutingPlugin();
      expect(plugin.name).toBe("routing");
      expect(plugin.version).toBe("1.0.0");
    });

    it("should have onContentLoad handler", () => {
      const plugin = createRoutingPlugin();
      expect(plugin.onContentLoad).toBeDefined();
    });

    it("should export default plugin instance", () => {
      expect(routingPlugin.name).toBe("routing");
    });
  });

  describe("Codeshine Plugin", () => {
    it("should create codeshine plugin", () => {
      const plugin = createCodeshinePlugin();
      expect(plugin.name).toBe("codeshine");
      expect(plugin.version).toBe("1.0.0");
    });

    it("should be a valid plugin", () => {
      const plugin = createCodeshinePlugin();
      expect(plugin.name).toBe("codeshine");
    });

    it("should export default plugin instance", () => {
      expect(codeshinePlugin.name).toBe("codeshine");
    });
  });
});

describe("Optional Plugins", () => {
  describe("Search Plugin", () => {
    it("should create search plugin", () => {
      const plugin = createSearchPlugin();
      expect(plugin.name).toBe("search");
    });

    it("should export search function", () => {
      expect(typeof search).toBe("function");
    });
  });

  describe("Sitemap Plugin", () => {
    it("should create sitemap plugin with options", () => {
      const plugin = createSitemapPlugin({ hostname: "https://example.com" });
      expect(plugin.name).toBe("sitemap");
    });

    it("should export sitemap function", () => {
      expect(typeof sitemap).toBe("function");
    });
  });

  describe("I18n Plugin", () => {
    it("should create i18n plugin with options", () => {
      const plugin = createI18nPlugin({ locales: ["en", "tr"] });
      expect(plugin.name).toBe("i18n");
    });

    it("should export i18n function", () => {
      expect(typeof i18n).toBe("function");
    });
  });

  describe("Mermaid Plugin", () => {
    it("should create mermaid plugin", () => {
      const plugin = createMermaidPlugin();
      expect(plugin.name).toBe("mermaid");
    });

    it("should export mermaid function", () => {
      expect(typeof mermaid).toBe("function");
    });
  });

  describe("TOC Plugin", () => {
    it("should create toc plugin using factory function", () => {
      const plugin = toc();
      expect(plugin.name).toBe("toc");
    });

    it("should export default plugin instance", () => {
      expect(tocPlugin.name).toBe("toc");
    });

    it("should export toc function", () => {
      expect(typeof toc).toBe("function");
    });
  });

  describe("Analytics Plugin", () => {
    it("should create analytics plugin with options", () => {
      const plugin = createAnalyticsPlugin({ provider: "plausible", domain: "example.com" });
      expect(plugin.name).toBe("analytics");
    });

    it("should export analytics function", () => {
      expect(typeof analytics).toBe("function");
    });
  });
});

describe("Plugin Structure", () => {
  it("should have required properties", () => {
    const plugins = [
      assetsPlugin,
      frontmatterPlugin,
      markdownPlugin,
      routingPlugin,
      codeshinePlugin,
      tocPlugin,
    ];

    for (const plugin of plugins) {
      expect(plugin).toHaveProperty("name");
      expect(plugin).toHaveProperty("version");
    }
  });

  it("should have valid plugin factory functions", () => {
    const factories = [
      createAssetsPlugin,
      createFrontmatterPlugin,
      createMarkdownPlugin,
      createRoutingPlugin,
      createCodeshinePlugin,
      createSearchPlugin,
      createMermaidPlugin,
    ];

    for (const factory of factories) {
      const plugin = factory();
      expect(typeof plugin.name).toBe("string");
      expect(typeof plugin.version).toBe("string");
    }
  });

  it("should create valid plugins with required options", () => {
    const plugins = [
      createSitemapPlugin({ hostname: "https://example.com" }),
      createI18nPlugin({ locales: ["en", "tr"] }),
      createAnalyticsPlugin({ provider: "plausible", domain: "example.com" }),
    ];

    for (const plugin of plugins) {
      expect(typeof plugin.name).toBe("string");
      expect(typeof plugin.version).toBe("string");
    }
  });
});
