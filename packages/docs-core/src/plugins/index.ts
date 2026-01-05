/**
 * @oxog/docs-core - Plugin Exports
 * Re-exports all core and optional plugins
 */

// Core plugins
export { markdownPlugin } from "./core/markdown.js";
export { frontmatterPlugin } from "./core/frontmatter.js";
export { routingPlugin } from "./core/routing.js";
export { assetsPlugin } from "./core/assets.js";
export { codeshinePlugin } from "./core/codeshine.js";

// Optional plugins
export { searchPlugin, search } from "./optional/search.js";
export { sitemapPlugin, sitemap } from "./optional/sitemap.js";
export { rssPlugin, rss } from "./optional/rss.js";
export { i18nPlugin, i18n } from "./optional/i18n.js";
export { analyticsPlugin, analytics } from "./optional/analytics.js";
export { mermaidPlugin, mermaid } from "./optional/mermaid.js";
export { tocPlugin, toc } from "./optional/toc.js";
