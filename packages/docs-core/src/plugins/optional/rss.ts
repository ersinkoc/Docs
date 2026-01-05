/**
 * @oxog/docs-core - RSS Plugin
 * RSS feed generation
 */

import { join } from "node:path";
import { writeFileSync } from "node:fs";
import type { DocsPlugin, BuildManifest } from "../../types.js";

/**
 * RSS plugin options
 */
export interface RSSOptions {
  /** Feed title */
  title: string;

  /** Feed description */
  description: string;

  /** Site URL */
  siteUrl: string;

  /** Feed URL (defaults to /rss.xml) */
  feedUrl?: string;

  /** Author email */
  author?: string;

  /** Author name */
  authorName?: string;

  /** Feed language (default: en) */
  language?: string;

  /** Feed copyright */
  copyright?: string;

  /** Maximum number of items */
  maxItems?: number;

  /** Categories to include */
  categories?: string[];

  /** Image URL for feed */
  imageUrl?: string;
}

/**
 * Create RSS plugin
 * @param options - RSS options
 * @returns RSS plugin
 */
export function createRSSPlugin(options: RSSOptions): DocsPlugin {
  const {
    title,
    description,
    siteUrl,
    feedUrl = "/rss.xml",
    author,
    authorName,
    language = "en",
    copyright,
    maxItems = 50,
    categories = [],
    imageUrl,
  } = options;

  return {
    name: "rss",
    version: "1.0.0",

    onBuildEnd: async (manifest: BuildManifest) => {
      // Get posts/pages with dates
      const items = manifest.pages
        .filter((page) => {
          // Filter for blog posts or dated pages
          const date = page.frontmatter.date as string | undefined;
          return date !== undefined || page.url.includes("/blog/");
        })
        .slice(0, maxItems)
        .map((page) => ({
          title: (page.frontmatter.title as string) ?? "Untitled",
          description: (page.frontmatter.description as string) ?? "",
          link: `${siteUrl}${page.url}`,
          guid: `${siteUrl}${page.url}`,
          pubDate:
            (page.frontmatter.date as string) ?? new Date().toISOString(),
          author: page.frontmatter.author as string | undefined,
          categories: (page.frontmatter.tags as string[]) ?? [],
        }))
        .sort(
          (a, b) =>
            new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
        );

      // Generate RSS XML
      const xml = generateRSSXml({
        title,
        description,
        siteUrl,
        feedUrl: `${siteUrl}${feedUrl}`,
        author,
        authorName,
        language,
        copyright,
        imageUrl,
        items,
      });

      // Write to file
      const outDir = process.cwd();
      writeFileSync(join(outDir, "dist", "rss.xml"), xml, "utf-8");

      console.log("rss.xml generated");
    },
  };
}

/**
 * RSS Feed data
 */
interface RSSFeedData {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  author?: string;
  authorName?: string;
  language: string;
  copyright?: string;
  imageUrl?: string;
  items: RSSItem[];
}

/**
 * RSS item data
 */
interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: string;
  author?: string;
  categories: string[];
}

/**
 * Generate RSS XML
 * @param feed - Feed data
 * @returns XML string
 */
function generateRSSXml(feed: RSSFeedData): string {
  const now = new Date().toUTCString();

  const channel = [
    `<title>${escapeXml(feed.title)}</title>`,
    `<description>${escapeXml(feed.description)}</description>`,
    `<link>${feed.siteUrl}</link>`,
    `<atom:link href="${feed.feedUrl}" rel="self" type="application/rss+xml" />`,
    `<language>${feed.language}</language>`,
    `<lastBuildDate>${now}</lastBuildDate>`,
    `<pubDate>${now}</pubDate>`,
  ];

  if (feed.author) {
    channel.push(`<managingEditor>${feed.author}</managingEditor>`);
  }

  if (feed.authorName) {
    channel.push(`<webMaster>${feed.authorName}</webMaster>`);
  }

  if (feed.copyright) {
    channel.push(`<copyright>${escapeXml(feed.copyright)}</copyright>`);
  }

  if (feed.imageUrl) {
    channel.push(
      `<image>
        <url>${feed.imageUrl}</url>
        <title>${escapeXml(feed.title)}</title>
        <link>${feed.siteUrl}</link>
      </image>`,
    );
  }

  const itemElements = feed.items.map((item) => {
    return `  <item>
    <title>${escapeXml(item.title)}</title>
    <description>${escapeXml(item.description)}</description>
    <link>${item.link}</link>
    <guid isPermaLink="true">${item.guid}</guid>
    <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
    ${item.categories.map((cat) => `<category>${escapeXml(cat)}</category>`).join("\n    ")}
  </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
${channel.join("\n")}
${itemElements.join("\n")}
  </channel>
</rss>`;
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
export const rssPlugin = createRSSPlugin({
  title: "",
  description: "",
  siteUrl: "",
});
export function rss(options: RSSOptions): DocsPlugin {
  return createRSSPlugin(options);
}
