/**
 * @oxog/docs-react - Tests
 */

import { describe, it, expect } from "vitest";
import { createReactAdapter, ReactAdapterOptions } from "../src/adapter.js";
import type { AdapterConfig, RenderContent } from "@oxog/docs-core";

describe("ReactAdapter", () => {
  it("should create adapter", () => {
    const adapter = createReactAdapter();
    expect(adapter.name).toBe("react");
    expect(typeof adapter.createRenderer).toBe("function");
    expect(typeof adapter.transformHtml).toBe("function");
    expect(typeof adapter.hydrate).toBe("function");
  });

  it("should create adapter with options", () => {
    const options: ReactAdapterOptions = { streaming: true };
    const adapter = createReactAdapter(options);
    expect(adapter.name).toBe("react");
  });

  it("should create renderer", () => {
    const adapter = createReactAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });
    expect(renderer).toBeDefined();
    expect(typeof renderer.render).toBe("function");
  });

  it("should render content", async () => {
    const adapter = createReactAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });

    const content: RenderContent = {
      frontmatter: { title: "Test Page", description: "A test" },
      html: "<p>Hello World</p>",
      toc: [],
    };

    const result = await renderer.render(content);
    expect(result).toContain("<!DOCTYPE html>");
    expect(result).toContain("Test Page");
    expect(result).toContain("Hello World");
  });

  it("should render content with default title", async () => {
    const adapter = createReactAdapter();
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
    const adapter = createReactAdapter();
    const result = adapter.transformHtml("<p>test</p>");
    expect(result).toBe("<p>test</p>");
  });

  it("should hydrate element", () => {
    const adapter = createReactAdapter();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    adapter.hydrate({ id: "root" }, { path: "/test" });
    expect(consoleSpy).toHaveBeenCalledWith("React hydration:", { path: "/test" });
    consoleSpy.mockRestore();
  });

  it("should render complete HTML document", async () => {
    const adapter = createReactAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });

    const content: RenderContent = {
      frontmatter: { title: "My Page" },
      html: "<h1>Hello</h1>",
      toc: [{ id: "hello", text: "Hello", level: 2 }],
    };

    const result = await renderer.render(content);
    expect(result).toContain('<meta charset="UTF-8">');
    expect(result).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    expect(result).toContain('<div id="root">');
    expect(result).toContain("<script type=\"module\">");
  });

  it("should escape special characters in title", async () => {
    const adapter = createReactAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });

    const content: RenderContent = {
      frontmatter: { title: 'Test <script>alert("xss")</script>' },
      html: "<p>Content</p>",
      toc: [],
    };

    const result = await renderer.render(content);
    expect(result).toContain("&lt;script&gt;");
    expect(result).not.toContain("<script>alert");
  });
});
