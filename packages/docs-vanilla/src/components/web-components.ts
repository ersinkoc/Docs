/**
 * @oxog/docs-vanilla - Web Components
 * Custom elements for documentation
 */

import type {
  RenderContent,
  ThemeConfig,
  HydrationProps,
} from "@oxog/docs-core";

/**
 * Docs Layout Web Component
 */
export class DocsLayoutElement extends HTMLElement {
  /** Props passed from adapter */
  private _props: HydrationProps | null = null;

  /**
   * Get props
   */
  get props(): HydrationProps | null {
    return this._props;
  }

  /**
   * Set props
   */
  set props(value: HydrationProps | null) {
    this._props = value;
    this.render();
  }

  /**
   * Connected to DOM
   */
  connectedCallback(): void {
    this.render();
  }

  /**
   * Render component
   */
  render(): void {
    if (!this._props) return;

    const { content, theme } = this._props;
    const { frontmatter, html } = content;

    this.innerHTML = `
      <div class="docs-layout">
        ${this.renderHeader(theme)}
        <div class="docs-main">
          <aside class="docs-sidebar">
            ${this.renderSidebar(theme)}
          </aside>
          <main class="docs-content">
            <article class="docs-article">
              ${this.renderTitle(frontmatter)}
              <div class="docs-body">${html}</div>
            </article>
          </main>
        </div>
        ${this.renderFooter(theme)}
      </div>
      <style>${this.renderStyles()}</style>
    `;
  }

  /**
   * Render header
   */
  private renderHeader(theme: ThemeConfig | undefined): string {
    const logo = theme?.logo ?? "";
    const nav = theme?.nav ?? [];

    const navHtml = nav
      .map((item) => `<a href="${item.link}" class="nav-link">${item.text}</a>`)
      .join("");

    return `
      <header class="docs-header">
        ${logo ? `<img src="${logo}" alt="Logo" class="docs-logo">` : ""}
        <nav class="docs-nav">${navHtml}</nav>
      </header>
    `;
  }

  /**
   * Render sidebar
   */
  private renderSidebar(theme: ThemeConfig | undefined): string {
    const sidebar = theme?.sidebar;

    if (!sidebar) return "";

    let html = '<nav class="docs-sidebar-nav">';

    for (const [, sections] of Object.entries(sidebar)) {
      for (const section of sections) {
        html += `<div class="docs-sidebar-section">`;
        html += `<h3 class="docs-sidebar-title">${section.text}</h3>`;
        html += '<ul class="docs-sidebar-list">';

        for (const item of section.items) {
          html += `<li class="docs-sidebar-item">
            <a href="${item.link}" class="docs-sidebar-link">${item.text}</a>
          </li>`;
        }

        html += "</ul></div>";
      }
    }

    html += "</nav>";
    return html;
  }

  /**
   * Render title
   */
  private renderTitle(frontmatter: Record<string, unknown>): string {
    const title = frontmatter.title as string | undefined;
    return title ? `<h1 class="docs-title">${this.escapeHtml(title)}</h1>` : "";
  }

  /**
   * Render footer
   */
  private renderFooter(theme: ThemeConfig | undefined): string {
    const footer = theme?.footer;

    if (!footer) return "";

    const linksHtml = footer.links
      ? footer.links
          .map((link) => `<a href="${link.url}">${link.text}</a>`)
          .join(" | ")
      : "";

    return `
      <footer class="docs-footer">
        ${footer.message ? `<p>${footer.message}</p>` : ""}
        ${linksHtml ? `<p>${linksHtml}</p>` : ""}
      </footer>
    `;
  }

  /**
   * Render component styles
   */
  private renderStyles(): string {
    return `
      .docs-layout { display: flex; flex-direction: column; min-height: 100vh; }
      .docs-main { display: flex; flex: 1; }
      .docs-content { flex: 1; padding: 2rem; max-width: 800px; }
      .docs-sidebar { width: 250px; padding: 2rem; border-right: 1px solid #e5e5e5; }
      .docs-header { padding: 1rem 2rem; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; gap: 2rem; }
      .docs-footer { padding: 2rem; border-top: 1px solid #e5e5e5; text-align: center; color: #666; }
      .docs-nav { display: flex; gap: 1.5rem; }
      .nav-link { color: #333; font-weight: 500; }
      .docs-sidebar-section { margin-bottom: 1.5rem; }
      .docs-sidebar-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin: 0 0 0.5rem; }
      .docs-sidebar-list { list-style: none; padding: 0; margin: 0; }
      .docs-sidebar-item { margin: 0; }
      .docs-sidebar-link { display: block; padding: 0.4rem 0; color: #333; font-size: 0.95rem; }
      .docs-sidebar-link:hover { color: #0066cc; text-decoration: none; }
      .docs-title { margin: 0 0 1rem; font-weight: 700; }

      @media (max-width: 768px) {
        .docs-sidebar { display: none; }
        .docs-content { padding: 1rem; }
        .docs-header { padding: 1rem; }
      }
    `;
  }

  /**
   * Escape HTML
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

/**
 * Register web components
 */
export function registerWebComponents(): void {
  if (
    typeof customElements !== "undefined" &&
    !customElements.get("docs-layout")
  ) {
    customElements.define("docs-layout", DocsLayoutElement);
  }
}
