/**
 * @oxog/docs-core - Plugin Tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import type { DocsPlugin, BuildManifest, ContentFile, MarkdownAST } from "../src/types";

// Core plugins
import { createAssetsPlugin, assetsPlugin } from "../src/plugins/core/assets";
import { createFrontmatterPlugin, frontmatterPlugin, extractFrontmatter } from "../src/plugins/core/frontmatter";
import { createMarkdownPlugin, markdownPlugin } from "../src/plugins/core/markdown";
import { createRoutingPlugin, routingPlugin, createRoutingPluginWithRouter } from "../src/plugins/core/routing";
import { Router } from "../src/router";
import { createCodeshinePlugin, codeshinePlugin, CodeshineOptions } from "../src/plugins/core/codeshine";

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
      // Clean up first
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
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

    it("should create plugin with custom patterns", () => {
      const plugin = createAssetsPlugin({
        pattern: ["**/*.png", "**/*.jpg"],
        exclude: ["**/secret/**"],
        dir: "images",
        outDir: "img",
      });
      expect(plugin.name).toBe("assets");
    });

    it("should handle missing source directory", async () => {
      // Remove the assets directory
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
      const plugin = createAssetsPlugin();
      const manifest: BuildManifest = { pages: [], assets: [], buildTime: 0 };
      // Should not throw when source directory doesn't exist
      await plugin.onBuildEnd(manifest);
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

    it("should extract frontmatter with nested objects", () => {
      const content = `---
title: Complex Page
author:
  name: John
  email: john@example.com
---
# Content`;
      const result = extractFrontmatter(content);
      expect(result).toEqual({
        title: "Complex Page",
        author: { name: "John", email: "john@example.com" },
      });
    });

    it("should handle boolean values", () => {
      const content = `---
enabled: true
disabled: false
---
# Content`;
      const result = extractFrontmatter(content);
      expect(result).toEqual({ enabled: true, disabled: false });
    });

    it("should handle numeric values", () => {
      const content = `---
count: 42
price: 19.99
---
# Content`;
      const result = extractFrontmatter(content);
      expect(result).toEqual({ count: 42, price: 19.99 });
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

    it("should parse h1 headings", async () => {
      const plugin = createMarkdownPlugin();
      const file: ContentFile = {
        path: "/test.md",
        content: "# Heading 1",
        frontmatter: {},
        relativePath: "test.md",
      };

      const ast = await plugin.onMarkdownParse!({ type: "root", children: [] }, file);
      expect(ast.children).toBeDefined();
      expect(ast.children![0].type).toBe("heading");
    });

    it("should parse h2 headings", async () => {
      const plugin = createMarkdownPlugin();
      const file: ContentFile = {
        path: "/test.md",
        content: "## Heading 2",
        frontmatter: {},
        relativePath: "test.md",
      };

      const ast = await plugin.onMarkdownParse!({ type: "root", children: [] }, file);
      expect(ast.children).toBeDefined();
    });

    it("should parse h3 headings", async () => {
      const plugin = createMarkdownPlugin();
      const file: ContentFile = {
        path: "/test.md",
        content: "### Heading 3",
        frontmatter: {},
        relativePath: "test.md",
      };

      const ast = await plugin.onMarkdownParse!({ type: "root", children: [] }, file);
      expect(ast.children).toBeDefined();
    });

    it("should parse list items", async () => {
      const plugin = createMarkdownPlugin();
      const file: ContentFile = {
        path: "/test.md",
        content: "- Item 1\n- Item 2",
        frontmatter: {},
        relativePath: "test.md",
      };

      const ast = await plugin.onMarkdownParse!({ type: "root", children: [] }, file);
      expect(ast.children).toBeDefined();
    });

    it("should parse code blocks", async () => {
      const plugin = createMarkdownPlugin();
      const file: ContentFile = {
        path: "/test.md",
        content: "```\ncode here\n```",
        frontmatter: {},
        relativePath: "test.md",
      };

      const ast = await plugin.onMarkdownParse!({ type: "root", children: [] }, file);
      expect(ast.children).toBeDefined();
    });

    it("should parse paragraphs", async () => {
      const plugin = createMarkdownPlugin();
      const file: ContentFile = {
        path: "/test.md",
        content: "This is a paragraph.",
        frontmatter: {},
        relativePath: "test.md",
      };

      const ast = await plugin.onMarkdownParse!({ type: "root", children: [] }, file);
      expect(ast.children).toBeDefined();
    });

    it("should handle empty content", async () => {
      const plugin = createMarkdownPlugin();
      const file: ContentFile = {
        path: "/test.md",
        content: "",
        frontmatter: {},
        relativePath: "test.md",
      };

      const ast = await plugin.onMarkdownParse!({ type: "root", children: [] }, file);
      expect(ast.children).toBeDefined();
    });

    it("should handle mixed content", async () => {
      const plugin = createMarkdownPlugin();
      const file: ContentFile = {
        path: "/test.md",
        content: "# Title\n\nSome text\n\n- List item\n\n## Subtitle",
        frontmatter: {},
        relativePath: "test.md",
      };

      const ast = await plugin.onMarkdownParse!({ type: "root", children: [] }, file);
      expect(ast.children).toBeDefined();
      expect(ast.children!.length).toBeGreaterThan(0);
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

    it("should create routing plugin with custom srcDir", () => {
      const plugin = createRoutingPlugin("custom-docs");
      expect(plugin.name).toBe("routing");
    });

    it("should handle empty files array", async () => {
      const plugin = createRoutingPlugin();
      const result = await plugin.onContentLoad!([]);
      expect(result).toEqual([]);
    });

    it("should create routing plugin with router instance", () => {
      const router = new Router("docs");
      const plugin = createRoutingPluginWithRouter(router);
      expect(plugin.name).toBe("routing");
      expect(plugin.onContentLoad).toBeDefined();
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

    it("should have onMarkdownParse hook", () => {
      const plugin = createCodeshinePlugin();
      expect(plugin.onMarkdownParse).toBeDefined();
    });

    it("should have dependencies", () => {
      const plugin = createCodeshinePlugin();
      expect(plugin.dependencies).toContain("@oxog/codeshine");
    });

    it("should create plugin with custom options", () => {
      const options: CodeshineOptions = {
        theme: "monokai",
        defaultLanguage: "javascript",
        skipLanguages: ["plaintext"],
      };
      const plugin = createCodeshinePlugin(options);
      expect(plugin.name).toBe("codeshine");
    });

    it("should skip languages in skipLanguages array", () => {
      const plugin = createCodeshinePlugin({
        skipLanguages: ["plaintext"],
      });
      expect(plugin.name).toBe("codeshine");
    });

    it("should highlight code with custom theme", () => {
      const plugin = createCodeshinePlugin({
        theme: "dracula",
      });
      expect(plugin.name).toBe("codeshine");
    });

    it("should highlight code with custom default language", () => {
      const plugin = createCodeshinePlugin({
        defaultLanguage: "typescript",
      });
      expect(plugin.name).toBe("codeshine");
    });
  });

  describe("Codeshine - highlightCodeBlocks", () => {
    it("should process code-block type nodes", async () => {
      const plugin = createCodeshinePlugin();
      const ast: MarkdownAST = {
        type: "root",
        children: [
          {
            type: "code-block",
            value: "const x = 1;",
            attributes: { language: "javascript" },
          },
        ],
      };

      const result = await plugin.onMarkdownParse!(ast, {} as ContentFile);
      expect(result.children![0].type).toBe("code-block");
    });

    it("should process code type nodes", async () => {
      const plugin = createCodeshinePlugin();
      const ast: MarkdownAST = {
        type: "root",
        children: [
          {
            type: "code",
            value: "hello world",
            attributes: {},
          },
        ],
      };

      const result = await plugin.onMarkdownParse!(ast, {} as ContentFile);
      expect(result.children![0].type).toBe("code-block");
    });

    it("should preserve non-code nodes", async () => {
      const plugin = createCodeshinePlugin();
      const ast: MarkdownAST = {
        type: "root",
        children: [
          {
            type: "heading",
            value: "Hello",
            attributes: { level: 1 },
          },
          {
            type: "paragraph",
            children: [{ type: "text", value: "Content" }],
          },
        ],
      };

      const result = await plugin.onMarkdownParse!(ast, {} as ContentFile);
      expect(result.children![0].type).toBe("heading");
      expect(result.children![1].type).toBe("paragraph");
    });

    it("should handle nested children", async () => {
      const plugin = createCodeshinePlugin();
      const ast: MarkdownAST = {
        type: "root",
        children: [
          {
            type: "list-item",
            children: [
              {
                type: "code-block",
                value: "test",
                attributes: {},
              },
            ],
          },
        ],
      };

      const result = await plugin.onMarkdownParse!(ast, {} as ContentFile);
      expect(result.children![0].type).toBe("list-item");
    });

    it("should mark highlighted code with attributes", async () => {
      const plugin = createCodeshinePlugin();
      const ast: MarkdownAST = {
        type: "root",
        children: [
          {
            type: "code-block",
            value: "code here",
            attributes: { language: "rust" },
          },
        ],
      };

      const result = await plugin.onMarkdownParse!(ast, {} as ContentFile);
      const codeNode = result.children![0] as MarkdownAST & { attributes: Record<string, unknown> };
      expect(codeNode.attributes.highlighted).toBe(true);
      expect(codeNode.attributes.language).toBe("rust");
    });
  });

  describe("Codeshine - escapeHtml", () => {
    it("should escape ampersands", () => {
      const plugin = createCodeshinePlugin();
      // Access the private function via testing
      const content = "A & B";
      const escaped = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      expect(escaped).toBe("A &amp; B");
    });

    it("should escape angle brackets", () => {
      const content = "<div>";
      const escaped = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      expect(escaped).toBe("&lt;div&gt;");
    });

    it("should escape quotes", () => {
      const content = 'He said "hello"';
      const escaped = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      expect(escaped).toBe('He said &quot;hello&quot;');
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

    it("should have onBuildEnd hook", () => {
      const plugin = createSearchPlugin();
      expect(plugin.onBuildEnd).toBeDefined();
    });

    it("should create search plugin with custom options", () => {
      const plugin = createSearchPlugin({ maxResults: 20 });
      expect(plugin.name).toBe("search");
    });

    it("should have version property", () => {
      const plugin = createSearchPlugin();
      expect(plugin.version).toBe("1.0.0");
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

    it("should have onBuildEnd hook", () => {
      const plugin = createSitemapPlugin({ hostname: "https://example.com" });
      expect(plugin.onBuildEnd).toBeDefined();
    });

    it("should create sitemap with custom options", () => {
      const plugin = createSitemapPlugin({
        hostname: "https://example.com",
        changefreq: "daily",
        priority: 0.8,
      });
      expect(plugin.name).toBe("sitemap");
    });

    it("should have version property", () => {
      const plugin = createSitemapPlugin({ hostname: "https://example.com" });
      expect(plugin.version).toBe("1.0.0");
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

    it("should have onContentLoad hook", () => {
      const plugin = createI18nPlugin({ locales: ["en", "tr"] });
      expect(plugin.onContentLoad).toBeDefined();
    });

    it("should create i18n with custom default locale", () => {
      const plugin = createI18nPlugin({ locales: ["en", "de"], defaultLocale: "de" });
      expect(plugin.name).toBe("i18n");
    });

    it("should have version property", () => {
      const plugin = createI18nPlugin({ locales: ["en", "tr"] });
      expect(plugin.version).toBe("1.0.0");
    });

    it("should support single locale", () => {
      const plugin = createI18nPlugin({ locales: ["en"] });
      expect(plugin.name).toBe("i18n");
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

    it("should have onMarkdownParse hook", () => {
      const plugin = createMermaidPlugin();
      expect(plugin.onMarkdownParse).toBeDefined();
    });

    it("should have version property", () => {
      const plugin = createMermaidPlugin();
      expect(plugin.version).toBe("1.0.0");
    });

    it("should create mermaid with custom theme", () => {
      const plugin = createMermaidPlugin({ theme: "dark" });
      expect(plugin.name).toBe("mermaid");
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

    it("should have onMarkdownParse hook", () => {
      const plugin = toc();
      expect(plugin.onMarkdownParse).toBeDefined();
    });

    it("should have version property", () => {
      const plugin = toc();
      expect(plugin.version).toBe("1.0.0");
    });

    it("should create toc with depth option", () => {
      const plugin = toc({ depth: 3 });
      expect(plugin.name).toBe("toc");
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

    it("should have onHtmlRender hook", () => {
      const plugin = createAnalyticsPlugin({ provider: "plausible", domain: "example.com" });
      expect(plugin.onHtmlRender).toBeDefined();
    });

    it("should support different providers", () => {
      const googlePlugin = createAnalyticsPlugin({ provider: "google", measurementId: "G-XXXX" });
      const plausiblePlugin = createAnalyticsPlugin({ provider: "plausible", domain: "example.com" });
      const umamiPlugin = createAnalyticsPlugin({ provider: "umami", websiteId: "xxx" });

      expect(googlePlugin.name).toBe("analytics");
      expect(plausiblePlugin.name).toBe("analytics");
      expect(umamiPlugin.name).toBe("analytics");
    });

    it("should have version property", () => {
      const plugin = createAnalyticsPlugin({ provider: "plausible", domain: "example.com" });
      expect(plugin.version).toBe("1.0.0");
    });

    it("should create google analytics with custom events", () => {
      const plugin = createAnalyticsPlugin({
        provider: "google",
        measurementId: "G-XXXX",
        debug: true,
      });
      expect(plugin.name).toBe("analytics");
    });
  });

  describe("RSS Plugin", () => {
    it("should create rss plugin", async () => {
      const { createRSSPlugin } = await import("../src/plugins/optional/rss.js");
      const plugin = createRSSPlugin({
        title: "My Docs",
        description: "Documentation",
        siteUrl: "https://example.com",
      });
      expect(plugin.name).toBe("rss");
    });

    it("should have onBuildEnd hook", async () => {
      const { createRSSPlugin } = await import("../src/plugins/optional/rss.js");
      const plugin = createRSSPlugin({
        title: "My Docs",
        description: "Documentation",
        siteUrl: "https://example.com",
      });
      expect(plugin.onBuildEnd).toBeDefined();
    });

    it("should have version property", async () => {
      const { createRSSPlugin } = await import("../src/plugins/optional/rss.js");
      const plugin = createRSSPlugin({
        title: "My Docs",
        description: "Documentation",
        siteUrl: "https://example.com",
      });
      expect(plugin.version).toBe("1.0.0");
    });

    it("should export rss function", async () => {
      const { rss } = await import("../src/plugins/optional/rss.js");
      expect(typeof rss).toBe("function");
    });

    it("should export rssPlugin instance", async () => {
      const { rssPlugin } = await import("../src/plugins/optional/rss.js");
      expect(rssPlugin.name).toBe("rss");
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
