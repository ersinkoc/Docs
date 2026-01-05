/**
 * @oxog/docs-core - Codeshine Plugin
 * Syntax highlighting via @oxog/codeshine
 */

import type { DocsPlugin, MarkdownAST, ContentFile } from "../../types.js";

/**
 * Create codeshine plugin
 * @param options - Syntax highlighting options
 * @returns Codeshine plugin
 */
export function createCodeshinePlugin(
  options: CodeshineOptions = {},
): DocsPlugin {
  return {
    name: "codeshine",
    version: "1.0.0",
    dependencies: ["@oxog/codeshine"],

    onMarkdownParse: async (ast: MarkdownAST, file: ContentFile) => {
      return highlightCodeBlocks(ast, options);
    },
  };
}

/**
 * Syntax highlighting options
 */
export interface CodeshineOptions {
  /** Theme name */
  theme?: string;

  /** Default language */
  defaultLanguage?: string;

  /** Skip highlighting for these languages */
  skipLanguages?: string[];
}

/**
 * Highlight code blocks in AST
 * @param ast - Markdown AST
 * @param options - Options
 * @returns Updated AST
 */
function highlightCodeBlocks(
  ast: MarkdownAST,
  options: CodeshineOptions,
): MarkdownAST {
  const {
    theme = "github-dark",
    defaultLanguage = "text",
    skipLanguages = [],
  } = options;

  // Find and highlight code blocks
  return transformAST(ast, (node) => {
    if (node.type === "code-block" || node.type === "code") {
      const language = (node.attributes?.language as string) ?? defaultLanguage;

      if (skipLanguages.includes(language)) {
        return node;
      }

      // Placeholder for @oxog/codeshine.highlight()
      const highlightedCode = highlight(node.value || "", language, theme);

      return {
        ...node,
        type: "code-block",
        value: highlightedCode,
        attributes: {
          ...node.attributes,
          language,
          highlighted: true,
        },
      };
    }

    return node;
  });
}

/**
 * Highlight code (placeholder for @oxog/codeshine)
 * @param code - Code to highlight
 * @param language - Language
 * @param theme - Theme
 * @returns Highlighted HTML
 */
function highlight(code: string, language: string, theme: string): string {
  // Placeholder - would use @oxog/codeshine
  // Returns simple HTML with basic highlighting
  const escaped = escapeHtml(code);

  return `<pre class="codeshine codeshine-${theme}" data-language="${language}"><code class="language-${language}">${escaped}</code></pre>`;
}

/**
 * Escape HTML characters
 * @param str - String to escape
 * @returns Escaped string
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
 * Transform AST recursively
 * @param ast - AST to transform
 * @param transform - Transform function
 * @returns Transformed AST
 */
function transformAST(
  ast: MarkdownAST,
  transform: (node: MarkdownAST) => MarkdownAST,
): MarkdownAST {
  const transformed = transform(ast);

  if (transformed.children) {
    transformed.children = transformed.children.map((child) =>
      transformAST(child, transform),
    );
  }

  return transformed;
}

// Export plugin instance
export const codeshinePlugin = createCodeshinePlugin();
