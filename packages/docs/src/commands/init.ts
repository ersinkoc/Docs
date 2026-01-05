/**
 * @oxog/docs - Init Command
 * Initialize a new documentation project
 */

import { join } from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { detectFramework } from "../utils/framework.js";

interface InitOptions {
  path?: string;
  template?: string;
  framework?: string;
}

/**
 * Initialize a new documentation project
 */
export async function init(options: InitOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const targetPath = options.path ? join(cwd, options.path) : cwd;

  console.log(`Initializing documentation project in: ${targetPath}`);

  // Detect framework if not specified
  const framework =
    options.framework ?? detectFramework(targetPath) ?? "vanilla";

  // Create docs directory if initializing in current directory
  if (!options.path) {
    const docsDir = join(targetPath, "docs");
    if (!existsSync(docsDir)) {
      mkdirSync(docsDir, { recursive: true });
    }
  }

  // Create config file
  const configContent = generateConfig(framework, options.template);
  const configFileName = options.path ? `docs.config.ts` : "docs.config.ts";
  writeFileSync(join(targetPath, configFileName), configContent);

  // Create index.md
  const indexContent = generateIndex(framework, options.template);
  writeFileSync(join(targetPath, "docs/index.md"), indexContent);

  // Create package.json if initializing in current directory
  if (!options.path) {
    const pkgPath = join(targetPath, "package.json");
    if (!existsSync(pkgPath)) {
      const pkgContent = generatePackageJson(framework);
      writeFileSync(pkgPath, pkgContent);
    }
  }

  console.log(`\nDocumentation project initialized successfully!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Install dependencies: npm install`);
  console.log(`  2. Start dev server: npx @oxog/docs dev`);
  console.log(`  3. Build for production: npx @oxog/docs build`);
}

/**
 * Generate configuration file content
 */
function generateConfig(framework: string, _template?: string): string {
  const adapterMap: Record<string, string> = {
    react: "import react from '@oxog/docs-react'",
    vue: "import vue from '@oxog/docs-vue'",
    svelte: "import svelte from '@oxog/docs-svelte'",
    solid: "import solid from '@oxog/docs-solid'",
    vanilla: "import vanilla from '@oxog/docs-vanilla'",
  };

  const adapterUseMap: Record<string, string> = {
    react: "adapter: react()",
    vue: "adapter: vue()",
    svelte: "adapter: svelte()",
    solid: "adapter: solid()",
    vanilla: "adapter: vanilla()",
  };

  const adapter = adapterMap[framework] ?? adapterMap.vanilla;
  const adapterUse = adapterUseMap[framework] ?? adapterUseMap.vanilla;

  return `import { defineConfig } from '@oxog/docs'
${adapter}

export default defineConfig({
  title: 'My Documentation',
  description: 'Documentation for my project',
  ${adapterUse}
})
`;
}

/**
 * Generate index.md content
 */
function generateIndex(_framework: string, _template?: string): string {
  return `---
title: Getting Started
description: Welcome to my documentation
---

# Getting Started

Welcome to your new documentation site!

## Quick Start

1. Run \`npx @oxog/docs dev\` to start the development server
2. Edit \`docs/index.md\` to update this page
3. Add more pages in the \`docs/\` directory

## Next Steps

- [Configuration](/docs/configuration) - Learn about configuration options
- [Markdown Guide](/docs/markdown) - Write documentation with Markdown
- [Theming](/docs/theming) - Customize the look and feel

---

Built with [@oxog/docs](https://docs.oxog.dev)
`;
}

/**
 * Generate package.json content
 */
function generatePackageJson(framework: string): string {
  const adapterDep =
    {
      react: `"@oxog/docs-react": "^1.0.0"`,
      vue: `"@oxog/docs-vue": "^1.0.0"`,
      svelte: `"@oxog/docs-svelte": "^1.0.0"`,
      solid: `"@oxog/docs-solid": "^1.0.0"`,
      vanilla: `"@oxog/docs-vanilla": "^1.0.0"`,
    }[framework] ?? `"@oxog/docs-vanilla": "^1.0.0"`;

  return `{
  "name": "my-docs",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "@oxog/docs dev",
    "build": "@oxog/docs build",
    "preview": "@oxog/docs preview"
  },
  "dependencies": {
    "@oxog/docs": "^1.0.0",
    "@oxog/docs-core": "^1.0.0",
    "@oxog/docs-theme-default": "^1.0.0",
    ${adapterDep}
  }
}
`;
}
