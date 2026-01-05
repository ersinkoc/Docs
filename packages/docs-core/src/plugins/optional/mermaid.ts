/**
 * @oxog/docs-core - Mermaid Plugin
 * Mermaid diagram support
 */

import type { DocsPlugin, MarkdownAST } from "../../types.js";

/**
 * Mermaid plugin options
 */
export interface MermaidOptions {
  /** Mermaid version to load */
  version?: string;

  /** CDN URL */
  cdnUrl?: string;

  /** Theme */
  theme?: "default" | "neutral" | "dark" | "forest";

  /** Initialize on client */
  initialize?: boolean;
}

/**
 * Create mermaid plugin
 * @param options - Mermaid options
 * @returns Mermaid plugin
 */
export function createMermaidPlugin(options: MermaidOptions = {}): DocsPlugin {
  const {
    version = "10.6.1",
    cdnUrl = "https://cdn.jsdelivr.net/npm/mermaid",
    theme = "default",
    initialize = true,
  } = options;

  return {
    name: "mermaid",
    version: "1.0.0",

    onHtmlRender: async (html: string) => {
      // Add mermaid script and initialization
      const mermaidScript = createMermaidScript(
        cdnUrl,
        version,
        theme,
        initialize,
      );
      return html.replace("</body>", `${mermaidScript}</body>`);
    },

    onMarkdownParse: async (ast: MarkdownAST) => {
      // Transform mermaid code blocks to HTML
      return transformMermaidBlocks(ast, theme);
    },
  };
}

/**
 * Transform mermaid code blocks in AST
 */
function transformMermaidBlocks(
  ast: MarkdownAST,
  mermaidTheme: string,
): MarkdownAST {
  const { transformAST } = require("../../utils/ast.js");

  return transformAST(ast, (node: MarkdownAST) => {
    if (
      node.type === "code-block" &&
      (node.attributes?.language === "mermaid" ||
        node.attributes?.language === "mmd")
    ) {
      const id = generateDiagramId();
      return {
        type: "mermaid-diagram",
        value: node.value || "",
        attributes: {
          id,
          theme: mermaidTheme,
        },
      };
    }
    return node;
  });
}

/**
 * Generate unique diagram ID
 */
function generateDiagramId(): string {
  return "mermaid-" + Math.random().toString(36).slice(2, 11);
}

/**
 * Create mermaid script
 */
function createMermaidScript(
  cdnUrl: string,
  version: string,
  theme: string,
  initialize: boolean,
): string {
  return `
<script src="${cdnUrl}@${version}/dist/mermaid.min.js"></script>
<script>
  mermaid.initialize({
    startOnLoad: ${initialize},
    theme: '${theme}',
    securityLevel: 'loose',
    fontFamily: 'inherit'
  });
</script>
<style>
  .mermaid {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
  }
</style>`;
}

// Export plugin instance and factory
export const mermaidPlugin = createMermaidPlugin();
export function mermaid(options?: MermaidOptions): DocsPlugin {
  return createMermaidPlugin(options);
}
