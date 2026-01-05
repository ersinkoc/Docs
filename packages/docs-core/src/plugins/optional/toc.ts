/**
 * @oxog/docs-core - Table of Contents Plugin
 * TOC extraction and generation
 */

import type {
  DocsPlugin,
  MarkdownAST,
  TOCItem,
  ContentFile,
} from "../../types.js";

/**
 * TOC plugin options
 */
export interface TOCOptions {
  /** Minimum heading level to include */
  minLevel?: number;

  /** Maximum heading level to include */
  maxLevel?: number;

  /** Whether to show nested items */
  nested?: boolean;

  /** TOC container class */
  containerClass?: string;

  /** List class */
  listClass?: string;

  /** Item class */
  itemClass?: string;

  /** Link class */
  linkClass?: string;
}

/**
 * Create TOC plugin
 * @param options - TOC options
 * @returns TOC plugin
 */
export function createTOCPlugin(options: TOCOptions = {}): DocsPlugin {
  const {
    minLevel = 2,
    maxLevel = 3,
    nested = true,
    containerClass = "toc",
    listClass = "toc-list",
    itemClass = "toc-item",
    linkClass = "toc-link",
  } = options;

  return {
    name: "toc",
    version: "1.0.0",

    onMarkdownParse: async (ast: MarkdownAST, file: ContentFile) => {
      // Extract headings from AST
      const headings = extractHeadings(ast, minLevel, maxLevel);

      // Build TOC tree
      const toc = buildTOCTree(headings, nested);

      // Add TOC to frontmatter
      file.frontmatter = {
        ...file.frontmatter,
        toc,
      };

      return ast;
    },

    onHtmlRender: async (html: string, file: ContentFile) => {
      // Generate TOC HTML if present
      const toc = file.frontmatter.toc as TOCItem[] | undefined;
      if (toc && toc.length > 0) {
        const tocHtml = generateTOCHtml(toc, {
          containerClass,
          listClass,
          itemClass,
          linkClass,
        });
        // Inject TOC into HTML
        return html.replace("<!-- TOC -->", tocHtml);
      }
      return html;
    },
  };
}

/**
 * Extract headings from AST
 */
function extractHeadings(
  ast: MarkdownAST,
  minLevel: number,
  maxLevel: number,
): Array<{ level: number; text: string; slug: string }> {
  const headings: Array<{ level: number; text: string; slug: string }> = [];

  function traverse(node: MarkdownAST) {
    if (node.type === "heading" || node.type === "h1" || node.type === "h2") {
      const level = (node.attributes?.level as number) ?? 1;
      if (level >= minLevel && level <= maxLevel) {
        const text = extractText(node);
        headings.push({
          level,
          text,
          slug: slugify(text),
        });
      }
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(ast);
  return headings;
}

/**
 * Extract text from AST node
 */
function extractText(node: MarkdownAST): string {
  if (node.type === "text" || node.type === "inline-code") {
    return node.value || "";
  }

  if (node.children) {
    return node.children.map(extractText).join("");
  }

  return "";
}

/**
 * Build TOC tree from flat headings
 */
function buildTOCTree(
  headings: Array<{ level: number; text: string; slug: string }>,
  nested: boolean,
): TOCItem[] {
  if (!headings.length) return [];

  const root: TOCItem[] = [];
  const stack: { level: number; children: TOCItem[] }[] = [
    { level: 0, children: root },
  ];

  for (const heading of headings) {
    const item: TOCItem = {
      text: heading.text,
      slug: heading.slug,
      level: heading.level,
      children: [],
    };

    // Find parent level
    while (stack.length > 1) {
      const lastItem = stack[stack.length - 1];
      if (lastItem && heading.level <= lastItem.level) {
        stack.pop();
      } else {
        break;
      }
    }

    const parent = stack[stack.length - 1];
    if (!parent) continue;

    if (nested && heading.level > parent.level + 1) {
      // Nested item - add to parent's last child
      const lastChild = parent.children[parent.children.length - 1];
      if (lastChild && lastChild.children) {
        lastChild.children.push(item);
      } else {
        parent.children.push(item);
      }
    } else {
      parent.children.push(item);
    }

    if (nested) {
      stack.push({ level: heading.level, children: item.children ?? [] });
    }
  }

  return root;
}

/**
 * Generate TOC HTML
 */
function generateTOCHtml(
  toc: TOCItem[],
  options: {
    containerClass: string;
    listClass: string;
    itemClass: string;
    linkClass: string;
  },
): string {
  const { containerClass, listClass, itemClass, linkClass } = options;

  function renderItems(items: TOCItem[]): string {
    if (!items.length) return "";

    const listItems = items
      .map((item) => {
        const childrenHtml =
          item.children && item.children.length > 0
            ? `<ul class="${listClass}">${renderItems(item.children)}</ul>`
            : "";

        return `<li class="${itemClass}">
          <a class="${linkClass}" href="#${item.slug}">${item.text}</a>
          ${childrenHtml}
        </li>`;
      })
      .join("");

    return listItems;
  }

  return `<nav class="${containerClass}">
    <ul class="${listClass}">${renderItems(toc)}</ul>
  </nav>`;
}

/**
 * Generate slug from text
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Export plugin instance and factory
export const tocPlugin = createTOCPlugin();
export function toc(options?: TOCOptions): DocsPlugin {
  return createTOCPlugin(options);
}
