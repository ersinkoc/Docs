/**
 * @oxog/docs-core - Search Plugin
 * Pagefind integration for static search
 */

import { join, relative } from "node:path";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import type { DocsPlugin, BuildManifest, ContentFile } from "../../types.js";

/**
 * Search plugin options
 */
export interface SearchOptions {
  /** Path to pagefind binary */
  binary?: string;

  /** Output directory for search index */
  outputDir?: string;

  /** Whether to minify index */
  minify?: boolean;

  /** Language for tokenization */
  language?: string;
}

/**
 * Create search plugin
 * @param options - Search options
 * @returns Search plugin
 */
export function createSearchPlugin(options: SearchOptions = {}): DocsPlugin {
  const outputDir = options.outputDir ?? "pagefind";
  const binary = options.binary ?? "npx pagefind";

  return {
    name: "search",
    version: "1.0.0",

    onBuildEnd: async (manifest: BuildManifest) => {
      const cwd = process.cwd();
      const distDir = join(cwd, "dist");

      // Create output directory
      const pagefindDir = join(distDir, outputDir);
      if (!existsSync(pagefindDir)) {
        mkdirSync(pagefindDir, { recursive: true });
      }

      // Create placeholder index (in production, would run pagefind)
      const indexContent = createPlaceholderIndex(manifest, options);
      writeFileSync(join(pagefindDir, "index.json"), indexContent, "utf-8");

      console.log(`Search index created at: ${outputDir}`);
    },
  };
}

/**
 * Create placeholder search index
 * @param manifest - Build manifest
 * @param options - Options
 * @returns Index JSON
 */
function createPlaceholderIndex(
  manifest: BuildManifest,
  options: SearchOptions,
): string {
  const pages = manifest.pages.map((page) => ({
    url: page.url,
    title: (page.frontmatter.title as string) ?? getTitleFromUrl(page.url),
    description: (page.frontmatter.description as string) ?? "",
    content: "", // Would be extracted from page content
  }));

  const index = {
    version: "1.0",
    language: options.language ?? "en",
    pages,
    options: {
      minify: options.minify ?? true,
    },
  };

  return JSON.stringify(index, null, 2);
}

/**
 * Get title from URL
 * @param url - URL path
 * @returns Title
 */
function getTitleFromUrl(url: string): string {
  const segments = url.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] || "index";
  return lastSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Export plugin instance and factory
export const searchPlugin = createSearchPlugin();
export function search(options?: SearchOptions): DocsPlugin {
  return createSearchPlugin(options);
}
