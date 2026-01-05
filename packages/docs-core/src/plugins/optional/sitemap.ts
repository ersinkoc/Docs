/**
 * @oxog/docs-core - Sitemap Plugin
 * sitemap.xml generation
 */

import { join } from "node:path";
import { writeFileSync } from "node:fs";
import type { DocsPlugin, BuildManifest } from "../../types.js";

/**
 * Sitemap plugin options
 */
export interface SitemapOptions {
  /** Site hostname (required) */
  hostname: string;

  /** Base URL */
  baseUrl?: string;

  /** Change frequency for pages */
  changeFreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";

  /** Page priority (0.0 - 1.0) */
  priority?: number;

  /** Last modification date */
  lastmod?: string;

  /** Exclude patterns */
  exclude?: string[];

  /** Additional URLs to include */
  extraUrls?: SitemapUrl[];
}

/**
 * Sitemap URL entry
 */
export interface SitemapUrl {
  /** URL path */
  loc: string;

  /** Change frequency */
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";

  /** Priority (0.0 - 1.0) */
  priority?: number;

  /** Last modification date */
  lastmod?: string;
}

/**
 * Create sitemap plugin
 * @param options - Sitemap options
 * @returns Sitemap plugin
 */
export function createSitemapPlugin(options: SitemapOptions): DocsPlugin {
  const {
    hostname,
    baseUrl = "",
    changeFreq = "weekly",
    priority = 0.5,
    lastmod = new Date().toISOString().split("T")[0],
    exclude = [],
    extraUrls = [],
  } = options;

  return {
    name: "sitemap",
    version: "1.0.0",

    onBuildEnd: async (manifest: BuildManifest) => {
      const urls: SitemapUrl[] = [];

      // Add pages from manifest
      for (const page of manifest.pages) {
        // Check exclusion
        if (shouldExclude(page.url, exclude)) {
          continue;
        }

        urls.push({
          loc: normalizeUrl(hostname, baseUrl, page.url),
          changefreq: changeFreq,
          priority: page.url === "/" ? 1.0 : priority,
          lastmod: lastmod,
        });
      }

      // Add extra URLs
      urls.push(
        ...extraUrls.map((url) => ({
          ...url,
          loc: normalizeUrl(hostname, baseUrl, url.loc),
        })),
      );

      // Generate sitemap XML
      const xml = generateSitemapXml(urls);

      // Write to file
      const outDir = process.cwd();
      writeFileSync(join(outDir, "dist", "sitemap.xml"), xml, "utf-8");

      console.log("sitemap.xml generated");
    },
  };
}

/**
 * Check if URL should be excluded
 * @param url - URL to check
 * @param patterns - Exclude patterns
 * @returns True if should exclude
 */
function shouldExclude(url: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (url.match(new RegExp(pattern))) {
      return true;
    }
  }
  return false;
}

/**
 * Normalize URL
 * @param hostname - Site hostname
 * @param baseUrl - Base URL prefix
 * @param path - URL path
 * @returns Full URL
 */
function normalizeUrl(hostname: string, baseUrl: string, path: string): string {
  // Ensure hostname has protocol
  const base = hostname.startsWith("http") ? hostname : `https://${hostname}`;

  // Normalize path
  let normalizedPath = path;
  if (baseUrl && !normalizedPath.startsWith(baseUrl)) {
    normalizedPath = baseUrl + normalizedPath;
  }

  // Remove trailing slash for consistency
  if (normalizedPath.endsWith("/") && normalizedPath !== "/") {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  return `${base}${normalizedPath}`;
}

/**
 * Generate sitemap XML
 * @param urls - URL entries
 * @returns XML string
 */
function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlElements = urls.map((url) => {
    return `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ""}
    ${url.priority !== undefined ? `<priority>${url.priority.toFixed(1)}</priority>` : ""}
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements.join("\n")}
</urlset>`;
}

/**
 * Escape XML special characters
 * @param str - String to escape
 * @returns Escaped string
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Export plugin instance and factory
export const sitemapPlugin = createSitemapPlugin({ hostname: "" });
export function sitemap(options: SitemapOptions): DocsPlugin {
  return createSitemapPlugin(options);
}
