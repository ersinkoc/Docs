/**
 * @oxog/docs-vue - Tests
 */

import { describe, it, expect, vi } from "vitest";
import { createVueAdapter } from "../src/adapter.js";
import type { RenderContent } from "@oxog/docs-core";

describe("VueAdapter", () => {
  it("should create adapter", () => {
    const adapter = createVueAdapter();
    expect(adapter.name).toBe("vue");
    expect(typeof adapter.createRenderer).toBe("function");
    expect(typeof adapter.transformHtml).toBe("function");
    expect(typeof adapter.hydrate).toBe("function");
  });

  it("should render content", async () => {
    const adapter = createVueAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });
    const content: RenderContent = {
      frontmatter: { title: "Test" },
      html: "<p>Hello</p>",
      toc: [],
    };
    const result = await renderer.render(content);
    expect(result).toContain("<!DOCTYPE html>");
    expect(result).toContain("Test");
  });

  it("should create renderer with config", () => {
    const adapter = createVueAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test Site", adapter },
      theme: undefined,
    });
    expect(renderer).toBeDefined();
    expect(typeof renderer.render).toBe("function");
  });

  it("should render content with default title", async () => {
    const adapter = createVueAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });

    const content: RenderContent = {
      frontmatter: {},
      html: "<p>Content</p>",
      toc: [],
    };

    const result = await renderer.render(content);
    expect(result).toContain("<title>Documentation</title>");
  });

  it("should transform HTML", () => {
    const adapter = createVueAdapter();
    const result = adapter.transformHtml("<p>test</p>");
    expect(result).toBe("<p>test</p>");
  });

  it("should hydrate element", () => {
    const adapter = createVueAdapter();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    adapter.hydrate({ id: "vue-app" }, { path: "/test" });
    expect(consoleSpy).toHaveBeenCalledWith("Vue hydration:", { path: "/test" });
    consoleSpy.mockRestore();
  });

  it("should render complete HTML document", async () => {
    const adapter = createVueAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });

    const content: RenderContent = {
      frontmatter: { title: "My Vue App" },
      html: "<h1>Welcome</h1>",
      toc: [],
    };

    const result = await renderer.render(content);
    expect(result).toContain('<meta charset="UTF-8">');
    expect(result).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    expect(result).toContain('<div id="app">');
    expect(result).toContain("<script type=\"module\">");
  });

  it("should escape special characters in title", async () => {
    const adapter = createVueAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });

    const content: RenderContent = {
      frontmatter: { title: '<script>alert(1)</script>' },
      html: "<p>Content</p>",
      toc: [],
    };

    const result = await renderer.render(content);
    expect(result).toContain("&lt;script&gt;");
    expect(result).not.toContain("<script>alert");
  });

  it("should include description in meta", async () => {
    const adapter = createVueAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });

    const content: RenderContent = {
      frontmatter: { title: "Test", description: "A test description" },
      html: "<p>Content</p>",
      toc: [],
    };

    const result = await renderer.render(content);
    expect(result).toContain('content="A test description"');
  });
});
