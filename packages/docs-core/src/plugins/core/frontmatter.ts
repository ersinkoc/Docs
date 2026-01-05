/**
 * @oxog/docs-core - Frontmatter Plugin
 * YAML frontmatter extraction and parsing
 */

import type { DocsPlugin, ContentFile } from "../../types.js";

/**
 * Create frontmatter plugin
 * @returns Frontmatter plugin
 */
export function createFrontmatterPlugin(): DocsPlugin {
  return {
    name: "frontmatter",
    version: "1.0.0",

    onContentLoad: async (files: ContentFile[]) => {
      return files.map((file) => ({
        ...file,
        frontmatter: extractFrontmatter(file.content),
      }));
    },
  };
}

/**
 * Extract frontmatter from markdown content
 * @param content - Full markdown content
 * @returns Extracted frontmatter
 */
export function extractFrontmatter(content: string): Record<string, unknown> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);

  if (!frontmatterMatch) {
    return {};
  }

  const frontmatterYaml = frontmatterMatch[1]?.trim() ?? "";
  return parseFrontmatterYaml(frontmatterYaml);
}

/**
 * Parse YAML frontmatter
 * @param yaml - YAML string
 * @returns Parsed metadata
 */
function parseFrontmatterYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split("\n");
  const stack: Record<string, unknown>[] = [result];
  const indentStack: number[] = [0];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = line.match(/^(\s*)(.+?):\s*(.*)$/);
    if (!match) continue;

    const [, indent, key, value] = match;
    if (!key || indent === undefined) continue;

    const keyTrimmed = key.trim();
    const valueTrimmed = value?.trim() ?? "";

    // Find parent level
    const currentIndent = indent.length;
    const lastIndent = indentStack[indentStack.length - 1];
    while (
      indentStack.length > 1 &&
      lastIndent !== undefined &&
      currentIndent <= lastIndent
    ) {
      stack.pop();
      indentStack.pop();
    }

    const current = stack[stack.length - 1];
    if (!current) continue;

    // Check for nested object
    if (
      !valueTrimmed ||
      valueTrimmed === "" ||
      valueTrimmed === "|" ||
      valueTrimmed === ">"
    ) {
      const nested: Record<string, unknown> = {};
      current[keyTrimmed] = nested;
      stack.push(nested);
      indentStack.push(currentIndent);
    } else {
      // Parse value
      current[keyTrimmed] = parseValue(valueTrimmed);
    }
  }

  return result;
}

/**
 * Parse a YAML value
 * @param value - Value string
 * @returns Parsed value
 */
function parseValue(value: string): unknown {
  if (!value) return undefined;

  // Empty
  if (value === "" || value === "~" || value === "null") return null;

  // Boolean
  if (value === "true") return true;
  if (value === "false") return false;

  // Number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  // Quoted string
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  // Array
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((v) => parseValue(v.trim()));
  }

  // Inline object
  if (value.startsWith("{") && value.endsWith("}")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return {};
    const obj: Record<string, unknown> = {};
    for (const pair of inner.split(",")) {
      const [k, v] = pair.split(":").map((s) => s.trim());
      if (k) {
        obj[k] = parseValue(v ?? "");
      }
    }
    return obj;
  }

  // String
  return value;
}

// Export plugin instance
export const frontmatterPlugin = createFrontmatterPlugin();
