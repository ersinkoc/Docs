/**
 * @oxog/docs-vanilla - Renderer
 * Plain HTML renderer implementation
 */

import type { RenderContent } from "@oxog/docs-core";

/**
 * Vanilla HTML renderer
 */
export class VanillaRenderer {
  /**
   * Render content to HTML string
   */
  render(content: RenderContent): string {
    const { frontmatter, html, toc } = content;
    const title = String(frontmatter.title ?? "Documentation");
    const description = String(frontmatter.description ?? "");

    // Generate TOC HTML
    const tocHtml = toc && toc.length > 0 ? this.renderTOC(toc) : "";

    // Build full HTML document
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <meta name="description" content="${this.escapeHtml(description)}">
  <style>
    /* Reset */
    *, *::before, *::after { box-sizing: border-box; }
    html { font-size: 16px; -webkit-font-smoothing: antialiased; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; background: #fff; }

    /* Layout */
    .docs-container { display: flex; flex-direction: column; min-height: 100vh; }
    .docs-main { display: flex; flex: 1; }
    .docs-content { flex: 1; padding: 2rem; max-width: 800px; margin: 0 auto; }
    .docs-article { max-width: 800px; }

    /* Typography */
    h1 { font-size: 2.25rem; margin: 0 0 1rem; font-weight: 700; }
    h2 { font-size: 1.75rem; margin: 2rem 0 1rem; font-weight: 600; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.5rem; }
    h3 { font-size: 1.5rem; margin: 1.5rem 0 0.75rem; font-weight: 600; }
    p { margin: 1rem 0; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; }
    pre code { background: none; padding: 0; }

    /* Lists */
    ul, ol { padding-left: 1.5rem; }
    li { margin: 0.5rem 0; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 0.75rem; border: 1px solid #e5e5e5; text-align: left; }
    th { background: #f9f9f9; font-weight: 600; }

    /* Blockquotes */
    blockquote { margin: 1rem 0; padding: 0.5rem 1rem; border-left: 4px solid #0066cc; background: #f9f9f9; }

    /* Images */
    img { max-width: 100%; height: auto; }

    /* Responsive */
    @media (max-width: 640px) {
      .docs-content { padding: 1rem; }
      h1 { font-size: 1.75rem; }
      h2 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="docs-container">
    <main class="docs-content">
      <article class="docs-article">
        <h1>${this.escapeHtml(title)}</h1>
        ${html}
        ${tocHtml}
      </article>
    </main>
  </div>
</body>
</html>`;
  }

  /**
   * Render table of contents
   */
  private renderTOC(
    toc: Array<{
      text: string;
      slug: string;
      level?: number;
      children?: Array<{ text: string; slug: string; level?: number }>;
    }>,
  ): string {
    const renderItems = (
      items: Array<{
        text: string;
        slug: string;
        level?: number;
        children?: Array<{ text: string; slug: string; level?: number }>;
      }>,
    ): string => {
      return items
        .map(
          (item) => `
        <li style="margin-left: ${((item.level ?? 2) - 2) * 1}rem;">
          <a href="#${item.slug}" style="color: #666; font-size: 0.9rem;">${this.escapeHtml(item.text)}</a>
          ${item.children && item.children.length > 0 ? `<ul>${renderItems(item.children)}</ul>` : ""}
        </li>`,
        )
        .join("\n");
    };

    return `
  <nav style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e5e5;">
    <h3 style="font-size: 1rem; margin: 0 0 0.5rem;">On this page</h3>
    <ul style="list-style: none; padding: 0; margin: 0;">
${renderItems(toc)}
    </ul>
  </nav>`;
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
