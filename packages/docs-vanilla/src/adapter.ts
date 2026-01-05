/**
 * @oxog/docs-vanilla - Adapter
 * Plain HTML/Web Components adapter for documentation rendering
 */

import type {
  Adapter,
  AdapterConfig,
  Renderer,
  RenderContent,
  HydrationProps,
} from "@oxog/docs-core";

/**
 * Vanilla adapter options
 */
export interface VanillaAdapterOptions {
  /** Enable web components (default: true) */
  useWebComponents?: boolean;

  /** Custom CSS to inject */
  customCss?: string;
}

/**
 * Create vanilla adapter
 * @param options - Adapter options
 * @returns Adapter instance
 */
export function createVanillaAdapter(
  options: VanillaAdapterOptions = {},
): Adapter {
  const { useWebComponents = true, customCss } = options;

  return {
    name: "vanilla",

    createRenderer(config: AdapterConfig): Renderer {
      return new VanillaRenderer(config, {
        useWebComponents,
        customCss: customCss ?? "",
      });
    },

    transformHtml(html: string): string {
      // Wrap in layout if using web components
      if (useWebComponents) {
        return `<docs-layout>${html}</docs-layout>`;
      }
      return html;
    },

    hydrate(element: unknown, props: HydrationProps): void {
      // Web Components handle hydration automatically via custom elements
      // For SSR, the component already rendered with proper attributes
      const el = element as unknown as HTMLElement;
      if (useWebComponents && el.querySelector("docs-layout")) {
        const layout = el.querySelector("docs-layout");
        if (layout) {
          (layout as unknown as DocsLayoutElement).props = props;
        }
      }
    },
  };
}

/**
 * Vanilla renderer
 */
class VanillaRenderer implements Renderer {
  /** Adapter configuration */
  private config: AdapterConfig;

  /** Adapter options */
  private options: Required<VanillaAdapterOptions>;

  /**
   * Create renderer
   * @param config - Adapter configuration
   * @param options - Adapter options
   */
  constructor(config: AdapterConfig, options: Required<VanillaAdapterOptions>) {
    this.config = config;
    this.options = options;
  }

  /**
   * Render content to HTML
   */
  render(content: RenderContent): string {
    const { frontmatter, html, toc } = content;

    // Generate TOC HTML
    const tocHtml = this.renderTOC(toc);

    // Generate full HTML document
    const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(String(frontmatter.title ?? "Documentation"))}</title>
  <meta name="description" content="${this.escapeHtml(String(frontmatter.description ?? ""))}">
  ${this.renderStyles()}
  ${this.renderWebComponentStyles()}
</head>
<body>
  ${this.renderLayout(frontmatter, html, tocHtml)}
  ${this.renderScripts()}
</body>
</html>`;

    return doc;
  }

  /**
   * Render layout HTML
   */
  private renderLayout(
    frontmatter: Record<string, unknown>,
    content: string,
    tocHtml: string,
  ): string {
    const theme = this.config.theme;
    const logo = theme?.logo ?? "";
    const nav = theme?.nav ?? [];
    const sidebar = theme?.sidebar;
    const footer = theme?.footer;

    // Render navigation
    const navHtml = this.renderNav(nav);

    // Render sidebar
    const sidebarHtml = this.renderSidebar(sidebar);

    // Render footer
    const footerHtml = this.renderFooter(footer);

    return `
  <div class="docs-container">
    <header class="docs-header">
      ${logo ? `<img src="${logo}" alt="Logo" class="docs-logo">` : ""}
      <nav class="docs-nav">${navHtml}</nav>
    </header>
    <div class="docs-main">
      <aside class="docs-sidebar">${sidebarHtml}</aside>
      <main class="docs-content">
        ${this.options.useWebComponents ? "<docs-content>" : ""}
        ${this.renderArticle(frontmatter, content)}
        ${tocHtml ? `<nav class="docs-toc">${tocHtml}</nav>` : ""}
        ${this.options.useWebComponents ? "</docs-content>" : ""}
      </main>
    </div>
    <footer class="docs-footer">${footerHtml}</footer>
  </div>`;
  }

  /**
   * Render navigation
   */
  private renderNav(nav: Array<{ text: string; link: string }>): string {
    if (!nav.length) return "";

    return nav
      .map(
        (item) =>
          `<a href="${item.link}" class="docs-nav-link">${this.escapeHtml(item.text)}</a>`,
      )
      .join("\n");
  }

  /**
   * Render sidebar
   */
  private renderSidebar(
    sidebar:
      | Record<
          string,
          Array<{ text: string; items: Array<{ text: string; link: string }> }>
        >
      | undefined,
  ): string {
    if (!sidebar) return "";

    let html = '<nav class="docs-sidebar-nav">';

    for (const [basePath, sections] of Object.entries(sidebar)) {
      html += `<div class="docs-sidebar-section">`;

      for (const section of sections) {
        html += `<h3 class="docs-sidebar-title">${this.escapeHtml(section.text)}</h3>`;
        html += '<ul class="docs-sidebar-list">';

        for (const item of section.items) {
          html += `<li class="docs-sidebar-item">
            <a href="${item.link}" class="docs-sidebar-link">${this.escapeHtml(item.text)}</a>
          </li>`;
        }

        html += "</ul>";
      }

      html += "</div>";
    }

    html += "</nav>";
    return html;
  }

  /**
   * Render article with frontmatter
   */
  private renderArticle(
    frontmatter: Record<string, unknown>,
    content: string,
  ): string {
    const title = frontmatter.title as string | undefined;

    return `
  <article class="docs-article">
    ${title ? `<h1 class="docs-title">${this.escapeHtml(title)}</h1>` : ""}
    <div class="docs-body">
      ${content}
    </div>
  </article>`;
  }

  /**
   * Render table of contents
   */
  private renderTOC(
    toc?: Array<{
      text: string;
      slug: string;
      level: number;
      children?: Array<{ text: string; slug: string; level?: number }>;
    }>,
  ): string {
    if (!toc || !toc.length) return "";

    const renderItems = (
      items: Array<{
        text: string;
        slug: string;
        level?: number;
        children?: Array<{ text: string; slug: string; level?: number }>;
      }>,
    ): string => {
      return `<ul class="toc-list">
        ${items
          .map(
            (item) => `
          <li class="toc-item toc-level-${item.level ?? 2}">
            <a href="#${item.slug}" class="toc-link">${this.escapeHtml(item.text)}</a>
            ${item.children ? renderItems(item.children) : ""}
          </li>`,
          )
          .join("")}
      </ul>`;
    };

    return `<nav class="toc">
      <h2 class="toc-title">On this page</h2>
      ${renderItems(toc)}
    </nav>`;
  }

  /**
   * Render footer
   */
  private renderFooter(footer?: {
    message?: string;
    links?: Array<{ text: string; url: string }>;
  }): string {
    if (!footer) return "";

    const linksHtml = footer.links
      ? footer.links
          .map(
            (link) => `<a href="${link.url}">${this.escapeHtml(link.text)}</a>`,
          )
          .join(" | ")
      : "";

    return `
  <div class="docs-footer-content">
    ${footer.message ? `<p>${this.escapeHtml(footer.message)}</p>` : ""}
    ${linksHtml ? `<p>${linksHtml}</p>` : ""}
  </div>`;
  }

  /**
   * Render base styles
   */
  private renderStyles(): string {
    return `
  <style>
    /* Reset */
    *, *::before, *::after { box-sizing: border-box; }
    html { font-size: 16px; -webkit-font-smoothing: antialiased; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; background: #fff; }

    /* Layout */
    .docs-container { display: flex; flex-direction: column; min-height: 100vh; }
    .docs-main { display: flex; flex: 1; }
    .docs-content { flex: 1; padding: 2rem; max-width: 800px; }
    .docs-sidebar { width: 250px; padding: 2rem; border-right: 1px solid #e5e5e5; }
    .docs-header { padding: 1rem 2rem; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; gap: 2rem; }
    .docs-footer { padding: 2rem; border-top: 1px solid #e5e5e5; text-align: center; color: #666; }

    /* Typography */
    h1, h2, h3, h4, h5, h6 { margin: 2rem 0 1rem; font-weight: 600; line-height: 1.3; }
    h1 { font-size: 2.25rem; margin-top: 0; }
    h2 { font-size: 1.75rem; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.5rem; }
    h3 { font-size: 1.5rem; }
    p { margin: 1rem 0; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; }

    /* Lists */
    ul, ol { padding-left: 2rem; }
    li { margin: 0.5rem 0; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 0.75rem; border: 1px solid #e5e5e5; text-align: left; }
    th { background: #f9f9f9; font-weight: 600; }

    /* Navigation */
    .docs-nav { display: flex; gap: 1.5rem; }
    .docs-nav-link { color: #333; font-weight: 500; }
    .docs-nav-link:hover { text-decoration: none; color: #0066cc; }

    /* Sidebar */
    .docs-sidebar-section { margin-bottom: 1.5rem; }
    .docs-sidebar-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin: 0 0 0.5rem; }
    .docs-sidebar-list { list-style: none; padding: 0; margin: 0; }
    .docs-sidebar-item { margin: 0; }
    .docs-sidebar-link { display: block; padding: 0.4rem 0; color: #333; font-size: 0.95rem; }
    .docs-sidebar-link:hover { color: #0066cc; text-decoration: none; }

    /* TOC */
    .docs-toc { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e5e5; }
    .toc-title { font-size: 0.875rem; font-weight: 600; margin: 0 0 0.5rem; }
    .toc-list { list-style: none; padding: 0; margin: 0; }
    .toc-item { margin: 0.25rem 0; }
    .toc-link { color: #666; font-size: 0.875rem; }
    .toc-link:hover { color: #0066cc; }

    /* Code blocks */
    .docs-pre { margin: 1rem 0; }

    /* Responsive */
    @media (max-width: 768px) {
      .docs-sidebar { display: none; }
      .docs-content { padding: 1rem; }
      .docs-header { padding: 1rem; }
    }

    ${this.options.customCss ?? ""}
  </style>`;
  }

  /**
   * Render web component styles
   */
  private renderWebComponentStyles(): string {
    if (!this.options.useWebComponents) return "";

    return `
  <script>
    if (typeof customElements !== 'undefined') {
      // Register docs-layout if not already registered
      if (!customElements.get('docs-layout')) {
        class DocsLayout extends HTMLElement {
          connectedCallback() {
            this.render();
          }

          render() {
            // Content is already in DOM from SSR
          }
        }
        customElements.define('docs-layout', DocsLayout);
      }
    }
  </script>`;
  }

  /**
   * Render scripts
   */
  private renderScripts(): string {
    return this.options.useWebComponents
      ? `
  <script>
    // Web Component initialization
    document.addEventListener('DOMContentLoaded', () => {
      // Setup any client-side interactions here
    });
  </script>`
      : "";
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

/**
 * Web Component interface
 */
interface DocsLayoutElement extends HTMLElement {
  props: HydrationProps;
}

// Export adapter
export const vanillaAdapter = createVanillaAdapter();
