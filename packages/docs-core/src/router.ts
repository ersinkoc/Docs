/**
 * @oxog/docs-core - File-based Router
 * Generates routes from markdown file structure
 */

import { join, dirname, sep, relative } from "node:path";
import { existsSync, readdirSync, lstatSync, readFileSync } from "node:fs";
import type { ContentFile, Route, RouteHierarchy } from "./types";

/**
 * Markdown file extensions
 */
const MARKDOWN_EXTENSIONS = [".md", ".markdown", ".mdown"];

/**
 * Router class for file-based routing
 */
export class Router {
  /** Source directory */
  private srcDir: string;

  /** Registered routes */
  private routes: Map<string, Route> = new Map();

  /** Route hierarchy for sidebar */
  private hierarchy: RouteHierarchy[] = [];

  /**
   * Create router instance
   * @param srcDir - Source directory for markdown files
   */
  constructor(srcDir: string = "docs") {
    this.srcDir = srcDir;
  }

  /**
   * Scan directory for markdown files
   * @param dir - Directory to scan
   * @returns Array of content files
   */
  async scan(dir?: string): Promise<ContentFile[]> {
    const scanDir = dir ?? this.srcDir;

    if (!existsSync(scanDir)) {
      return [];
    }

    const files: ContentFile[] = [];
    await this.scanDirectory(scanDir, scanDir, files);
    return files;
  }

  /**
   * Recursively scan directory
   * @param dir - Current directory
   * @param baseDir - Base directory for relative paths
   * @param files - Array to collect files
   */
  private async scanDirectory(
    dir: string,
    baseDir: string,
    files: ContentFile[],
  ): Promise<void> {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath, baseDir, files);
      } else if (this.isMarkdownFile(entry.name)) {
        const relativePath = relative(baseDir, fullPath);
        const url = this.pathToUrl(relativePath);
        const frontmatter = await this.extractFrontmatter(fullPath);

        files.push({
          path: fullPath,
          relativePath,
          url,
          frontmatter: frontmatter.metadata,
          content: frontmatter.content,
        });
      }
    }
  }

  /**
   * Check if file is a markdown file
   * @param filename - Filename to check
   * @returns True if markdown file
   */
  private isMarkdownFile(filename: string): boolean {
    const ext = "." + filename.split(".").pop()?.toLowerCase();
    return MARKDOWN_EXTENSIONS.includes(ext);
  }

  /**
   * Convert file path to URL
   * @param relativePath - Relative file path
   * @returns URL path
   */
  private pathToUrl(relativePath: string): string {
    // Remove file extension (any extension)
    const lastDotIndex = relativePath.lastIndexOf(".");
    let path =
      lastDotIndex > 0 ? relativePath.slice(0, lastDotIndex) : relativePath;

    // Handle index files
    if (path.endsWith("/index")) {
      path = path.replace(/\/index$/, "") || "/";
    } else if (path === "index") {
      path = "/";
    }

    // Convert to URL format
    path = path.split(sep).join("/");

    // Add leading slash
    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    // Add trailing slash for non-root
    if (path !== "/" && !path.endsWith("/")) {
      path = path + "/";
    }

    return path;
  }

  /**
   * Extract frontmatter from file
   * @param filePath - Path to markdown file
   * @returns Frontmatter metadata and content
   */
  private async extractFrontmatter(
    filePath: string,
  ): Promise<{ metadata: Record<string, unknown>; content: string }> {
    const content = readFileSync(filePath, "utf-8");

    // Check for frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!frontmatterMatch) {
      return { metadata: {}, content };
    }

    const [, frontmatterYaml, markdownContent] = frontmatterMatch;
    const metadata = this.parseFrontmatter(frontmatterYaml?.trim() ?? "");

    return { metadata, content: markdownContent ?? "" };
  }

  /**
   * Parse YAML frontmatter
   * @param yaml - YAML string
   * @returns Parsed metadata
   */
  private parseFrontmatter(yaml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = yaml.split("\n");

    for (const line of lines) {
      const match = line.match(/^(\s*)(\w+):\s*(.*)$/);
      if (match) {
        const [, indent, key, value] = match;
        if (key && value !== undefined) {
          result[key] = this.parseValue(value.trim(), indent?.length ?? 0);
        }
      }
    }

    return result;
  }

  /**
   * Parse a YAML value
   * @param value - Value string
   * @param indent - Indentation level
   * @returns Parsed value
   */
  private parseValue(value: string, indent: number): unknown {
    // Empty
    if (!value) {
      return undefined;
    }

    // String (quoted)
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }

    // Boolean
    if (value === "true") return true;
    if (value === "false") return false;

    // Null
    if (value === "null" || value === "~") return null;

    // Number
    if (!isNaN(Number(value))) {
      return Number(value);
    }

    // Array
    if (value.startsWith("[") && value.endsWith("]")) {
      const items = value
        .slice(1, -1)
        .split(",")
        .map((v) => this.parseValue(v.trim(), indent));
      return items;
    }

    // String
    return value;
  }

  /**
   * Generate routes from content files
   * @param files - Content files
   * @returns Array of routes
   */
  generateRoutes(files: ContentFile[]): Route[] {
    this.routes.clear();
    this.hierarchy = [];

    // Sort files by path for consistent ordering
    const sortedFiles = [...files].sort((a, b) =>
      a.relativePath.localeCompare(b.relativePath),
    );

    for (const file of sortedFiles) {
      const route = this.createRoute(file);
      this.routes.set(route.path, route);
    }

    // Build hierarchy
    this.buildHierarchy();

    return Array.from(this.routes.values());
  }

  /**
   * Create route from content file
   * @param file - Content file
   * @returns Route
   */
  private createRoute(file: ContentFile): Route {
    // Check for frontmatter path override
    const overridePath = file.frontmatter.path;
    const path = typeof overridePath === "string" ? overridePath : file.url;

    // Handle sidebar order
    const order = file.frontmatter.order;
    const sidebarPosition = typeof order === "number" ? order : Infinity;

    return {
      path,
      filePath: file.path,
      frontmatter: file.frontmatter,
      sidebarPosition,
    };
  }

  /**
   * Build route hierarchy for sidebar
   */
  private buildHierarchy(): void {
    const pathGroups = new Map<string, Route[]>();

    for (const route of this.routes.values()) {
      const segments = route.path.split("/").filter(Boolean);
      const basePath = "/" + segments.slice(0, -1).join("/") + "/";

      const group = pathGroups.get(basePath) ?? [];
      group.push(route);
      pathGroups.set(basePath, group);
    }

    // Build hierarchy tree
    this.hierarchy = [];

    for (const [basePath, routes] of pathGroups) {
      const section = this.buildSection(routes);
      if (section.items && section.items.length > 0) {
        this.hierarchy.push(section);
      }
    }
  }

  /**
   * Build a hierarchy section from routes
   * @param routes - Routes for section
   * @returns Section
   */
  private buildSection(routes: Route[]): RouteHierarchy {
    // Sort by sidebar position
    const sorted = [...routes].sort(
      (a, b) =>
        ((a.sidebarPosition as number) ?? Infinity) -
        ((b.sidebarPosition as number) ?? Infinity),
    );

    const firstRoute = sorted[0];

    return {
      path: firstRoute?.path ?? "/",
      text: this.getSectionTitle(firstRoute),
      frontmatter: firstRoute?.frontmatter ?? {},
      items: sorted.map((r) => ({
        text: this.getItemTitle(r),
        link: r.path,
        frontmatter: r.frontmatter,
      })),
    };
  }

  /**
   * Get section title from route
   * @param route - First route in section
   * @returns Section title
   */
  private getSectionTitle(route?: Route): string {
    if (!route) return "";
    const segments = route.path.split("/").filter(Boolean);
    const sectionName = segments[segments.length - 2] || "";
    return this.formatTitle(sectionName);
  }

  /**
   * Get item title from route
   * @param route - Route
   * @returns Item title
   */
  private getItemTitle(route: Route): string {
    const title = route.frontmatter.title;
    if (typeof title === "string" && title) {
      return title;
    }

    // Extract from path
    const segments = route.path.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "index";
    return this.formatTitle(lastSegment);
  }

  /**
   * Format string as title
   * @param str - String to format
   * @returns Title case string
   */
  private formatTitle(str: string): string {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Match URL to route
   * @param url - URL to match
   * @returns Route if found, undefined otherwise
   */
  match(url: string): Route | undefined {
    // Normalize URL
    if (!url.endsWith("/") && url !== "/") {
      url = url + "/";
    }

    return this.routes.get(url);
  }

  /**
   * Get route hierarchy for sidebar
   * @returns Route hierarchy
   */
  getHierarchy(): RouteHierarchy[] {
    return this.hierarchy;
  }

  /**
   * Get all routes
   * @returns Array of all routes
   */
  getRoutes(): Route[] {
    return Array.from(this.routes.values());
  }

  /**
   * Get routes for a specific section
   * @param basePath - Base path for section
   * @returns Array of routes in section
   */
  getRoutesByBasePath(basePath: string): Route[] {
    const routes: Route[] = [];

    for (const route of this.routes.values()) {
      if (route.path.startsWith(basePath) && route.path !== basePath) {
        routes.push(route);
      }
    }

    return routes;
  }
}

/**
 * Create router and scan for routes
 * @param srcDir - Source directory
 * @returns Promise resolving to router with routes
 */
export async function createRouter(srcDir: string = "docs"): Promise<Router> {
  const router = new Router(srcDir);
  const files = await router.scan();
  router.generateRoutes(files);
  return router;
}
