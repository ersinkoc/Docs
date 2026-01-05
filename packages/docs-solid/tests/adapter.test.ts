/**
 * @oxog/docs-solid - Tests
 */
import { describe, it, expect } from "vitest";
import { createSolidAdapter } from "../src/adapter.js";

describe("SolidAdapter", () => {
  it("should create adapter", () => {
    const adapter = createSolidAdapter();
    expect(adapter.name).toBe("solid");
  });

  it("should render content", async () => {
    const adapter = createSolidAdapter();
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
