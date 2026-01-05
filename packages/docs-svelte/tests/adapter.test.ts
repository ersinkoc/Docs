/**
 * @oxog/docs-svelte - Tests
 */

import { describe, it, expect, vi } from "vitest";
import { createSvelteAdapter } from "../src/adapter.js";
import type { RenderContent } from "@oxog/docs-core";

describe("SvelteAdapter", () => {
  it("should create adapter", () => {
    const adapter = createSvelteAdapter();
    expect(adapter.name).toBe("svelte");
    expect(typeof adapter.createRenderer).toBe("function");
    expect(typeof adapter.transformHtml).toBe("function");
    expect(typeof adapter.hydrate).toBe("function");
  });

  it("should render content", async () => {
    const adapter = createSvelteAdapter();
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
    const adapter = createSvelteAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test Site", adapter },
      theme: undefined,
    });
    expect(renderer).toBeDefined();
    expect(typeof renderer.render).toBe("function");
  });

  it("should render content with default title", async () => {
    const adapter = createSvelteAdapter();
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
    const adapter = createSvelteAdapter();
    const result = adapter.transformHtml("<p>test</p>");
    expect(result).toBe("<p>test</p>");
  });

  it("should hydrate element", () => {
    const adapter = createSvelteAdapter();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    adapter.hydrate({ id: "svelte-root" }, { path: "/test" });
    expect(consoleSpy).toHaveBeenCalledWith("Svelte hydration");
    consoleSpy.mockRestore();
  });

  it("should render complete HTML document", async () => {
    const adapter = createSvelteAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });

    const content: RenderContent = {
      frontmatter: { title: "My Svelte App" },
      html: "<h1>Welcome</h1>",
      toc: [],
    };

    const result = await renderer.render(content);
    expect(result).toContain('<meta charset="UTF-8">');
    expect(result).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    expect(result).toContain('<div id="svelte">');
    expect(result).toContain("<script type=\"module\">");
  });

  it("should escape special characters in title", async () => {
    const adapter = createSvelteAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });

    const content: RenderContent = {
      frontmatter: { title: '<img src=x onerror=alert(1)>' },
      html: "<p>Content</p>",
      toc: [],
    };

    const result = await renderer.render(content);
    // The < and > should be escaped
    expect(result).toContain("&lt;img");
    expect(result).toContain("&gt;");
    // Should not contain unescaped img tag
    expect(result).not.toContain("<img src=x");
  });

  it("should include description in meta", async () => {
    const adapter = createSvelteAdapter();
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
