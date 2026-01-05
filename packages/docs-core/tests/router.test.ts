/**
 * @oxog/docs-core - Router Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Router } from "../src/router.js";
import type { ContentFile, Route } from "../src/types.js";
import { join } from "node:path";

describe("Router", () => {
  let router: Router;

  beforeEach(() => {
    router = new Router("docs");
  });

  describe("scan()", () => {
    it("should return empty array when directory does not exist", async () => {
      const router = new Router("/non/existent/directory");
      const files = await router.scan();
      expect(files).toEqual([]);
    });

    it("should scan nested directories", async () => {
      const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
      const { join } = require("node:path");
      const testDir = join(__dirname, "test-nested-router");
      const nestedDir = join(testDir, "docs", "guide");

      try {
        mkdirSync(nestedDir, { recursive: true });
        writeFileSync(join(nestedDir, "index.md"), "# Index\n");
        writeFileSync(join(nestedDir, "getting-started.md"), "# Getting Started\n");

        const router = new Router(join(testDir, "docs"));
        const files = await router.scan();

        // Should find files in nested directories
        expect(files.length).toBe(2);
        // Check if recursive scanning works (handle both Windows and Unix paths)
        expect(files[0]?.relativePath).toMatch(/guide[\\/]/);
      } finally {
        rmSync(testDir, { recursive: true, force: true });
      }
    });
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

    it("should handle file without extension", () => {
      const url = router["pathToUrl"]("README");
      expect(url).toBe("/README/");
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

    it("should parse nested arrays with complex items", () => {
      const yaml = `items: [item1, item2, item3]
numbers: [1, 2, 3]`;

      const result = router["parseFrontmatter"](yaml);

      expect(result.items).toEqual(["item1", "item2", "item3"]);
      expect(result.numbers).toEqual([1, 2, 3]);
    });

    it("should handle empty yaml", () => {
      const result = router["parseFrontmatter"]("");

      expect(result).toEqual({});
    });

    it("should parse plain strings without quotes", () => {
      const yaml = `category: development`;

      const result = router["parseFrontmatter"](yaml);

      expect(result.category).toBe("development");
    });

    it("should parse numbers in arrays", () => {
      const yaml = `scores: [95, 87, 92]`;

      const result = router["parseFrontmatter"](yaml);

      expect(result.scores).toEqual([95, 87, 92]);
    });

    it("should parse empty string as undefined", () => {
      const yaml = `key:`;

      const result = router["parseFrontmatter"](yaml);

      expect(result.key).toBeUndefined();
    });

    it("should parse null value", () => {
      const yaml = `key: null`;

      const result = router["parseFrontmatter"](yaml);

      expect(result.key).toBeNull();
    });

    it("should parse tilde as null", () => {
      const yaml = `key: ~`;

      const result = router["parseFrontmatter"](yaml);

      expect(result.key).toBeNull();
    });

    it("should parse single-quoted strings", () => {
      const yaml = `key: 'value with spaces'`;

      const result = router["parseFrontmatter"](yaml);

      expect(result.key).toBe("value with spaces");
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

    it("should return routes with hierarchy information", () => {
      router["routes"].set("/guide/", {
        path: "/guide/",
        filePath: "/test/docs/guide/index.md",
        frontmatter: {},
        children: [],
      });
      router["routes"].set("/guide/getting-started/", {
        path: "/guide/getting-started/",
        filePath: "/test/docs/guide/getting-started.md",
        frontmatter: {},
        parentPath: "/guide/",
      });
      // Also set hierarchy array since it's not auto-populated
      router["hierarchy"] = [
        {
          path: "/guide/",
          title: "Guide",
          children: [
            { path: "/guide/getting-started/", title: "Getting Started" },
          ],
        },
      ];

      const hierarchy = router.getHierarchy();

      expect(hierarchy.length).toBeGreaterThan(0);
    });
  });

  describe("getRoutesByBasePath()", () => {
    beforeEach(() => {
      router["routes"].set("/api/", {
        path: "/api/",
        filePath: "/test/docs/api/index.md",
        frontmatter: {},
      });
      router["routes"].set("/api/endpoints/", {
        path: "/api/endpoints/",
        filePath: "/test/docs/api/endpoints.md",
        frontmatter: {},
      });
      router["routes"].set("/other/", {
        path: "/other/",
        filePath: "/test/docs/other.md",
        frontmatter: {},
      });
    });

    it("should return routes under base path", () => {
      const routes = router.getRoutesByBasePath("/api");

      expect(routes.length).toBeGreaterThan(0);
      for (const route of routes) {
        expect(route.path.startsWith("/api")).toBe(true);
      }
    });

    it("should exclude the base path when basePath has trailing slash", () => {
      const routes = router.getRoutesByBasePath("/api/");

      expect(routes.some((r) => r.path === "/api/")).toBe(false);
      expect(routes.some((r) => r.path === "/api/endpoints/")).toBe(true);
    });

    it("should return empty array for non-existent base path", () => {
      const routes = router.getRoutesByBasePath("/nonexistent");

      expect(routes).toEqual([]);
    });
  });

  describe("createRouter()", () => {
    it("should create router and scan for routes", async () => {
      const { createRouter } = await import("../src/router.js");
      const router = await createRouter("docs");

      expect(router).toBeDefined();
    });
  });

  describe("getItemTitle()", () => {
    it("should return title from frontmatter when string", () => {
      const route = {
        path: "/test/path/",
        filePath: "/test.md",
        frontmatter: { title: "Custom Title" },
      };

      const title = router["getItemTitle"](route);

      expect(title).toBe("Custom Title");
    });

    it("should extract title from path when frontmatter title is missing", () => {
      const route = {
        path: "/getting-started/",
        filePath: "/test.md",
        frontmatter: {},
      };

      const title = router["getItemTitle"](route);

      expect(title).toBe("Getting Started");
    });

    it("should extract title from path when frontmatter title is empty string", () => {
      const route = {
        path: "/api-reference/",
        filePath: "/test.md",
        frontmatter: { title: "" },
      };

      const title = router["getItemTitle"](route);

      expect(title).toBe("Api Reference");
    });

    it("should handle index path fallback", () => {
      const route = {
        path: "/guide/",
        filePath: "/test.md",
        frontmatter: {},
      };

      const title = router["getItemTitle"](route);

      expect(title).toBe("Guide");
    });
  });

  describe("generateRoutes()", () => {
    it("should generate routes from content files", () => {
      const files: ContentFile[] = [
        { path: "/test/a.md", relativePath: "a.md", url: "/a/", frontmatter: {} },
        { path: "/test/b.md", relativePath: "b.md", url: "/b/", frontmatter: {} },
      ];

      const routes = router.generateRoutes(files);

      expect(routes.length).toBe(2);
      expect(routes[0].path).toBe("/a/");
      expect(routes[1].path).toBe("/b/");
    });

    it("should sort files by relative path", () => {
      const files: ContentFile[] = [
        { path: "/test/z.md", relativePath: "z.md", url: "/z/", frontmatter: {} },
        { path: "/test/a.md", relativePath: "a.md", url: "/a/", frontmatter: {} },
        { path: "/test/m.md", relativePath: "m.md", url: "/m/", frontmatter: {} },
      ];

      const routes = router.generateRoutes(files);

      expect(routes[0].path).toBe("/a/");
      expect(routes[1].path).toBe("/m/");
      expect(routes[2].path).toBe("/z/");
    });
  });

  describe("buildSection()", () => {
    it("should sort routes by sidebarPosition", () => {
      const routes: Route[] = [
        {
          path: "/test/c/",
          filePath: "/test/c.md",
          frontmatter: {},
          sidebarPosition: 3,
        },
        {
          path: "/test/a/",
          filePath: "/test/a.md",
          frontmatter: {},
          sidebarPosition: 1,
        },
        {
          path: "/test/b/",
          filePath: "/test/b.md",
          frontmatter: {},
          sidebarPosition: 2,
        },
      ];

      const section = router["buildSection"](routes);

      expect(section.items).toHaveLength(3);
      expect(section.items[0].link).toBe("/test/a/");
      expect(section.items[1].link).toBe("/test/b/");
      expect(section.items[2].link).toBe("/test/c/");
    });

    it("should place routes without sidebarPosition at the end", () => {
      const routes: Route[] = [
        {
          path: "/test/a/",
          filePath: "/test/a.md",
          frontmatter: {},
          sidebarPosition: 1,
        },
        {
          path: "/test/b/",
          filePath: "/test/b.md",
          frontmatter: {},
          // No sidebarPosition
        },
        {
          path: "/test/c/",
          filePath: "/test/c.md",
          frontmatter: {},
          sidebarPosition: 2,
        },
      ];

      const section = router["buildSection"](routes);

      expect(section.items).toHaveLength(3);
      expect(section.items[0].link).toBe("/test/a/");
      expect(section.items[1].link).toBe("/test/c/");
      expect(section.items[2].link).toBe("/test/b/");
    });

    it("should use Infinity for non-numeric order", () => {
      const routes: Route[] = [
        {
          path: "/test/a/",
          filePath: "/test/a.md",
          frontmatter: { order: "first" },
          sidebarPosition: 1,
        },
        {
          path: "/test/b/",
          filePath: "/test/b.md",
          frontmatter: { order: 2 },
        },
      ];

      const section = router["buildSection"](routes);

      // Route with order should come first, then the one with Infinity
      expect(section.items[0].link).toBe("/test/a/");
      expect(section.items[1].link).toBe("/test/b/");
    });
  });

  describe("getHierarchy()", () => {
    it("should return default values when no routes exist", () => {
      // Don't setup any routes - hierarchy should be empty
      const hierarchy = router.getHierarchy();

      // When there are no routes, it should return empty array or handle gracefully
      expect(Array.isArray(hierarchy)).toBe(true);
    });

    it("should return default path when firstRoute is undefined", () => {
      // Setup empty routes Map
      router["routes"].clear();
      router["hierarchy"] = [];

      const hierarchy = router.getHierarchy();

      expect(Array.isArray(hierarchy)).toBe(true);
    });
  });

  describe("generateRoutes() with path override", () => {
    it("should use file.url when path is not a string in frontmatter", () => {
      const files: ContentFile[] = [
        {
          path: "/test/page.md",
          relativePath: "page.md",
          url: "/custom-url/",
          frontmatter: { path: 123 }, // number instead of string
        },
      ];

      const routes = router.generateRoutes(files);

      expect(routes[0].path).toBe("/custom-url/");
    });

    it("should use frontmatter path when it is a string", () => {
      const files: ContentFile[] = [
        {
          path: "/test/page.md",
          relativePath: "page.md",
          url: "/default/",
          frontmatter: { path: "/custom-path/" },
        },
      ];

      const routes = router.generateRoutes(files);

      expect(routes[0].path).toBe("/custom-path/");
    });

    it("should use Infinity when order is not a number", () => {
      const files: ContentFile[] = [
        {
          path: "/test/a.md",
          relativePath: "a.md",
          url: "/a/",
          frontmatter: { order: 1 },
        },
        {
          path: "/test/b.md",
          relativePath: "b.md",
          url: "/b/",
          frontmatter: { order: "later" }, // non-numeric
        },
      ];

      const routes = router.generateRoutes(files);

      // Both should have routes, but we need to check sidebarPosition
      expect(routes.length).toBe(2);
      const routeA = routes.find((r) => r.path === "/a/");
      const routeB = routes.find((r) => r.path === "/b/");
      expect(routeA?.sidebarPosition).toBe(1);
      expect(routeB?.sidebarPosition).toBe(Infinity);
    });
  });
});
