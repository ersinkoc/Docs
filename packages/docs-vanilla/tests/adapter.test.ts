/**
 * @oxog/docs-vanilla - Adapter Tests
 */

import { describe, it, expect } from "vitest";
import { createVanillaAdapter } from "../src/adapter.js";
import type {
  AdapterConfig,
  RenderContent,
  ThemeConfig,
} from "@oxog/docs-core";

describe("VanillaAdapter", () => {
  describe("createVanillaAdapter()", () => {
    it("should create adapter with default options", () => {
      const adapter = createVanillaAdapter();

      expect(adapter.name).toBe("vanilla");
      expect(typeof adapter.createRenderer).toBe("function");
      expect(typeof adapter.transformHtml).toBe("function");
      expect(typeof adapter.hydrate).toBe("function");
    });

    it("should create adapter with custom options", () => {
      const adapter = createVanillaAdapter({
        useWebComponents: false,
        customCss: ".test { color: red; }",
      });

      expect(adapter.name).toBe("vanilla");
    });

    it("should create renderer", () => {
      const adapter = createVanillaAdapter();
      const config: AdapterConfig = {
        config: { title: "Test", adapter: adapter },
        theme: undefined,
      };

      const renderer = adapter.createRenderer(config);

      expect(renderer).toBeDefined();
    });

    it("should render content", () => {
      const adapter = createVanillaAdapter({ useWebComponents: false });
      const config: AdapterConfig = {
        config: { title: "Test", adapter: adapter },
        theme: undefined,
      };

      const renderer = adapter.createRenderer(config);
      const content: RenderContent = {
        frontmatter: { title: "Test Page", description: "A test page" },
        html: "<p>Hello World</p>",
        toc: [],
      };

      const result = renderer.render(content);

      expect(result).toContain("<!DOCTYPE html>");
      expect(result).toContain("<title>Test Page</title>");
      expect(result).toContain("<p>Hello World</p>");
    });

    it("should include TOC in rendered content", () => {
      const adapter = createVanillaAdapter({ useWebComponents: false });
      const config: AdapterConfig = {
        config: { title: "Test", adapter: adapter },
        theme: undefined,
      };

      const renderer = adapter.createRenderer(config);
      const content: RenderContent = {
        frontmatter: { title: "Test Page" },
        html: "<p>Content</p>",
        toc: [
          { text: "Introduction", slug: "introduction", level: 2 },
          { text: "Usage", slug: "usage", level: 2 },
        ],
      };

      const result = renderer.render(content);

      expect(result).toContain("On this page");
      expect(result).toContain("Introduction");
      expect(result).toContain("Usage");
    });

    it("should transform HTML with web components", () => {
      const adapter = createVanillaAdapter({ useWebComponents: true });
      const html = "<p>Content</p>";

      const result = adapter.transformHtml(html);

      expect(result).toContain("<docs-layout>");
      expect(result).toContain("</docs-layout>");
    });

    it("should render with theme config", () => {
      const adapter = createVanillaAdapter({ useWebComponents: false });
      const theme: ThemeConfig = {
        logo: "/logo.png",
        nav: [{ text: "Guide", link: "/guide/" }],
        footer: { message: "MIT License" },
      };

      const config: AdapterConfig = {
        config: { title: "Test", adapter: adapter },
        theme,
      };

      const renderer = adapter.createRenderer(config);
      const content: RenderContent = {
        frontmatter: { title: "Test" },
        html: "<p>Content</p>",
        toc: [],
      };

      const result = renderer.render(content);

      expect(result).toContain("/logo.png");
      expect(result).toContain("/guide/");
      expect(result).toContain("MIT License");
    });
  });
});
