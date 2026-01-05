/**
 * @oxog/docs-core - Markdown Plugin
 * Markdown parsing and rendering via @oxog/markdown
 */

import type { DocsPlugin, MarkdownAST, ContentFile } from "../../types.js";

/**
 * Create markdown plugin
 * @returns Markdown plugin
 */
export function createMarkdownPlugin(): DocsPlugin {
  return {
    name: "markdown",
    version: "1.0.0",
    dependencies: ["@oxog/markdown"],

    onMarkdownParse: async (ast: MarkdownAST, file: ContentFile) => {
      // Parse markdown content using @oxog/markdown
      // This is a placeholder - actual implementation would use the package
      return parseMarkdown(file.content);
    },
  };
}

/**
 * Parse markdown to AST (placeholder for @oxog/markdown)
 * @param content - Markdown content
 * @returns AST
 */
function parseMarkdown(content: string): MarkdownAST {
  // Placeholder implementation
  // In production, this would use @oxog/markdown.parse()
  const lines = content.split("\n");
  const children: MarkdownAST[] = [];

  for (const line of lines) {
    if (line.startsWith("# ")) {
      children.push({
        type: "heading",
        value: line.slice(2),
        attributes: { level: 1 },
      });
    } else if (line.startsWith("## ")) {
      children.push({
        type: "heading",
        value: line.slice(3),
        attributes: { level: 2 },
      });
    } else if (line.startsWith("### ")) {
      children.push({
        type: "heading",
        value: line.slice(4),
        attributes: { level: 3 },
      });
    } else if (line.startsWith("- ")) {
      children.push({
        type: "list-item",
        children: [
          {
            type: "text",
            value: line.slice(2),
          },
        ],
      });
    } else if (line.match(/^```/)) {
      // Code block - find end
      children.push({
        type: "code-block",
        value: "",
        attributes: { language: "text" },
      });
    } else if (line.trim()) {
      children.push({
        type: "paragraph",
        children: [
          {
            type: "text",
            value: line,
          },
        ],
      });
    }
  }

  return {
    type: "root",
    children,
  };
}

// Export plugin instance
export const markdownPlugin = createMarkdownPlugin();
