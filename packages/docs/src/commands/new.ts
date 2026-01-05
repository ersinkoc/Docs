/**
 * @oxog/docs - New Command
 * Create a new documentation page
 */

import { join, dirname, basename } from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { openInEditor } from "../utils/editor.js";

interface NewOptions {
  title?: string;
  open?: boolean;
}

/**
 * Create a new documentation page
 */
export async function newPage(
  path: string,
  options: NewOptions = {},
): Promise<void> {
  const cwd = process.cwd();
  const docsDir = join(cwd, "docs");

  // Ensure docs directory exists
  if (!existsSync(docsDir)) {
    mkdirSync(docsDir, { recursive: true });
  }

  // Generate file path
  let filePath = path;
  if (!filePath.endsWith(".md")) {
    filePath = filePath + ".md";
  }

  const fullPath = join(docsDir, filePath);
  const dir = dirname(fullPath);

  // Ensure parent directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Generate title from filename if not provided
  const title = options.title ?? generateTitle(basename(fullPath, ".md"));

  // Generate content
  const content = generatePageContent(title, path);

  // Write file
  writeFileSync(fullPath, content, "utf-8");

  console.log(`Created: ${fullPath}`);

  // Open in editor if requested
  if (options.open) {
    await openInEditor(fullPath);
  }
}

/**
 * Generate title from filename
 */
function generateTitle(filename: string): string {
  return filename
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generate page content
 */
function generatePageContent(title: string, _path: string): string {
  return `---
title: ${title}
description:
---

# ${title}

Write your documentation content here.

## Getting Started

Add your content below.

\`\`\`js
// Example code block
console.log('Hello, World!');
\`\`\`

---

[Back to documentation](/)
`;
}
