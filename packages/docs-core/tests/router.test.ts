/**
 * @oxog/docs-core - Router Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Router } from "../src/router.js";

describe("Router", () => {
  let router: Router;

  beforeEach(() => {
    router = new Router("docs");
  });

  describe("pathToUrl()", () => {
    it("should convert index to root", () => {
      const url = router["pathToUrl"]("index.md");
      expect(url).toBe("/");
    });

    it("should convert guide to /guide/", () => {
      const url = router["pathToUrl"]("guide.md");
      expect(url).toBe("/guide/");
    });

    it("should handle nested paths", () => {
      const url = router["pathToUrl"]("guide/getting-started.md");
      expect(url).toBe("/guide/getting-started/");
    });

    it("should handle index in directories", () => {
      const url = router["pathToUrl"]("guide/index.md");
      expect(url).toBe("/guide/");
    });

    it("should preserve markdown extensions", () => {
      const url = router["pathToUrl"]("test.markdown");
      expect(url).toBe("/test/");
    });

    it("should handle non-markdown files", () => {
      const url = router["pathToUrl"]("test.txt");
      expect(url).toBe("/test/");
    });
  });

  describe("parseFrontmatter()", () => {
    it("should parse simple key-value pairs", () => {
      const yaml = `title: Test Title
description: Test Description`;

      const result = router["parseFrontmatter"](yaml);

      expect(result.title).toBe("Test Title");
      expect(result.description).toBe("Test Description");
    });

    it("should parse booleans", () => {
      const yaml = `enabled: true
disabled: false`;

      const result = router["parseFrontmatter"](yaml);

      expect(result.enabled).toBe(true);
      expect(result.disabled).toBe(false);
    });

    it("should parse numbers", () => {
      const yaml = `count: 42
price: 19.99`;

      const result = router["parseFrontmatter"](yaml);

      expect(result.count).toBe(42);
      expect(result.price).toBe(19.99);
    });

    it("should parse quoted strings", () => {
      const yaml = `title: "Test with 'quotes'"`;

      const result = router["parseFrontmatter"](yaml);

      expect(result.title).toBe("Test with 'quotes'");
    });

    it("should parse arrays", () => {
      const yaml = `tags: [a, b, c]`;

      const result = router["parseFrontmatter"](yaml);

      expect(result.tags).toEqual(["a", "b", "c"]);
    });

    it("should handle empty yaml", () => {
      const result = router["parseFrontmatter"]("");

      expect(result).toEqual({});
    });
  });

  describe("formatTitle()", () => {
    it("should convert kebab-case to Title Case", () => {
      const title = router["formatTitle"]("getting-started");

      expect(title).toBe("Getting Started");
    });

    it("should handle single words", () => {
      const title = router["formatTitle"]("guide");

      expect(title).toBe("Guide");
    });
  });

  describe("match()", () => {
    beforeEach(() => {
      // Setup routes for testing
      router["routes"].set("/guide/", {
        path: "/guide/",
        filePath: "/test/docs/guide/index.md",
        frontmatter: {},
      });
      router["routes"].set("/guide/getting-started/", {
        path: "/guide/getting-started/",
        filePath: "/test/docs/guide/getting-started.md",
        frontmatter: {},
      });
    });

    it("should return route for exact match", () => {
      const route = router.match("/guide/");

      expect(route).toBeDefined();
      expect(route?.path).toBe("/guide/");
    });

    it("should return undefined for non-existent route", () => {
      const route = router.match("/non-existent/");

      expect(route).toBeUndefined();
    });

    it("should auto-append trailing slash", () => {
      const route = router.match("/guide");

      expect(route).toBeDefined();
    });
  });

  describe("getRoutes()", () => {
    it("should return empty array when no routes", () => {
      expect(router.getRoutes()).toEqual([]);
    });

    it("should return all routes", () => {
      router["routes"].set("/a/", {
        path: "/a/",
        filePath: "/a.md",
        frontmatter: {},
      });
      router["routes"].set("/b/", {
        path: "/b/",
        filePath: "/b.md",
        frontmatter: {},
      });

      const routes = router.getRoutes();

      expect(routes).toHaveLength(2);
    });
  });

  describe("getHierarchy()", () => {
    it("should return empty array when no routes", () => {
      expect(router.getHierarchy()).toEqual([]);
    });
  });
});
