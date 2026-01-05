# @oxog/docs

Framework-agnostic, zero-configuration, plugin-first documentation generator.

[![npm version](https://img.shields.io/npm/v/@oxog/docs.svg)](https://npmjs.com/package/@oxog/docs)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org)

---

## Package Identity

| Field | Value |
|-------|-------|
| **NPM Packages** | `@oxog/docs`, `@oxog/docs-core`, `@oxog/docs-theme-default`, `@oxog/docs-react`, `@oxog/docs-vue`, `@oxog/docs-svelte`, `@oxog/docs-solid`, `@oxog/docs-vanilla` |
| **GitHub Repository** | https://github.com/ersinkoc/docs |
| **Documentation Site** | https://docs.oxog.dev |
| **License** | MIT |
| **Author** | Ersin Koç (ersinkoc) |

---

## Quick Start

```bash
# Installation
npm install @oxog/docs

# Create new project
npx @oxog/docs init

# Start development server
npx @oxog/docs dev
```

Get a working documentation site in minutes.

---

## Features

- **Framework-Agnostic**: Use with React, Vue, Svelte, Solid, or vanilla JavaScript
- **Zero-Configuration**: Start immediately with sensible defaults
- **Plugin System**: Extensible micro-kernel architecture
- **File-Based Routing**: Files in `docs/` folder automatically become URLs
- **Markdown Support**: YAML frontmatter and syntax highlighting
- **Theme System**: Default theme or create your own

---

## Installation

```bash
# pnpm (recommended)
pnpm add @oxog/docs

# npm
npm install @oxog/docs

# yarn
yarn add @oxog/docs
```

---

## Configuration

### Minimal Configuration

```javascript
// docs.config.js
import { defineConfig } from "@oxog/docs";

export default defineConfig({
  title: "My Documentation",
});
```

### With React

```javascript
// docs.config.js
import { defineConfig } from "@oxog/docs";
import react from "@oxog/docs-react";
import defaultTheme from "@oxog/docs-theme-default";

export default defineConfig({
  title: "React Documentation",
  adapter: react(),
  theme: defaultTheme({
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API", link: "/api/" },
    ],
  }),
});
```

### With Vue

```javascript
// docs.config.js
import { defineConfig } from "@oxog/docs";
import vue from "@oxog/docs-vue";

export default defineConfig({
  title: "Vue Documentation",
  adapter: vue(),
});
```

### With Plugins

```javascript
// docs.config.js
import { defineConfig } from "@oxog/docs";
import { search, sitemap, i18n } from "@oxog/docs-core/plugins";

export default defineConfig({
  title: "My Documentation",
  plugins: [
    search(),
    sitemap({ hostname: "https://example.com" }),
    i18n({ locales: ["en", "tr"] }),
  ],
});
```

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `npx @oxog/docs init` | Create new documentation project |
| `npx @oxog/docs init --react` | Create with React template |
| `npx @oxog/docs init --vue` | Create with Vue template |
| `npx @oxog/docs dev` | Start development server |
| `npx @oxog/docs dev --port 4000` | Start with custom port |
| `npx @oxog/docs build` | Build for production |
| `npx @oxog/docs preview` | Preview production build |
| `npx @oxog/docs new guide/intro` | Create new page |

---

## Plugin System

### Core Plugins (Auto-loaded)

| Plugin | Description |
|--------|-------------|
| `markdown-plugin` | Markdown → AST → HTML conversion |
| `frontmatter-plugin` | YAML frontmatter extraction |
| `routing-plugin` | File-based routing resolution |
| `assets-plugin` | Static asset handling |
| `codeshine-plugin` | Syntax highlighting |

### Optional Plugins

```javascript
import { search, sitemap, rss, i18n, analytics, mermaid, toc } from "@oxog/docs-core/plugins";

export default defineConfig({
  plugins: [
    search(),           // Full-text search
    sitemap(),          // sitemap.xml generation
    rss(),              // RSS feed generation
    i18n(),             // Multi-language support
    analytics(),        // Analytics
    mermaid(),          // Diagram support
    toc(),              // Table of contents
  ],
});
```

### Creating Custom Plugins

```typescript
import { definePlugin } from "@oxog/docs-core";

export default definePlugin({
  name: "my-plugin",
  version: "1.0.0",
  onConfig: (config) => {
    // Modify configuration
    return config;
  },
  onMarkdownParse: (ast, file) => {
    // Process markdown AST
    return ast;
  },
  onBuildEnd: (manifest) => {
    // Post-build operations
  },
});
```

---

## Adapter Packages

| Package | Description | Size |
|---------|-------------|------|
| `@oxog/docs-react` | React SSG | < 5KB |
| `@oxog/docs-vue` | Vue SSG | < 5KB |
| `@oxog/docs-svelte` | Svelte SSG | < 5KB |
| `@oxog/docs-solid` | Solid SSG | < 5KB |
| `@oxog/docs-vanilla` | Vanilla HTML / Web Components | < 5KB |

---

## File Structure

```
docs/
├── index.md             → /
├── guide/
│   ├── index.md         → /guide/
│   └── getting-started.md → /guide/getting-started
└── api/
    ├── index.md         → /api/
    └── reference.md     → /api/reference
```

### Frontmatter

```markdown
---
title: Title
description: Page description
sidebar: true
order: 1
---

# Content
```

---

## Programmatic API

```typescript
import { createDocs } from "@oxog/docs";

const docs = await createDocs({
  root: "./docs",
  config: "./docs.config.js",
});

// Build
await docs.build();

// Serve
await docs.serve({ port: 3000 });
```

---

## Examples

### 01. Minimal

Start with zero configuration.

```bash
npx @oxog/docs init
npx @oxog/docs dev
```

### 02. With Configuration

Custom title and settings.

```javascript
import { defineConfig } from "@oxog/docs";

export default defineConfig({
  title: "API Reference",
  description: "Comprehensive API documentation",
});
```

### 03. React Adapter

React SSG documentation.

```javascript
import { defineConfig } from "@oxog/docs";
import react from "@oxog/docs-react";

export default defineConfig({
  adapter: react(),
});
```

### 04. Vue Adapter

Vue documentation.

```javascript
import { defineConfig } from "@oxog/docs";
import vue from "@oxog/docs-vue";

export default defineConfig({
  adapter: vue(),
});
```

### 05. Svelte Adapter

Svelte documentation.

```javascript
import { defineConfig } from "@oxog/docs";
import svelte from "@oxog/docs-svelte";

export default defineConfig({
  adapter: svelte(),
});
```

### 06. Solid Adapter

Solid documentation.

```javascript
import { defineConfig } from "@oxog/docs";
import solid from "@oxog/docs-solid";

export default defineConfig({
  adapter: solid(),
});
```

### 07. Vanilla Adapter

Vanilla JavaScript / Web Components.

```javascript
import { defineConfig } from "@oxog/docs";
import vanilla from "@oxog/docs-vanilla";

export default defineConfig({
  adapter: vanilla(),
});
```

### 08. Custom Theme

Create your own theme.

```javascript
import { defineConfig } from "@oxog/docs";

export default defineConfig({
  theme: {
    logo: "/logo.svg",
    colors: {
      primary: "#6366f1",
      background: "#ffffff",
      text: "#1f2937",
    },
  },
});
```

### 09. Plugins

Use the plugin system.

```javascript
import { defineConfig } from "@oxog/docs";
import { search, sitemap } from "@oxog/docs-core/plugins";

export default defineConfig({
  plugins: [
    search(),
    sitemap({ hostname: "https://example.com" }),
  ],
});
```

### 10. Monorepo

Workspace documentation.

```javascript
import { defineConfig } from "@oxog/docs";

export default defineConfig({
  srcDir: "packages/*/docs",
});
```

### 11. API Documentation

API reference style documentation.

```javascript
import { defineConfig } from "@oxog/docs";
import defaultTheme from "@oxog/docs-theme-default";

export default defineConfig({
  theme: defaultTheme({
    sidebar: {
      "/api/": [
        { text: "General", link: "/api/" },
        { text: "Functions", link: "/api/functions" },
      ],
    },
  }),
});
```

### 12. Blog Style

Blog style documentation.

```javascript
import { defineConfig } from "@oxog/docs";

export default defineConfig({
  theme: {
    blog: true,
    postsPerPage: 10,
  },
});
```

### 13. i18n (Multi-language)

Multiple language support.

```javascript
import { defineConfig } from "@oxog/docs";
import { i18n } from "@oxog/docs-core/plugins";

export default defineConfig({
  plugins: [
    i18n({
      locales: ["en", "tr", "de"],
      defaultLocale: "en",
    }),
  ],
});
```

### 14. Search

Full-text search.

```javascript
import { defineConfig } from "@oxog/docs";
import { search } from "@oxog/docs-core/plugins";

export default defineConfig({
  plugins: [
    search({
      options: {
        tokenize: "forward",
      },
    }),
  ],
});
```

### 15. Full-Featured

All features combined.

```javascript
import { defineConfig } from "@oxog/docs";
import react from "@oxog/docs-react";
import defaultTheme from "@oxog/docs-theme-default";
import { search, sitemap, i18n, toc } from "@oxog/docs-core/plugins";

export default defineConfig({
  title: "Full-Featured Documentation",
  description: "Example showcasing all features",
  adapter: react(),
  theme: defaultTheme({
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
    ],
  }),
  plugins: [
    search(),
    sitemap({ hostname: "https://example.com" }),
    i18n({ locales: ["en", "tr"] }),
    toc(),
  ],
});
```

---

## Type Definitions

```typescript
interface DocsConfig {
  /** Site title */
  title: string;

  /** Site description */
  description?: string;

  /** Base URL path */
  base?: string;

  /** Source directory */
  srcDir?: string;

  /** Output directory */
  outDir?: string;

  /** Framework adapter */
  adapter: Adapter;

  /** Theme configuration */
  theme?: ThemeConfig;

  /** Plugins to use */
  plugins?: DocsPlugin[];

  /** Vite config overrides */
  vite?: ViteUserConfig;
}

interface DocsPlugin {
  /** Unique plugin identifier (kebab-case) */
  name: string;

  /** Semantic version */
  version: string;

  /** Plugin dependencies */
  dependencies?: string[];

  /** Configuration lifecycle */
  onConfig?: (config: DocsConfig) => DocsConfig | Promise<DocsConfig>;

  /** Content lifecycle */
  onContentLoad?: (files: ContentFile[]) => ContentFile[] | Promise<ContentFile[]>;
  onMarkdownParse?: (ast: MarkdownAST, file: ContentFile) => MarkdownAST | Promise<MarkdownAST>;
  onHtmlRender?: (html: string, file: ContentFile) => string | Promise<string>;

  /** Build lifecycle */
  onBuildStart?: () => void | Promise<void>;
  onBuildEnd?: (manifest: BuildManifest) => void | Promise<void>;

  /** Dev lifecycle */
  onDevServer?: (server: DevServer) => void | Promise<void>;
  onFileChange?: (file: string, type: "add" | "change" | "unlink") => void | Promise<void>;

  /** Cleanup */
  onDestroy?: () => void | Promise<void>;

  /** Error handling */
  onError?: (error: Error) => void;
}
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Contact

- **GitHub**: https://github.com/ersinkoc/docs
- **Documentation**: https://docs.oxog.dev
- **NPM**: https://npmjs.com/package/@oxog/docs
