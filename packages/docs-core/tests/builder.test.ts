/**
 * @oxog/docs-core - Builder Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Builder } from "../src/builder";
import type { DocsConfig } from "../src/types";
import { Kernel } from "../src/kernel";

describe("Builder", () => {
  let builder: Builder;
  let mockConfig: DocsConfig;
  let kernel: Kernel;

  beforeEach(() => {
    mockConfig = {
      title: "Test Docs",
      srcDir: "docs",
      outDir: "dist",
      adapter: {
        name: "vanilla",
        createRenderer: () => ({
          name: "vanilla",
          render: async (content) => `<div>${content.frontmatter.title}</div>`,
        }),
        transformHtml: (html) => html,
        hydrate: () => {},
      },
    };
    kernel = new Kernel();
    builder = new Builder(mockConfig, kernel);
  });

  describe("constructor", () => {
    it("should initialize with config and kernel", () => {
      expect(builder).toBeDefined();
    });
  });

  describe("build", () => {
    it("should return build manifest with pages and assets", async () => {
      const manifest = await builder.build();
      expect(manifest).toHaveProperty("pages");
      expect(manifest).toHaveProperty("assets");
      expect(manifest).toHaveProperty("buildTime");
      expect(typeof manifest.buildTime).toBe("number");
    });

    it("should include pages array in manifest", async () => {
      const manifest = await builder.build();
      expect(manifest.pages).toBeDefined();
      expect(Array.isArray(manifest.pages)).toBe(true);
    });

    it("should include assets array in manifest", async () => {
      const manifest = await builder.build();
      expect(manifest.assets).toBeDefined();
      expect(Array.isArray(manifest.assets)).toBe(true);
    });
  });

  describe("getBuildTime", () => {
    it("should return a number", () => {
      const buildTime = builder.getBuildTime();
      expect(typeof buildTime).toBe("number");
    });

    it("should return non-negative value", () => {
      const buildTime = builder.getBuildTime();
      expect(buildTime).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("Builder - parseFrontmatter", () => {
  let builder: Builder;
  let kernel: Kernel;

  beforeEach(() => {
    const mockConfig: DocsConfig = {
      title: "Test",
      adapter: {
        name: "vanilla",
        createRenderer: () => ({
          name: "vanilla",
          render: async () => "<div></div>",
        }),
        transformHtml: (html) => html,
        hydrate: () => {},
      },
    };
    kernel = new Kernel();
    builder = new Builder(mockConfig, kernel);
  });

  it("should parse frontmatter with metadata", () => {
    const content = `---
title: Hello World
author: Test
---
# Content here`;

    const result = (builder as unknown as {
      parseFrontmatter: (c: string) => { metadata: Record<string, unknown>; content: string };
    }).parseFrontmatter(content);

    expect(result.metadata.title).toBe("Hello World");
    expect(result.metadata.author).toBe("Test");
    expect(result.content).toContain("# Content here");
  });

  it("should handle content without frontmatter", () => {
    const content = `# Just content`;

    const result = (builder as unknown as {
      parseFrontmatter: (c: string) => { metadata: Record<string, unknown>; content: string };
    }).parseFrontmatter(content);

    expect(result.metadata).toEqual({});
    expect(result.content).toBe("# Just content");
  });

  it("should handle empty frontmatter with content", () => {
    const content = `#---
---
# Content`;

    const result = (builder as unknown as {
      parseFrontmatter: (c: string) => { metadata: Record<string, unknown>; content: string };
    }).parseFrontmatter(content);

    expect(result.metadata).toEqual({});
    // The regex returns the whole content after --- when frontmatter is empty-ish
    expect(result.content).toContain("# Content");
  });
});

describe("Builder - parseFrontmatterValue", () => {
  let builder: Builder;
  let kernel: Kernel;

  beforeEach(() => {
    const mockConfig: DocsConfig = {
      title: "Test",
      adapter: {
        name: "vanilla",
        createRenderer: () => ({
          name: "vanilla",
          render: async () => "<div></div>",
        }),
        transformHtml: (html) => html,
        hydrate: () => {},
      },
    };
    kernel = new Kernel();
    builder = new Builder(mockConfig, kernel);
  });

  it("should parse string values", () => {
    const result = (builder as unknown as {
      parseFrontmatterValue: (yaml: string) => Record<string, unknown>;
    }).parseFrontmatterValue("key: value");

    expect(result.key).toBe("value");
  });

  it("should parse boolean true", () => {
    const result = (builder as unknown as {
      parseFrontmatterValue: (yaml: string) => Record<string, unknown>;
    }).parseFrontmatterValue("enabled: true");

    expect(result.enabled).toBe(true);
  });

  it("should parse boolean false", () => {
    const result = (builder as unknown as {
      parseFrontmatterValue: (yaml: string) => Record<string, unknown>;
    }).parseFrontmatterValue("disabled: false");

    expect(result.disabled).toBe(false);
  });

  it("should parse numbers", () => {
    const result = (builder as unknown as {
      parseFrontmatterValue: (yaml: string) => Record<string, unknown>;
    }).parseFrontmatterValue("count: 42");

    expect(result.count).toBe(42);
  });

  it("should parse null values", () => {
    const result = (builder as unknown as {
      parseFrontmatterValue: (yaml: string) => Record<string, unknown>;
    }).parseFrontmatterValue("empty: null");

    expect(result.empty).toBe(null);
  });

  it("should parse quoted strings", () => {
    const result = (builder as unknown as {
      parseFrontmatterValue: (yaml: string) => Record<string, unknown>;
    }).parseFrontmatterValue('key: "quoted value"');

    expect(result.key).toBe("quoted value");
  });

  it("should parse single-quoted strings", () => {
    const result = (builder as unknown as {
      parseFrontmatterValue: (yaml: string) => Record<string, unknown>;
    }).parseFrontmatterValue("key: 'single quoted'");

    expect(result.key).toBe("single quoted");
  });
});

describe("Builder - parseFrontmatterString", () => {
  let builder: Builder;
  let kernel: Kernel;

  beforeEach(() => {
    const mockConfig: DocsConfig = {
      title: "Test",
      adapter: {
        name: "vanilla",
        createRenderer: () => ({
          name: "vanilla",
          render: async () => "<div></div>",
        }),
        transformHtml: (html) => html,
        hydrate: () => {},
      },
    };
    kernel = new Kernel();
    builder = new Builder(mockConfig, kernel);
  });

  it("should return true for 'true'", () => {
    const result = (builder as unknown as {
      parseFrontmatterString: (value: string) => unknown;
    }).parseFrontmatterString("true");

    expect(result).toBe(true);
  });

  it("should return false for 'false'", () => {
    const result = (builder as unknown as {
      parseFrontmatterString: (value: string) => unknown;
    }).parseFrontmatterString("false");

    expect(result).toBe(false);
  });

  it("should return null for 'null'", () => {
    const result = (builder as unknown as {
      parseFrontmatterString: (value: string) => unknown;
    }).parseFrontmatterString("null");

    expect(result).toBe(null);
  });

  it("should return null for '~'", () => {
    const result = (builder as unknown as {
      parseFrontmatterString: (value: string) => unknown;
    }).parseFrontmatterString("~");

    expect(result).toBe(null);
  });

  it("should return undefined for empty string", () => {
    const result = (builder as unknown as {
      parseFrontmatterString: (value: string) => unknown;
    }).parseFrontmatterString("");

    expect(result).toBe(undefined);
  });

  it("should parse numbers as numbers", () => {
    const result = (builder as unknown as {
      parseFrontmatterString: (value: string) => unknown;
    }).parseFrontmatterString("123");

    expect(result).toBe(123);
  });

  it("should parse float numbers", () => {
    const result = (builder as unknown as {
      parseFrontmatterString: (value: string) => unknown;
    }).parseFrontmatterString("3.14");

    expect(result).toBe(3.14);
  });

  it("should remove quotes from quoted strings", () => {
    const result = (builder as unknown as {
      parseFrontmatterString: (value: string) => unknown;
    }).parseFrontmatterString('"quoted"');

    expect(result).toBe("quoted");
  });
});

describe("Builder - escapeHtml", () => {
  let builder: Builder;
  let kernel: Kernel;

  beforeEach(() => {
    const mockConfig: DocsConfig = {
      title: "Test",
      adapter: {
        name: "vanilla",
        createRenderer: () => ({
          name: "vanilla",
          render: async () => "<div></div>",
        }),
        transformHtml: (html) => html,
        hydrate: () => {},
      },
    };
    kernel = new Kernel();
    builder = new Builder(mockConfig, kernel);
  });

  it("should escape &", () => {
    const result = (builder as unknown as {
      escapeHtml: (str: string) => string;
    }).escapeHtml("a & b");

    expect(result).toBe("a &amp; b");
  });

  it("should escape <", () => {
    const result = (builder as unknown as {
      escapeHtml: (str: string) => string;
    }).escapeHtml("<div>");

    expect(result).toBe("&lt;div&gt;");
  });

  it("should escape >", () => {
    const result = (builder as unknown as {
      escapeHtml: (str: string) => string;
    }).escapeHtml(">");

    expect(result).toBe("&gt;");
  });

  it("should escape quotes", () => {
    const result = (builder as unknown as {
      escapeHtml: (str: string) => string;
    }).escapeHtml('"test"');

    expect(result).toBe("&quot;test&quot;");
  });

  it("should escape single quotes", () => {
    const result = (builder as unknown as {
      escapeHtml: (str: string) => string;
    }).escapeHtml("'test'");

    expect(result).toBe("&#039;test&#039;");
  });

  it("should handle empty string", () => {
    const result = (builder as unknown as {
      escapeHtml: (str: string) => string;
    }).escapeHtml("");

    expect(result).toBe("");
  });
});

describe("Builder - parseMarkdown", () => {
  let builder: Builder;
  let kernel: Kernel;

  beforeEach(() => {
    const mockConfig: DocsConfig = {
      title: "Test",
      adapter: {
        name: "vanilla",
        createRenderer: () => ({
          name: "vanilla",
          render: async () => "<div></div>",
        }),
        transformHtml: (html) => html,
        hydrate: () => {},
      },
    };
    kernel = new Kernel();
    builder = new Builder(mockConfig, kernel);
  });

  it("should return AST with root type", async () => {
    const ast = await (builder as unknown as {
      parseMarkdown: (content: string) => Promise<{ type: string; children: unknown[] }>;
    }).parseMarkdown("test");

    expect(ast.type).toBe("root");
    expect(ast.children).toBeDefined();
  });

  it("should include content in HTML wrapper", async () => {
    const ast = await (builder as unknown as {
      parseMarkdown: (content: string) => Promise<{ type: string; children: unknown[] }>;
    }).parseMarkdown("hello");

    const htmlChild = ast.children.find(
      (c: unknown) => (c as { type: string }).type === "html",
    );
    expect(htmlChild).toBeDefined();
    expect((htmlChild as { value: string }).value).toContain("hello");
  });

  it("should escape HTML in content", async () => {
    const ast = await (builder as unknown as {
      parseMarkdown: (content: string) => Promise<{ type: string; children: unknown[] }>;
    }).parseMarkdown("<script>alert('xss')</script>");

    const htmlChild = ast.children.find(
      (c: unknown) => (c as { type: string }).type === "html",
    );
    expect((htmlChild as { value: string }).value).toContain("&lt;script&gt;");
  });
});

describe("Builder - renderMarkdown", () => {
  let builder: Builder;
  let kernel: Kernel;

  beforeEach(() => {
    const mockConfig: DocsConfig = {
      title: "Test",
      adapter: {
        name: "vanilla",
        createRenderer: () => ({
          name: "vanilla",
          render: async () => "<div></div>",
        }),
        transformHtml: (html) => html,
        hydrate: () => {},
      },
    };
    kernel = new Kernel();
    builder = new Builder(mockConfig, kernel);
  });

  it("should render AST to HTML string", async () => {
    const ast = {
      type: "root",
      children: [
        { type: "html", value: "<p>Test content</p>" },
      ],
    };

    const html = await (builder as unknown as {
      renderMarkdown: (a: unknown) => Promise<string>;
    }).renderMarkdown(ast);

    expect(html).toBe("<p>Test content</p>");
  });

  it("should handle empty AST", async () => {
    const ast = { type: "root", children: [] };

    const html = await (builder as unknown as {
      renderMarkdown: (a: unknown) => Promise<string>;
    }).renderMarkdown(ast);

    expect(html).toBe("");
  });

  it("should return empty string for null", async () => {
    const html = await (builder as unknown as {
      renderMarkdown: (a: unknown) => Promise<string>;
    }).renderMarkdown(null);

    expect(html).toBe("");
  });

  it("should return empty string for non-object", async () => {
    const html = await (builder as unknown as {
      renderMarkdown: (a: unknown) => Promise<string>;
    }).renderMarkdown("string");

    expect(html).toBe("");
  });

  it("should find HTML child in children", async () => {
    const ast = {
      type: "root",
      children: [
        { type: "heading", value: "Title" },
        { type: "html", value: "<p>Paragraph</p>" },
      ],
    };

    const html = await (builder as unknown as {
      renderMarkdown: (a: unknown) => Promise<string>;
    }).renderMarkdown(ast);

    expect(html).toBe("<p>Paragraph</p>");
  });
});

describe("Builder - copyDirectory", () => {
  let builder: Builder;
  let kernel: Kernel;

  beforeEach(() => {
    const mockConfig: DocsConfig = {
      title: "Test",
      adapter: {
        name: "vanilla",
        createRenderer: () => ({
          name: "vanilla",
          render: async () => "<div></div>",
        }),
        transformHtml: (html) => html,
        hydrate: () => {},
      },
    };
    kernel = new Kernel();
    builder = new Builder(mockConfig, kernel);
  });

  it("should return empty array for non-existent source", () => {
    const result = (builder as unknown as {
      copyDirectory: (src: string, dest: string) => { src: string; dest: string }[];
    }).copyDirectory("/non/existent/path", "/dest");

    expect(result).toEqual([]);
  });
});

describe("build function", () => {
  it("should create builder and call build", async () => {
    const mockConfig: DocsConfig = {
      title: "Test",
      adapter: {
        name: "vanilla",
        createRenderer: () => ({
          name: "vanilla",
          render: async () => "<div></div>",
        }),
        transformHtml: (html) => html,
        hydrate: () => {},
      },
    };
    const kernel = new Kernel();

    const { build } = await import("../src/builder");
    const manifest = await build(mockConfig, kernel);

    expect(manifest).toHaveProperty("pages");
    expect(manifest).toHaveProperty("assets");
    expect(manifest).toHaveProperty("buildTime");
  });
});
