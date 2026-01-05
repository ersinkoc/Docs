/**
 * @oxog/docs-svelte - Tests
 */
import { describe, it, expect } from "vitest";
import { createSvelteAdapter } from "../src/adapter.js";

describe("SvelteAdapter", () => {
  it("should create adapter", () => {
    const adapter = createSvelteAdapter();
    expect(adapter.name).toBe("svelte");
  });

  it("should render content", async () => {
    const adapter = createSvelteAdapter();
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
