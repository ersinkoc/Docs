/**
 * @oxog/docs-core - Build Orchestration
 * Handles production build process
 */

import { join, dirname, relative } from "node:path";
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  copyFileSync,
  rmSync,
  readFileSync,
} from "node:fs";
import type {
  DocsConfig,
  ContentFile,
  BuildManifest,
  PageInfo,
  AssetInfo,
  RenderContent,
  Route,
  MarkdownAST,
} from "./types";
import { Kernel } from "./kernel";
import { Router } from "./router";

/**
 * Builder class for production builds
 */
export class Builder {
  /** Configuration */
  private config: DocsConfig;

  /** Kernel instance */
  private kernel: Kernel;

  /** Router instance */
  private router: Router;

  /** Build start time */
  private startTime: number;

  /**
   * Create builder instance
   * @param config - Resolved configuration
   * @param kernel - Kernel instance
   */
  constructor(config: DocsConfig, kernel: Kernel) {
    this.config = config;
    this.kernel = kernel;
    this.router = new Router(config.srcDir);
    this.startTime = Date.now();
  }

  /**
   * Execute production build
   * @returns Build manifest
   */
  async build(): Promise<BuildManifest> {
    return this.kernel.runWithErrorBoundaryAsync(async () => {
      // Emit build start event
      await this.kernel.emit("onBuildStart");

      // Clean output directory
      this.cleanOutput();

      // Scan for content files
      const files = await this.scanContent();

      // Process content through plugins
      const processedFiles = await this.processContent(files);

      // Generate routes
      const routes = this.router.generateRoutes(processedFiles);

      // Build pages
      const pages = await this.buildPages(routes);

      // Copy assets
      const assets = await this.copyAssets();

      // Create manifest
      const manifest: BuildManifest = {
        pages,
        assets,
        buildTime: Date.now() - this.startTime,
      };

      // Emit build end event
      await this.kernel.emit("onBuildEnd", manifest);

      return manifest;
    });
  }

  /**
   * Clean output directory
   */
  private cleanOutput(): void {
    const outDir = join(process.cwd(), this.config.outDir ?? "dist");

    if (existsSync(outDir)) {
      rmSync(outDir, { recursive: true, force: true });
    }

    mkdirSync(outDir, { recursive: true });
  }

  /**
   * Scan for content files
   * @returns Array of content files
   */
  private async scanContent(): Promise<ContentFile[]> {
    const srcDir = join(process.cwd(), this.config.srcDir ?? "docs");

    if (!existsSync(srcDir)) {
      throw new Error(`Source directory not found: ${srcDir}`);
    }

    const files = await this.router.scan(srcDir);

    // Emit content load event
    const processedFiles = await this.kernel.emit("onContentLoad", files);
    return processedFiles ?? files;
  }

  /**
   * Process content through plugins
   * @param files - Content files
   * @returns Processed content files
   */
  private async processContent(files: ContentFile[]): Promise<ContentFile[]> {
    return files;
  }

  /**
   * Build all pages
   * @param routes - Routes to build
   * @returns Array of page info
   */
  private async buildPages(routes: Route[]): Promise<PageInfo[]> {
    const pages: PageInfo[] = [];
    const adapter = this.config.adapter;
    const renderer = adapter.createRenderer({
      config: this.config,
      theme: this.config.theme,
    });

    for (const route of routes) {
      const page = await this.buildPage(route, renderer);
      pages.push(page);
    }

    return pages;
  }

  /**
   * Build a single page
   * @param route - Route to build
   * @param renderer - Renderer instance
   * @returns Page info
   */
  private async buildPage(
    route: Route,
    renderer: { render(content: RenderContent): string | Promise<string> },
  ): Promise<PageInfo> {
    const filePath = route.filePath ?? "";

    // Read file content
    const content = readFileSync(filePath, "utf-8");

    // Parse frontmatter and markdown
    const { metadata, content: markdownContent } =
      this.parseFrontmatter(content);

    // Parse markdown to AST (would use @oxog/markdown here)
    const ast = await this.parseMarkdown(markdownContent);

    // Emit markdown parse event
    const processedAst = await this.kernel.emit(
      "onMarkdownParse",
      ast as MarkdownAST,
      {
        path: filePath,
        relativePath: relative(this.config.srcDir ?? "docs", filePath),
        url: route.path,
        frontmatter: metadata,
        content: markdownContent,
        ast: ast as MarkdownAST,
      },
    );

    // Render AST to HTML (would use @oxog/markdown here)
    const html = await this.renderMarkdown(processedAst ?? ast);

    // Emit HTML render event
    const processedHtml = await this.kernel.emit("onHtmlRender", html, {
      path: filePath,
      relativePath: relative(this.config.srcDir ?? "docs", filePath),
      url: route.path,
      frontmatter: metadata,
      content: markdownContent,
      ast: processedAst ?? ast,
      html,
    });

    // Apply adapter
    const renderContent: RenderContent = {
      frontmatter: { ...metadata, ...route.frontmatter },
      html: processedHtml ?? html,
      toc: [],
      data: {},
    };

    const rendered = await renderer.render(renderContent);

    // Write output file
    const outputPath = this.writePage(route.path, rendered);

    return {
      url: route.path,
      filePath,
      outputPath,
      frontmatter: { ...metadata, ...route.frontmatter },
    };
  }

  /**
   * Parse frontmatter from content
   * @param content - Full file content
   * @returns Metadata and markdown content
   */
  private parseFrontmatter(content: string): {
    metadata: Record<string, unknown>;
    content: string;
  } {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!match) {
      return { metadata: {}, content };
    }

    const [, frontmatterYaml, markdownContent] = match;
    const metadata = this.parseFrontmatterValue(frontmatterYaml?.trim() ?? "");

    return { metadata, content: markdownContent ?? "" };
  }

  /**
   * Parse frontmatter YAML
   * @param yaml - YAML string
   * @returns Parsed metadata
   */
  private parseFrontmatterValue(yaml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = yaml.split("\n");

    for (const line of lines) {
      const keyValue = line.match(/^(\s*)([^:]+):\s*(.*)$/);
      if (keyValue) {
        const [, indent, key, value] = keyValue;
        if (key && value !== undefined) {
          result[key.trim()] = this.parseFrontmatterString(value.trim());
        }
      }
    }

    return result;
  }

  /**
   * Parse frontmatter string value
   * @param value - Value string
   * @returns Parsed value
   */
  private parseFrontmatterString(value: string): unknown {
    if (!value) return undefined;

    // Boolean
    if (value === "true") return true;
    if (value === "false") return false;

    // Null
    if (value === "null" || value === "~") return null;

    // Number
    if (!isNaN(Number(value))) return Number(value);

    // String (unquoted or quoted)
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }

    return value;
  }

  /**
   * Parse markdown to AST (placeholder for @oxog/markdown)
   * @param content - Markdown content
   * @returns AST
   */
  private async parseMarkdown(content: string): Promise<MarkdownAST> {
    // Placeholder - would use @oxog/markdown
    return {
      type: "root",
      children: [
        {
          type: "html",
          value: `<div class="markdown-content">${this.escapeHtml(content)}</div>`,
        },
      ],
    };
  }

  /**
   * Render AST to HTML (placeholder for @oxog/markdown)
   * @param ast - AST
   * @returns HTML string
   */
  private async renderMarkdown(ast: unknown): Promise<string> {
    // Placeholder - would use @oxog/markdown
    if (typeof ast === "object" && ast !== null) {
      const astObj = ast as Record<string, unknown>;
      if (astObj.type === "root" && astObj.children) {
        const children = astObj.children as Record<string, unknown>[];
        const htmlChild = children.find(
          (c) => (c as Record<string, unknown>).type === "html",
        );
        if (
          htmlChild &&
          typeof (htmlChild as Record<string, unknown>).value === "string"
        ) {
          return (htmlChild as Record<string, unknown>).value as string;
        }
      }
    }
    return "";
  }

  /**
   * Escape HTML characters
   * @param str - String to escape
   * @returns Escaped string
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Write page to output directory
   * @param url - URL path
   * @param content - HTML content
   * @returns Output file path
   */
  private writePage(url: string, content: string): string {
    const outDir = join(process.cwd(), this.config.outDir ?? "dist");

    // Normalize URL to file path
    let filename = url === "/" ? "index.html" : url;
    if (filename.endsWith("/")) {
      filename = filename + "index.html";
    } else if (!filename.endsWith(".html")) {
      filename = filename + ".html";
    }

    const outputPath = join(outDir, filename.slice(1));
    const dir = dirname(outputPath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(outputPath, content, "utf-8");

    return outputPath;
  }

  /**
   * Copy static assets
   * @returns Array of asset info
   */
  private async copyAssets(): Promise<AssetInfo[]> {
    const assets: AssetInfo[] = [];
    const srcDir = join(process.cwd(), this.config.srcDir ?? "docs");
    const outDir = join(process.cwd(), this.config.outDir ?? "dist");

    // Check for assets directory
    const assetsDir = join(srcDir, "assets");

    if (!existsSync(assetsDir)) {
      return assets;
    }

    // Copy assets directory
    const copyResult = this.copyDirectory(assetsDir, outDir);

    for (const { src, dest } of copyResult) {
      assets.push({
        src: relative(process.cwd(), src),
        dest: relative(process.cwd(), dest),
        type: "copy",
      });
    }

    return assets;
  }

  /**
   * Copy directory recursively
   * @param src - Source directory
   * @param dest - Destination directory
   * @returns Array of copied files
   */
  private copyDirectory(
    src: string,
    dest: string,
  ): { src: string; dest: string }[] {
    const results: { src: string; dest: string }[] = [];

    if (!existsSync(src)) {
      return results;
    }

    const {
      readdirSync,
      lstatSync,
      mkdirSync,
      copyFileSync,
    } = require("node:fs");
    const items = readdirSync(src);

    mkdirSync(dest, { recursive: true });

    for (const item of items) {
      const itemPath = join(src, item);
      const destPath = join(dest, item);

      if (lstatSync(itemPath).isDirectory()) {
        results.push(...this.copyDirectory(itemPath, destPath));
      } else {
        copyFileSync(itemPath, destPath);
        results.push({ src: itemPath, dest: destPath });
      }
    }

    return results;
  }

  /**
   * Get build time
   * @returns Build time in milliseconds
   */
  getBuildTime(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Create builder and execute build
 * @param config - Configuration
 * @param kernel - Kernel instance
 * @returns Build manifest
 */
export async function build(
  config: DocsConfig,
  kernel: Kernel,
): Promise<BuildManifest> {
  const builder = new Builder(config, kernel);
  return builder.build();
}
