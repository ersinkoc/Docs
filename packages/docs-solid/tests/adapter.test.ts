/**
 * @oxog/docs-solid - Tests
 */

import { describe, it, expect, vi } from "vitest";
import { createSolidAdapter } from "../src/adapter.js";
import type { RenderContent } from "@oxog/docs-core";

describe("SolidAdapter", () => {
  it("should create adapter", () => {
    const adapter = createSolidAdapter();
    expect(adapter.name).toBe("solid");
    expect(typeof adapter.createRenderer).toBe("function");
    expect(typeof adapter.transformHtml).toBe("function");
    expect(typeof adapter.hydrate).toBe("function");
  });

  it("should render content", async () => {
    const adapter = createSolidAdapter();
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
    const adapter = createSolidAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test Site", adapter },
      theme: undefined,
    });
    expect(renderer).toBeDefined();
    expect(typeof renderer.render).toBe("function");
  });

  it("should render content with default title", async () => {
    const adapter = createSolidAdapter();
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
    const adapter = createSolidAdapter();
    const result = adapter.transformHtml("<p>test</p>");
    expect(result).toBe("<p>test</p>");
  });

  it("should hydrate element", () => {
    const adapter = createSolidAdapter();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    adapter.hydrate({ id: "solid-root" }, { path: "/test" });
    expect(consoleSpy).toHaveBeenCalledWith("Solid hydration");
    consoleSpy.mockRestore();
  });

  it("should render complete HTML document", async () => {
    const adapter = createSolidAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });

    const content: RenderContent = {
      frontmatter: { title: "My Solid App" },
      html: "<h1>Welcome</h1>",
      toc: [],
    };

    const result = await renderer.render(content);
    expect(result).toContain('<meta charset="UTF-8">');
    expect(result).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    expect(result).toContain('<div id="solid">');
    expect(result).toContain("<script type=\"module\">");
  });

  it("should escape special characters in title", async () => {
    const adapter = createSolidAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });

    const content: RenderContent = {
      frontmatter: { title: '<svg onload=alert(1)>' },
      html: "<p>Content</p>",
      toc: [],
    };

    const result = await renderer.render(content);
    // The < and > should be escaped
    expect(result).toContain("&lt;svg");
    expect(result).toContain("&gt;");
    // Should not contain unescaped script tag
    expect(result).not.toContain("<svg onload");
  });

  it("should include description in meta", async () => {
    const adapter = createSolidAdapter();
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
