/**
 * @oxog/docs-theme-default - Layout Component
 */

import type { ThemeConfig } from "@oxog/docs-core";
import { Header } from "./Header.js";
import { Sidebar } from "./Sidebar.js";
import { Footer } from "./Footer.js";
import { TOC } from "./TOC.js";

export interface LayoutProps {
  /** Page frontmatter */
  frontmatter: Record<string, unknown>;

  /** Main content HTML */
  content: string;

  /** Table of contents */
  toc?: Array<{
    text: string;
    slug: string;
    level: number;
    children?: Array<{ text: string; slug: string }>;
  }>;

  /** Theme configuration */
  config: ThemeConfig;

  /** Current pathname */
  pathname?: string;
}

export function Layout(props: LayoutProps): string {
  const { frontmatter, content, toc, config, pathname } = props;
  const title = String(frontmatter.title ?? "Documentation");
  const sidebar = config.sidebar ?? {};
  const nav = config.nav ?? [];
  const footer = config.footer ?? {};
  const logo = config.logo;

  return `
<!DOCTYPE html>
<html lang="en" data-color-scheme="${(config as Record<string, unknown>).colorScheme ?? "light"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(String(frontmatter.description ?? ""))}">
  ${logo ? `<link rel="icon" href="${logo}" type="image/svg+xml">` : ""}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${renderStyles(config)}
</head>
<body>
  <div class="theme-container">
    ${Header({ nav, logo, pathname })}
    <div class="theme-main">
      ${Sidebar({ sidebar, pathname })}
      <main class="theme-content">
        <article class="theme-article">
          <h1 class="article-title">${escapeHtml(title)}</h1>
          <div class="theme-body">${content}</div>
          ${TOC({ toc })}
        </article>
      </main>
    </div>
    ${Footer({ footer, social: config.social })}
  </div>
  ${renderScripts()}
</body>
</html>`;
}

function renderStyles(config: ThemeConfig): string {
  const primaryColor =
    ((config as Record<string, unknown>).primaryColor as string) ?? "#0066cc";
  const fontSans =
    ((config as Record<string, unknown>).fontFamily as { sans?: string }) ?? {};
  const fontMono =
    ((config as Record<string, unknown>).fontFamily as { mono?: string }) ?? {};

  return `
<style>
  :root {
    --color-primary: ${primaryColor};
    --color-bg: #ffffff;
    --color-bg-alt: #f8f9fa;
    --color-text: #1a1a1a;
    --color-text-muted: #666666;
    --color-border: #e5e5e5;
    --color-code-bg: #f6f8fa;
    --font-sans: ${fontSans.sans ?? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
    --font-mono: ${fontMono.mono ?? '"SF Mono", "Fira Code", Menlo, monospace'};
    --header-height: 64px;
    --sidebar-width: 280px;
  }

  [data-color-scheme="dark"] {
    --color-bg: #0d1117;
    --color-bg-alt: #161b22;
    --color-text: #c9d1d9;
    --color-text-muted: #8b949e;
    --color-border: #30363d;
    --color-code-bg: #161b22;
  }

  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    font-family: var(--font-sans);
    font-size: 16px;
    line-height: 1.6;
    color: var(--color-text);
    background: var(--color-bg);
  }

  .theme-container { display: flex; flex-direction: column; min-height: 100vh; }
  .theme-main { display: flex; flex: 1; }
  .theme-content { flex: 1; padding: 2rem 3rem; max-width: 900px; }
  .theme-article { max-width: 100%; }
  .theme-body { margin-top: 2rem; }

  .header { position: sticky; top: 0; z-index: 100; height: var(--header-height); background: var(--color-bg); border-bottom: 1px solid var(--color-border); }
  .header-inner { display: flex; align-items: center; justify-content: space-between; height: 100%; max-width: 1400px; margin: 0 auto; padding: 0 1.5rem; }
  .header-logo img { height: 32px; }
  .header-nav { display: flex; gap: 2rem; }
  .header-link { color: var(--color-text); text-decoration: none; font-weight: 500; transition: color 0.2s; }
  .header-link:hover, .header-link.active { color: var(--color-primary); }
  .header-actions { display: flex; gap: 1rem; }
  .header-search, .header-theme-toggle { background: none; border: none; cursor: pointer; padding: 0.5rem; color: var(--color-text); border-radius: 8px; }
  [data-color-scheme="dark"] .sun-icon { display: none; }
  [data-color-scheme="light"] .moon-icon { display: none; }

  .sidebar { width: var(--sidebar-width); padding: 2rem 1.5rem; border-right: 1px solid var(--color-border); background: var(--color-bg-alt); position: sticky; top: var(--header-height); height: calc(100vh - var(--header-height)); overflow-y: auto; }
  .sidebar-section { margin-bottom: 1.5rem; }
  .sidebar-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin: 0 0 0.75rem; font-weight: 600; }
  .sidebar-list { display: flex; flex-direction: column; gap: 0.25rem; }
  .sidebar-link { display: block; padding: 0.5rem 0.75rem; color: var(--color-text); text-decoration: none; font-size: 0.9rem; border-radius: 8px; }
  .sidebar-link:hover { background: var(--color-bg); }
  .sidebar-link.active { color: var(--color-primary); background: var(--color-bg); font-weight: 500; }

  .article-title { font-size: 2.5rem; font-weight: 700; margin: 0 0 1rem; line-height: 1.2; }

  h1, h2, h3, h4, h5, h6 { margin: 2rem 0 1rem; font-weight: 600; line-height: 1.3; color: var(--color-text); }
  h1 { font-size: 2.25rem; margin-top: 0; }
  h2 { font-size: 1.75rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; }
  h3 { font-size: 1.5rem; }
  p { margin: 1rem 0; }
  a { color: var(--color-primary); text-decoration: none; }
  a:hover { text-decoration: underline; }

  code { font-family: var(--font-mono); font-size: 0.9em; background: var(--color-code-bg); padding: 0.2rem 0.4rem; border-radius: 4px; }
  pre { margin: 1.5rem 0; padding: 1.25rem; background: var(--color-code-bg); border-radius: 12px; overflow-x: auto; }
  pre code { background: none; padding: 0; font-size: 0.875rem; }

  ul, ol { padding-left: 1.5rem; }
  li { margin: 0.5rem 0; }

  table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
  th, td { padding: 0.75rem 1rem; border: 1px solid var(--color-border); text-align: left; }
  th { background: var(--color-bg-alt); font-weight: 600; }

  .toc { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border); }
  .toc-title { font-size: 0.875rem; font-weight: 600; margin: 0 0 1rem; color: var(--color-text-muted); }
  .toc-list { list-style: none; padding: 0; margin: 0; }
  .toc-item { margin: 0.5rem 0; }
  .toc-link { color: var(--color-text-muted); font-size: 0.875rem; text-decoration: none; }
  .toc-link:hover { color: var(--color-primary); }

  .footer { border-top: 1px solid var(--color-border); padding: 2rem; background: var(--color-bg-alt); margin-top: 3rem; }
  .footer-inner { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center; }
  .footer-message { color: var(--color-text-muted); margin: 0; }
  .footer-links { display: flex; gap: 1.5rem; }
  .footer-links a { color: var(--color-text-muted); font-size: 0.9rem; }
  .footer-links a:hover { color: var(--color-primary); }
  .footer-social { display: flex; gap: 1rem; }
  .footer-social a { color: var(--color-text-muted); }

  @media (max-width: 1024px) {
    .sidebar { display: none; }
    .theme-content { padding: 1.5rem; }
  }
</style>`;
}

function renderScripts(): string {
  return `
<script>
  (function() {
    const toggle = document.querySelector('.header-theme-toggle');
    const html = document.documentElement;
    toggle?.addEventListener('click', () => {
      const current = html.getAttribute('data-color-scheme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-color-scheme', next);
      localStorage.setItem('color-scheme', next);
    });
    const saved = localStorage.getItem('color-scheme');
    if (saved) { html.setAttribute('data-color-scheme', saved); }
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) { html.setAttribute('data-color-scheme', 'dark'); }
  })();
</script>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
