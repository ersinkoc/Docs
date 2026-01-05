/**
 * @oxog/docs-theme-default - Theme Tests
 */

import { describe, it, expect } from "vitest";
import { createDefaultTheme, DefaultLayout } from "../src/index.js";
import type { ThemeConfig, RenderContent } from "@oxog/docs-core";

describe("DefaultTheme", () => {
  describe("createDefaultTheme()", () => {
    it("should create theme with default config", () => {
      const theme = createDefaultTheme();

      expect(theme.name).toBe("default");
      expect(theme.styles).toBeDefined();
      expect(theme.components).toBeDefined();
    });

    it("should create theme with custom options", () => {
      const theme = createDefaultTheme({
        config: {
          logo: "/custom-logo.svg",
          primaryColor: "#ff6600",
        },
      });

      expect(theme.name).toBe("default");
    });

    it("should include all required components", () => {
      const theme = createDefaultTheme();

      expect(theme.components.Header).toBeDefined();
      expect(theme.components.Sidebar).toBeDefined();
      expect(theme.components.Footer).toBeDefined();
      expect(theme.components.TOC).toBeDefined();
      expect(theme.components.Search).toBeDefined();
      expect(theme.components.CodeBlock).toBeDefined();
    });
  });

  describe("DefaultLayout()", () => {
    it("should render layout with content", () => {
      const content: RenderContent = {
        frontmatter: { title: "Test Page", description: "A test page" },
        html: "<p>Hello World</p>",
        toc: [
          { text: "Introduction", slug: "introduction", level: 2 },
          { text: "Usage", slug: "usage", level: 2 },
        ],
      };

      const config: ThemeConfig = {
        nav: [{ text: "Guide", link: "/guide/" }],
        sidebar: {
          "/guide/": [
            {
              text: "Getting Started",
              items: [
                { text: "Introduction", link: "/guide/introduction" },
                { text: "Installation", link: "/guide/installation" },
              ],
            },
          ],
        },
        footer: { message: "MIT License" },
      };

      const html = DefaultLayout({
        frontmatter: content.frontmatter,
        content: content.html,
        toc: content.toc,
        config,
        pathname: "/guide/",
      });

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<title>Test Page</title>");
      expect(html).toContain("Hello World");
      expect(html).toContain("MIT License");
      expect(html).toContain("Guide");
      expect(html).toContain("On this page");
    });

    it("should handle minimal config", () => {
      const content: RenderContent = {
        frontmatter: { title: "Minimal Page" },
        html: "<p>Content</p>",
        toc: [],
      };

      const html = DefaultLayout({
        frontmatter: content.frontmatter,
        content: content.html,
        toc: undefined,
        config: {},
        pathname: "/",
      });

      expect(html).toContain("<title>Minimal Page</title>");
      expect(html).toContain("Content");
    });

    it("should escape HTML in titles", () => {
      const content: RenderContent = {
        frontmatter: { title: '<script>alert("xss")</script>' },
        html: "<p>Test</p>",
        toc: [],
      };

      const html = DefaultLayout({
        frontmatter: content.frontmatter,
        content: content.html,
        toc: undefined,
        config: {},
        pathname: "/",
      });

      // Title should be escaped (XSS protection)
      expect(html).toContain("&lt;script&gt;");
      // The unescaped script should NOT appear in the title tag
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      expect(titleMatch?.[1]).not.toContain("<script>");
    });
  });
});
