/**
 * @oxog/docs-react - Tests
 */

import { describe, it, expect } from "vitest";
import { createReactAdapter } from "../src/adapter.js";

describe("ReactAdapter", () => {
  it("should create adapter", () => {
    const adapter = createReactAdapter();
    expect(adapter.name).toBe("react");
    expect(typeof adapter.createRenderer).toBe("function");
  });

  it("should create renderer", () => {
    const adapter = createReactAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });
    expect(renderer).toBeDefined();
  });

  it("should render content", async () => {
    const adapter = createReactAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });

    const content = {
      frontmatter: { title: "Test Page", description: "A test" },
      html: "<p>Hello World</p>",
      toc: [],
    };

    const result = await renderer.render(content);
    expect(result).toContain("<!DOCTYPE html>");
    expect(result).toContain("Test Page");
    expect(result).toContain("Hello World");
  });
});
