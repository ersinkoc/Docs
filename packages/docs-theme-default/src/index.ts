/**
 * @oxog/docs-theme-default - Default Theme Factory
 * Beautiful default theme for documentation sites
 */

import type { ThemeConfig } from "@oxog/docs-core";

// Extended theme configuration with styling options
export interface ExtendedThemeConfig extends ThemeConfig {
  /** Color scheme: 'light' | 'dark' */
  colorScheme?: "light" | "dark";

  /** Primary accent color */
  primaryColor?: string;

  /** Font family configuration */
  fontFamily?: {
    sans?: string;
    mono?: string;
  };

  /** Code theme for syntax highlighting */
  codeTheme?: string;
}

// Re-export components (for framework adapters)
export * from "./components/index.js";

// Re-export styles
export * from "./styles/index.js";

/**
 * Theme component types (placeholders for framework components)
 */
export interface ThemeComponents {
  Header?: unknown;
  Sidebar?: unknown;
  Footer?: unknown;
  TOC?: unknown;
  Search?: unknown;
  CodeBlock?: unknown;
}

/**
 * Theme interface
 */
export interface DefaultTheme {
  name: string;
  Layout: unknown;
  components: ThemeComponents;
  styles: string;
  assets: string[];
}

/**
 * Default theme configuration values
 */
const DEFAULT_CONFIG: Required<ExtendedThemeConfig> = {
  logo: "",
  nav: [],
  sidebar: {},
  footer: {
    message: "Released under MIT License",
    links: [],
  },
  social: {},
  cssVars: {},
  colorScheme: "light",
  primaryColor: "#0066cc",
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", "Fira Code", "Fira Mono", Menlo, monospace',
  },
  codeTheme: "github-dark",
};

/**
 * Create the default theme
 * @param options - Theme options
 * @returns Theme instance
 */
export function createDefaultTheme(
  _options: { config?: ExtendedThemeConfig } = {},
): DefaultTheme {
  const config = { ...DEFAULT_CONFIG };

  return {
    name: "default",
    Layout: DefaultLayout,
    components: {
      Header,
      Sidebar,
      Footer,
      TOC,
      Search,
      CodeBlock,
    },
    styles: getThemeStyles(config),
    assets: [],
  };
}

/**
 * Default layout component
 */
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
  config: ExtendedThemeConfig;

  /** Current path for active states */
  pathname?: string;
}

/**
 * Default Layout Component (returns HTML string for SSR)
 */
export function DefaultLayout(props: LayoutProps): string {
  const { frontmatter, content, toc, config, pathname } = props;
  const title = String(frontmatter.title ?? "Documentation");
  const sidebar = config.sidebar ?? {};
  const nav = config.nav ?? [];
  const footer = config.footer ?? {};
  const logo = config.logo;
  const colorScheme = config.colorScheme ?? "light";

  return `
<!DOCTYPE html>
<html lang="en" data-color-scheme="${colorScheme}">
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
          ${Title({ title })}
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

/**
 * Header Component
 */
function Header(props: {
  nav: Array<{ text: string; link: string }>;
  logo?: string;
  pathname?: string;
}): string {
  const navLinks = props.nav
    .map(
      (item) =>
        `<a href="${item.link}" class="header-link ${props.pathname === item.link ? "active" : ""}">${escapeHtml(item.text)}</a>`,
    )
    .join("");

  return `
<header class="header">
  <div class="header-inner">
    ${props.logo ? `<a href="/" class="header-logo"><img src="${props.logo}" alt="Logo"></a>` : ""}
    <nav class="header-nav">${navLinks}</nav>
    <div class="header-actions">
      <button class="header-search" aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
      <button class="header-theme-toggle" aria-label="Toggle theme">
        <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </div>
  </div>
</header>`;
}

/**
 * Sidebar Component
 */
function Sidebar(props: {
  sidebar: Record<
    string,
    Array<{ text: string; items: Array<{ text: string; link: string }> }>
  >;
  pathname?: string;
}): string {
  let sidebarContent = "";

  for (const [basePath, sections] of Object.entries(props.sidebar)) {
    for (const section of sections) {
      const items = section.items
        .map(
          (item) =>
            `<a href="${item.link}" class="sidebar-link ${props.pathname === item.link ? "active" : ""}">${escapeHtml(item.text)}</a>`,
        )
        .join("");

      sidebarContent += `
      <div class="sidebar-section">
        <h3 class="sidebar-title">${escapeHtml(section.text)}</h3>
        <div class="sidebar-list">${items}</div>
      </div>`;
    }
  }

  if (!sidebarContent) {
    return '<aside class="sidebar"></aside>';
  }

  return `<aside class="sidebar">${sidebarContent}</aside>`;
}

/**
 * Title Component
 */
function Title(props: { title: string }): string {
  return `<h1 class="article-title">${escapeHtml(props.title)}</h1>`;
}

/**
 * TOC Component
 */
function TOC(props: {
  toc?: Array<{
    text: string;
    slug: string;
    level: number;
    children?: Array<{ text: string; slug: string }>;
  }>;
}): string {
  if (!props.toc || props.toc.length === 0) {
    return "";
  }

  const items = props.toc
    .map(
      (item) =>
        `<li class="toc-item toc-level-${item.level}">
          <a href="#${item.slug}" class="toc-link">${escapeHtml(item.text)}</a>
          ${item.children ? `<ul>${item.children.map((c) => `<li><a href="#${c.slug}">${escapeHtml(c.text)}</a></li>`).join("")}</ul>` : ""}
        </li>`,
    )
    .join("");

  return `
<nav class="toc">
  <h2 class="toc-title">On this page</h2>
  <ul class="toc-list">${items}</ul>
</nav>`;
}

/**
 * Footer Component
 */
function Footer(props: {
  footer: { message?: string; links?: Array<{ text: string; url: string }> };
  social?: { github?: string; twitter?: string; discord?: string };
}): string {
  const socialLinks = [];

  if (props.social?.github) {
    socialLinks.push(`<a href="${props.social.github}" target="_blank" rel="noopener" aria-label="GitHub">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    </a>`);
  }

  return `
<footer class="footer">
  <div class="footer-inner">
    ${props.footer.message ? `<p class="footer-message">${escapeHtml(props.footer.message)}</p>` : ""}
    <div class="footer-links">
      ${props.footer.links?.map((link) => `<a href="${link.url}">${escapeHtml(link.text)}</a>`).join("") ?? ""}
    </div>
    <div class="footer-social">${socialLinks.join("")}</div>
  </div>
</footer>`;
}

/**
 * Search Component (placeholder)
 */
function Search(): string {
  return "";
}

/**
 * CodeBlock Component (placeholder)
 */
function CodeBlock(_props: { code: string; language?: string }): string {
  return "";
}

/**
 * Get theme styles
 */
function renderStyles(config: ExtendedThemeConfig): string {
  const primaryColor = config.primaryColor ?? "#0066cc";
  const fontSans =
    config.fontFamily?.sans ??
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const fontMono =
    config.fontFamily?.mono ??
    '"SF Mono", "Fira Code", "Fira Mono", Menlo, monospace';

  return `
<style>
  /* CSS Variables */
  :root {
    --color-primary: ${primaryColor};
    --color-bg: #ffffff;
    --color-bg-alt: #f8f9fa;
    --color-text: #1a1a1a;
    --color-text-muted: #666666;
    --color-border: #e5e5e5;
    --color-code-bg: #f6f8fa;
    --color-accent: ${primaryColor};

    --font-sans: ${fontSans};
    --font-mono: ${fontMono};

    --header-height: 64px;
    --sidebar-width: 280px;
    --toc-width: 200px;

    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  }

  /* Dark mode */
  [data-color-scheme="dark"] {
    --color-bg: #0d1117;
    --color-bg-alt: #161b22;
    --color-text: #c9d1d9;
    --color-text-muted: #8b949e;
    --color-border: #30363d;
    --color-code-bg: #161b22;
  }

  /* Reset */
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    font-family: var(--font-sans);
    font-size: 16px;
    line-height: 1.6;
    color: var(--color-text);
    background: var(--color-bg);
    -webkit-font-smoothing: antialiased;
  }

  /* Layout */
  .theme-container { display: flex; flex-direction: column; min-height: 100vh; }
  .theme-main { display: flex; flex: 1; }
  .theme-content { flex: 1; padding: 2rem 3rem; max-width: 900px; }
  .theme-article { max-width: 100%; }
  .theme-body { margin-top: 2rem; }

  /* Header */
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    height: var(--header-height);
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
  }
  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  .header-logo img { height: 32px; }
  .header-nav { display: flex; gap: 2rem; }
  .header-link {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    transition: color 0.2s;
  }
  .header-link:hover, .header-link.active { color: var(--color-primary); }
  .header-actions { display: flex; gap: 1rem; align-items: center; }
  .header-search, .header-theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: var(--color-text);
    border-radius: var(--radius-md);
    transition: background 0.2s;
  }
  .header-search:hover, .header-theme-toggle:hover { background: var(--color-bg-alt); }
  [data-color-scheme="dark"] .sun-icon { display: none; }
  [data-color-scheme="light"] .moon-icon { display: none; }

  /* Sidebar */
  .sidebar {
    width: var(--sidebar-width);
    padding: 2rem 1.5rem;
    border-right: 1px solid var(--color-border);
    background: var(--color-bg-alt);
    position: sticky;
    top: var(--header-height);
    height: calc(100vh - var(--header-height));
    overflow-y: auto;
    flex-shrink: 0;
  }
  .sidebar-section { margin-bottom: 1.5rem; }
  .sidebar-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    margin: 0 0 0.75rem;
    font-weight: 600;
  }
  .sidebar-list { display: flex; flex-direction: column; gap: 0.25rem; }
  .sidebar-link {
    display: block;
    padding: 0.5rem 0.75rem;
    color: var(--color-text);
    text-decoration: none;
    font-size: 0.9rem;
    border-radius: var(--radius-md);
    transition: all 0.2s;
  }
  .sidebar-link:hover { background: var(--color-bg); }
  .sidebar-link.active {
    color: var(--color-primary);
    background: var(--color-bg);
    font-weight: 500;
  }

  /* Article */
  .article-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 1rem;
    line-height: 1.2;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    margin: 2rem 0 1rem;
    font-weight: 600;
    line-height: 1.3;
    color: var(--color-text);
  }
  h1 { font-size: 2.25rem; margin-top: 0; }
  h2 { font-size: 1.75rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; }
  h3 { font-size: 1.5rem; }
  h4 { font-size: 1.25rem; }
  p { margin: 1rem 0; }
  a { color: var(--color-primary); text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Code */
  code {
    font-family: var(--font-mono);
    font-size: 0.9em;
    background: var(--color-code-bg);
    padding: 0.2rem 0.4rem;
    border-radius: var(--radius-sm);
  }
  pre {
    margin: 1.5rem 0;
    padding: 1.25rem;
    background: var(--color-code-bg);
    border-radius: var(--radius-lg);
    overflow-x: auto;
  }
  pre code {
    background: none;
    padding: 0;
    font-size: 0.875rem;
    line-height: 1.7;
  }

  /* Lists */
  ul, ol { padding-left: 1.5rem; }
  li { margin: 0.5rem 0; }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.95rem;
  }
  th, td {
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border);
    text-align: left;
  }
  th { background: var(--color-bg-alt); font-weight: 600; }
  tr:nth-child(even) { background: var(--color-bg-alt); }

  /* Blockquotes */
  blockquote {
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;
    border-left: 4px solid var(--color-primary);
    background: var(--color-bg-alt);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }

  /* Images */
  img { max-width: 100%; height: auto; border-radius: var(--radius-md); }

  /* HR */
  hr {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 2rem 0;
  }

  /* TOC */
  .toc {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }
  .toc-title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 1rem;
    color: var(--color-text-muted);
  }
  .toc-list { list-style: none; padding: 0; margin: 0; }
  .toc-item { margin: 0.5rem 0; }
  .toc-link {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    text-decoration: none;
    transition: color 0.2s;
  }
  .toc-link:hover { color: var(--color-primary); }

  /* Footer */
  .footer {
    border-top: 1px solid var(--color-border);
    padding: 2rem;
    background: var(--color-bg-alt);
    margin-top: 3rem;
  }
  .footer-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
  }
  .footer-message { color: var(--color-text-muted); margin: 0; }
  .footer-links { display: flex; gap: 1.5rem; }
  .footer-links a { color: var(--color-text-muted); font-size: 0.9rem; }
  .footer-links a:hover { color: var(--color-primary); }
  .footer-social { display: flex; gap: 1rem; }
  .footer-social a { color: var(--color-text-muted); transition: color 0.2s; }
  .footer-social a:hover { color: var(--color-primary); }

  /* Responsive */
  @media (max-width: 1024px) {
    .sidebar { display: none; }
    .theme-content { padding: 1.5rem; }
  }

  @media (max-width: 640px) {
    .header-nav { display: none; }
    .article-title { font-size: 1.75rem; }
    h1 { font-size: 1.75rem; }
    h2 { font-size: 1.5rem; }
  }
</style>`;
}

/**
 * Render scripts
 */
function renderScripts(): string {
  return `
<script>
  // Theme toggle
  (function() {
    const toggle = document.querySelector('.header-theme-toggle');
    const html = document.documentElement;

    toggle?.addEventListener('click', () => {
      const current = html.getAttribute('data-color-scheme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-color-scheme', next);
      localStorage.setItem('color-scheme', next);
    });

    // Restore preference
    const saved = localStorage.getItem('color-scheme');
    if (saved) {
      html.setAttribute('data-color-scheme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.setAttribute('data-color-scheme', 'dark');
    }
  })();

  // Mobile sidebar toggle
  (function() {
    // Mobile menu functionality would be added here
  })();
</script>`;
}

/**
 * Escape HTML
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Get theme styles (for external use)
 */
export function getThemeStyles(config: ExtendedThemeConfig): string {
  return renderStyles(config);
}

// Export default theme instance
export const defaultTheme = createDefaultTheme();
