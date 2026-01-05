/**
 * @oxog/docs-vue - Tests
 */
import { describe, it, expect } from "vitest";
import { createVueAdapter } from "../src/adapter.js";

describe("VueAdapter", () => {
  it("should create adapter", () => {
    const adapter = createVueAdapter();
    expect(adapter.name).toBe("vue");
  });

  it("should render content", async () => {
    const adapter = createVueAdapter();
    const renderer = adapter.createRenderer({
      config: { title: "Test", adapter },
      theme: undefined,
    });
    const result = await renderer.render({
      frontmatter: { title: "Test" },
      html: "<p>Hello</p>",
      toc: [],
    });
    expect(result).toContain("<!DOCTYPE html>");
    expect(result).toContain("Test");
  });
});
