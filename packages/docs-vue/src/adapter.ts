/**
 * @oxog/docs-vue - Vue Adapter
 */

import type {
  Adapter,
  AdapterConfig,
  Renderer,
  RenderContent,
} from "@oxog/docs-core";

export function createVueAdapter(_options?: object): Adapter {
  return {
    name: "vue",
    createRenderer(_config: AdapterConfig): Renderer {
      return new VueRenderer();
    },
    transformHtml(html: string): string {
      return html;
    },
    hydrate(element: unknown, props: unknown): void {
      console.log("Vue hydration:", props);
    },
  };
}

class VueRenderer implements Renderer {
  async render(content: RenderContent): Promise<string> {
    const title = String(content.frontmatter.title ?? "Documentation");
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <meta name="description" content="${this.escapeHtml(String(content.frontmatter.description ?? ""))}">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { font-size: 16px; -webkit-font-smoothing: antialiased; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background: #fff; }
    h1 { font-size: 2.25rem; margin: 0 0 1rem; font-weight: 700; }
    h2 { font-size: 1.75rem; margin: 2rem 0 1rem; font-weight: 600; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.5rem; }
    h3 { font-size: 1.5rem; margin: 1.5rem 0 0.75rem; font-weight: 600; }
    p { margin: 1rem 0; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
    pre { margin: 1.5rem 0; padding: 1.25rem; background: #f5f5f5; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    ul, ol { padding-left: 1.5rem; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { padding: 0.75rem 1rem; border: 1px solid #e5e5e5; }
    th { background: #f8f9fa; font-weight: 600; }
  </style>
</head>
<body>
  <div id="app">${content.html}</div>
  <script type="module">console.log('Vue adapter loaded');</script>
</body>
</html>`;
  }
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}

export const vueAdapter = createVueAdapter();
