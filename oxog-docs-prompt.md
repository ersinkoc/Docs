# @oxog/docs - Framework-Agnostic Documentation Generator

## Package Identity

| Field                  | Value                                                                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NPM Packages**       | `@oxog/docs`, `@oxog/docs-core`, `@oxog/docs-theme-default`, `@oxog/docs-react`, `@oxog/docs-vue`, `@oxog/docs-svelte`, `@oxog/docs-solid`, `@oxog/docs-vanilla` |
| **GitHub Repository**  | `https://github.com/ersinkoc/docs`                                                                                                                               |
| **Documentation Site** | `https://docs.oxog.dev`                                                                                                                                          |
| **License**            | MIT                                                                                                                                                              |
| **Author**             | Ersin Koç (ersinkoc)                                                                                                                                             |

> **NO social media, Discord, email, or external links allowed.**

---

## Package Description

**One-line:** Framework-agnostic documentation generator

**Detailed:** @oxog/docs is a zero-config, plugin-first documentation generator that works with any JavaScript framework. Built on micro-kernel architecture, it provides a unified experience for creating beautiful documentation sites whether you're using React, Vue, Svelte, Solid, or vanilla JavaScript. Convention over configuration means you can have a working docs site in under 5 minutes.

---

## NON-NEGOTIABLE RULES

These rules are **ABSOLUTE** and must be followed without exception.

### 1. ZERO RUNTIME DEPENDENCIES (except @oxog/\* packages)

```json
{
  "dependencies": {
    "@oxog/markdown": "^1.0.0", // Internal ecosystem only
    "@oxog/codeshine": "^1.0.0" // Internal ecosystem only
  }
}
```

- Implement EVERYTHING from scratch except @oxog/\* ecosystem packages
- No lodash, no axios, no unified, no remark - nothing external
- Write your own utilities, parsers, validators
- @oxog/markdown will be created as a separate package (assume it exists)
- @oxog/codeshine already exists for syntax highlighting

**Allowed devDependencies only:**

```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "tsup": "^8.0.0",
    "@types/node": "^20.0.0",
    "prettier": "^3.0.0",
    "eslint": "^9.0.0",
    "vite": "^6.0.0"
  }
}
```

### 2. 100% TEST COVERAGE

- Every line of code must be tested
- Every branch must be tested
- Every function must be tested
- **All tests must pass** (100% success rate)
- Use Vitest for testing
- Coverage thresholds enforced in config

### 3. MICRO-KERNEL ARCHITECTURE

All packages MUST use plugin-based architecture:

```
┌─────────────────────────────────────────────┐
│                 User Code                    │
├─────────────────────────────────────────────┤
│           Plugin Registry API                │
│  use() · register() · unregister() · list() │
├──────────┬──────────┬──────────┬────────────┤
│  Core    │  Core    │ Optional │ Community  │
│ Plugin 1 │ Plugin 2 │ Plugin   │  Plugin    │
├──────────┴──────────┴──────────┴────────────┤
│              Micro Kernel                    │
│   Event Bus · Lifecycle · Error Boundary    │
└─────────────────────────────────────────────┘
```

**Kernel responsibilities (minimal):**

- Plugin registration and lifecycle
- Event bus for inter-plugin communication
- Error boundary and recovery
- Configuration management

### 4. DEVELOPMENT WORKFLOW

Create these documents **FIRST**, before any code:

1. **SPECIFICATION.md** - Complete package specification
2. **IMPLEMENTATION.md** - Architecture and design decisions
3. **TASKS.md** - Ordered task list with dependencies

Only after all three documents are complete, implement code following TASKS.md sequentially.

### 5. TYPESCRIPT STRICT MODE

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

### 6. LLM-NATIVE DESIGN

Package must be designed for both humans AND AI assistants:

- **llms.txt** file in root (< 2000 tokens)
- **Predictable API** naming (`defineConfig`, `createDocs`, `use`, `build`, `serve`)
- **Rich JSDoc** with @example on every public API
- **15+ examples** organized by category
- **README** optimized for LLM consumption

### 7. NO EXTERNAL LINKS

- ✅ GitHub repository URL
- ✅ Custom domain (docs.oxog.dev)
- ✅ npm package URL
- ❌ Social media (Twitter, LinkedIn, etc.)
- ❌ Discord/Slack links
- ❌ Email addresses
- ❌ Donation/sponsor links

---

## MONOREPO STRUCTURE

This is a **pnpm workspaces monorepo**:

```
docs/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── packages/
│   ├── docs/                    # @oxog/docs - CLI + orchestrator
│   │   ├── src/
│   │   │   ├── index.ts         # Main exports
│   │   │   ├── cli.ts           # CLI entry
│   │   │   ├── commands/
│   │   │   │   ├── init.ts
│   │   │   │   ├── dev.ts
│   │   │   │   ├── build.ts
│   │   │   │   ├── preview.ts
│   │   │   │   └── new.ts
│   │   │   └── utils/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── docs-core/               # @oxog/docs-core - Engine
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── kernel.ts        # Micro kernel
│   │   │   ├── types.ts
│   │   │   ├── config.ts        # Config loader
│   │   │   ├── router.ts        # File-based routing
│   │   │   ├── builder.ts       # Build orchestration
│   │   │   ├── dev-server.ts    # Dev server + HMR
│   │   │   ├── plugins/
│   │   │   │   ├── index.ts
│   │   │   │   ├── core/
│   │   │   │   │   ├── markdown.ts
│   │   │   │   │   ├── frontmatter.ts
│   │   │   │   │   ├── routing.ts
│   │   │   │   │   ├── assets.ts
│   │   │   │   │   └── codeshine.ts
│   │   │   │   └── optional/
│   │   │   │       ├── search.ts
│   │   │   │       ├── sitemap.ts
│   │   │   │       ├── rss.ts
│   │   │   │       ├── i18n.ts
│   │   │   │       ├── analytics.ts
│   │   │   │       ├── mermaid.ts
│   │   │   │       └── toc.ts
│   │   │   └── utils/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── docs-theme-default/      # @oxog/docs-theme-default
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   │   ├── Layout.ts
│   │   │   │   ├── Header.ts
│   │   │   │   ├── Sidebar.ts
│   │   │   │   ├── Footer.ts
│   │   │   │   ├── TOC.ts
│   │   │   │   ├── Search.ts
│   │   │   │   └── CodeBlock.ts
│   │   │   ├── styles/
│   │   │   │   ├── base.css
│   │   │   │   ├── components.css
│   │   │   │   └── utilities.css
│   │   │   └── types.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── docs-react/              # @oxog/docs-react
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── adapter.ts       # React SSG adapter
│   │   │   ├── renderer.ts      # React renderer
│   │   │   ├── hydration.ts     # Client hydration
│   │   │   └── components/      # React-specific components
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── docs-vue/                # @oxog/docs-vue
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── adapter.ts
│   │   │   ├── renderer.ts
│   │   │   ├── hydration.ts
│   │   │   └── components/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── docs-svelte/             # @oxog/docs-svelte
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── adapter.ts
│   │   │   ├── renderer.ts
│   │   │   ├── hydration.ts
│   │   │   └── components/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── docs-solid/              # @oxog/docs-solid
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── adapter.ts
│   │   │   ├── renderer.ts
│   │   │   ├── hydration.ts
│   │   │   └── components/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── docs-vanilla/            # @oxog/docs-vanilla
│       ├── src/
│       │   ├── index.ts
│       │   ├── adapter.ts
│       │   ├── renderer.ts      # Plain HTML renderer
│       │   └── components/      # Web Components
│       ├── tests/
│       ├── package.json
│       └── tsconfig.json
│
├── examples/
│   ├── 01-minimal/
│   ├── 02-with-config/
│   ├── 03-react-adapter/
│   ├── 04-vue-adapter/
│   ├── 05-svelte-adapter/
│   ├── 06-solid-adapter/
│   ├── 07-vanilla-adapter/
│   ├── 08-custom-theme/
│   ├── 09-plugins/
│   ├── 10-monorepo/
│   ├── 11-api-docs/
│   ├── 12-blog/
│   ├── 13-i18n/
│   ├── 14-search/
│   └── 15-full-featured/
│
├── website/                     # docs.oxog.dev
│   ├── public/
│   │   ├── CNAME               # docs.oxog.dev
│   │   ├── llms.txt
│   │   └── favicon.svg
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.ts
│
├── llms.txt
├── SPECIFICATION.md
├── IMPLEMENTATION.md
├── TASKS.md
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json                 # Root package.json
├── pnpm-workspace.yaml
├── tsconfig.json               # Base tsconfig
└── .gitignore
```

---

## CORE FEATURES

### 1. Zero-Config Start

Users can create a docs site with zero configuration:

```bash
npx @oxog/docs init
npx @oxog/docs dev
```

Default conventions:

- `docs/` folder for markdown files
- `docs/index.md` → homepage
- File structure = URL structure
- Auto-detected framework from package.json

### 2. Framework Adapters

Each adapter provides SSG rendering for its framework:

```typescript
// React
import { defineConfig } from "@oxog/docs";
import react from "@oxog/docs-react";

export default defineConfig({
  adapter: react(),
});

// Vue
import vue from "@oxog/docs-vue";
export default defineConfig({
  adapter: vue(),
});

// Svelte
import svelte from "@oxog/docs-svelte";
export default defineConfig({
  adapter: svelte(),
});

// Solid
import solid from "@oxog/docs-solid";
export default defineConfig({
  adapter: solid(),
});

// Vanilla (Web Components / Plain HTML)
import vanilla from "@oxog/docs-vanilla";
export default defineConfig({
  adapter: vanilla(),
});
```

### 3. Plugin System

Micro-kernel with core and optional plugins:

```typescript
import { defineConfig } from "@oxog/docs";
import { search, sitemap, i18n } from "@oxog/docs-core/plugins";

export default defineConfig({
  plugins: [
    search(),
    sitemap({ hostname: "https://example.com" }),
    i18n({ locales: ["en", "tr"] }),
  ],
});
```

### 4. File-Based Routing

```
docs/
├── index.md           → /
├── guide/
│   ├── index.md       → /guide/
│   ├── getting-started.md → /guide/getting-started
│   └── advanced.md    → /guide/advanced
└── api/
    ├── index.md       → /api/
    └── reference.md   → /api/reference
```

### 5. Frontmatter Support

```markdown
---
title: Getting Started
description: Learn how to use @oxog/docs
sidebar: true
order: 1
---

# Getting Started
```

### 6. Theme System

```typescript
import { defineConfig } from "@oxog/docs";
import defaultTheme from "@oxog/docs-theme-default";

export default defineConfig({
  theme: defaultTheme({
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
    ],
    sidebar: {
      "/guide/": [
        { text: "Introduction", link: "/guide/" },
        { text: "Getting Started", link: "/guide/getting-started" },
      ],
    },
    footer: {
      message: "Released under MIT License",
    },
  }),
});
```

---

## PLUGIN SYSTEM

### Plugin Interface

```typescript
/**
 * Plugin interface for extending docs-core functionality.
 */
export interface DocsPlugin {
  /** Unique plugin identifier (kebab-case) */
  name: string;

  /** Semantic version */
  version: string;

  /** Plugin dependencies */
  dependencies?: string[];

  // Config lifecycle
  onConfig?: (config: DocsConfig) => DocsConfig | Promise<DocsConfig>;

  // Content lifecycle
  onContentLoad?: (
    files: ContentFile[],
  ) => ContentFile[] | Promise<ContentFile[]>;
  onMarkdownParse?: (
    ast: MarkdownAST,
    file: ContentFile,
  ) => MarkdownAST | Promise<MarkdownAST>;
  onHtmlRender?: (html: string, file: ContentFile) => string | Promise<string>;

  // Build lifecycle
  onBuildStart?: () => void | Promise<void>;
  onBuildEnd?: (manifest: BuildManifest) => void | Promise<void>;

  // Dev lifecycle
  onDevServer?: (server: DevServer) => void | Promise<void>;
  onFileChange?: (
    file: string,
    type: "add" | "change" | "unlink",
  ) => void | Promise<void>;

  // Cleanup
  onDestroy?: () => void | Promise<void>;

  // Error handling
  onError?: (error: Error) => void;
}
```

### Core Plugins (Always Loaded)

| Plugin               | Description                              |
| -------------------- | ---------------------------------------- |
| `markdown-plugin`    | Markdown → AST → HTML via @oxog/markdown |
| `frontmatter-plugin` | YAML frontmatter extraction              |
| `routing-plugin`     | File-based routing resolution            |
| `assets-plugin`      | Static asset handling                    |
| `codeshine-plugin`   | Syntax highlighting via @oxog/codeshine  |

### Optional Plugins (Opt-in)

| Plugin             | Description                  | Enable        |
| ------------------ | ---------------------------- | ------------- |
| `search-plugin`    | Pagefind integration         | `search()`    |
| `sitemap-plugin`   | sitemap.xml generation       | `sitemap()`   |
| `rss-plugin`       | RSS feed generation          | `rss()`       |
| `i18n-plugin`      | Multi-language support       | `i18n()`      |
| `analytics-plugin` | Privacy-friendly analytics   | `analytics()` |
| `mermaid-plugin`   | Diagram support              | `mermaid()`   |
| `toc-plugin`       | Table of contents extraction | `toc()`       |

---

## API DESIGN

### Main Export (@oxog/docs)

```typescript
import { defineConfig, createDocs } from "@oxog/docs";

// Config helper with type safety
export default defineConfig({
  title: "My Docs",
  description: "Documentation for my project",
  adapter: react(),
  theme: defaultTheme(),
  plugins: [],
});

// Programmatic API
const docs = await createDocs({
  root: "./docs",
  config: "./docs.config.js",
});

await docs.build();
await docs.serve({ port: 3000 });
```

### CLI Interface

```bash
# Initialize new docs project
npx @oxog/docs init
npx @oxog/docs init --react
npx @oxog/docs init --vue
npx @oxog/docs init --svelte
npx @oxog/docs init --solid
npx @oxog/docs init --vanilla

# Development
npx @oxog/docs dev              # Start dev server
npx @oxog/docs dev --port 4000  # Custom port

# Production
npx @oxog/docs build            # Build for production
npx @oxog/docs preview          # Preview production build

# Utilities
npx @oxog/docs new guide/intro  # Create new page
```

### Type Definitions

```typescript
export interface DocsConfig {
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

export interface Adapter {
  name: string;
  render: (content: RenderedContent) => string | Promise<string>;
  hydrate?: (element: Element) => void;
  transformHtml?: (html: string) => string;
}

export interface ContentFile {
  path: string;
  relativePath: string;
  url: string;
  frontmatter: Record<string, unknown>;
  content: string;
  ast?: MarkdownAST;
  html?: string;
}

export interface BuildManifest {
  pages: PageInfo[];
  assets: AssetInfo[];
  buildTime: number;
}
```

---

## TECHNICAL REQUIREMENTS

| Requirement        | Value           |
| ------------------ | --------------- |
| Runtime            | Node.js         |
| Module Format      | ESM only        |
| Node.js Version    | >= 18.0.0       |
| TypeScript Version | >= 5.0          |
| Monorepo Tool      | pnpm workspaces |

### Bundle Size Targets

| Package                    | Target         |
| -------------------------- | -------------- |
| `@oxog/docs`               | < 10KB gzipped |
| `@oxog/docs-core`          | < 15KB gzipped |
| `@oxog/docs-theme-default` | < 20KB gzipped |
| `@oxog/docs-react`         | < 5KB gzipped  |
| `@oxog/docs-vue`           | < 5KB gzipped  |
| `@oxog/docs-svelte`        | < 5KB gzipped  |
| `@oxog/docs-solid`         | < 5KB gzipped  |
| `@oxog/docs-vanilla`       | < 5KB gzipped  |

---

## LLM-NATIVE REQUIREMENTS

### 1. llms.txt File

Create `/llms.txt` in project root (< 2000 tokens):

````markdown
# @oxog/docs

> Framework-agnostic documentation generator

## Install

```bash
npm install @oxog/docs
```
````

## Quick Start

```bash
npx @oxog/docs init
npx @oxog/docs dev
```

## Config (docs.config.js)

```javascript
import { defineConfig } from "@oxog/docs";
import react from "@oxog/docs-react";

export default defineConfig({
  title: "My Docs",
  adapter: react(),
});
```

## Adapters

- `@oxog/docs-react` - React SSG
- `@oxog/docs-vue` - Vue SSG
- `@oxog/docs-svelte` - Svelte SSG
- `@oxog/docs-solid` - Solid SSG
- `@oxog/docs-vanilla` - Plain HTML / Web Components

## CLI

- `init` - Create new docs project
- `dev` - Start dev server
- `build` - Production build
- `preview` - Preview build
- `new <path>` - Create page

## Plugins

### Core (auto-loaded)

- markdown, frontmatter, routing, assets, codeshine

### Optional

- search(), sitemap(), rss(), i18n(), analytics(), mermaid(), toc()

## Plugin API

```typescript
{
  name: string,
  onConfig?: (config) => config,
  onMarkdownParse?: (ast, file) => ast,
  onBuildEnd?: (manifest) => void
}
```

## Links

- Docs: https://docs.oxog.dev
- GitHub: https://github.com/ersinkoc/docs

````

### 2. API Naming Standards

Use predictable patterns LLMs can infer:

```typescript
// ✅ GOOD - Predictable
defineConfig()   // Config factory
createDocs()     // Instance factory
build()          // Build action
serve()          // Serve action
use()            // Register plugin

// ❌ BAD - Unpredictable
x(), proc(), do(), handle()
````

### 3. Example Organization

```
examples/
├── 01-minimal/              # Zero-config start
├── 02-with-config/          # Custom configuration
├── 03-react-adapter/        # React usage
├── 04-vue-adapter/          # Vue usage
├── 05-svelte-adapter/       # Svelte usage
├── 06-solid-adapter/        # Solid usage
├── 07-vanilla-adapter/      # Vanilla/Web Components
├── 08-custom-theme/         # Theme customization
├── 09-plugins/              # Using plugins
├── 10-monorepo/             # Workspace documentation
├── 11-api-docs/             # API reference style
├── 12-blog/                 # Blog-style docs
├── 13-i18n/                 # Multi-language
├── 14-search/               # Search integration
└── 15-full-featured/        # All features combined
```

### 4. npm Keywords

```json
{
  "keywords": [
    "documentation",
    "docs",
    "static-site-generator",
    "ssg",
    "markdown",
    "react",
    "vue",
    "svelte",
    "solid",
    "framework-agnostic",
    "vite",
    "typescript"
  ]
}
```

---

## CONFIG FILES

### pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
  - "website"
  - "examples/*"
```

### Root package.json

```json
{
  "name": "@oxog/docs-monorepo",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "test:coverage": "pnpm -r test:coverage",
    "dev": "pnpm --filter @oxog/docs dev",
    "lint": "eslint packages/*/src/",
    "format": "prettier --write .",
    "typecheck": "pnpm -r typecheck",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  },
  "engines": {
    "node": ">=18",
    "pnpm": ">=9"
  }
}
```

### Base tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

### Package tsconfig.json (extends base)

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### tsup.config.ts (per package)

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
});
```

### vitest.config.ts (per package)

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "*.config.*"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
```

---

## GITHUB ACTIONS

Single workflow file: `.github/workflows/deploy.yml`

```yaml
name: Deploy Website

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test:coverage

      - name: Build packages
        run: pnpm build

      - name: Build website
        working-directory: ./website
        run: pnpm build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./website/dist"

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## WEBSITE REQUIREMENTS

Create a documentation website at `website/`:

### Technology Stack

- React 19 + Vite 6 + TypeScript
- Tailwind CSS v4 (CSS-first configuration)
- @oxog/codeshine for syntax highlighting
- Lucide React for icons

### Required Pages

- Home (landing page)
- Getting Started
- Configuration
- Adapters (React, Vue, Svelte, Solid, Vanilla)
- Plugins
- Theme Customization
- API Reference
- Examples

### Required Features

- IDE-style code blocks with @oxog/codeshine
- Dark/Light theme toggle
- Mobile responsive
- Search
- CNAME: docs.oxog.dev
- Footer: "Made with ❤️ by Ersin KOÇ"

---

## IMPLEMENTATION CHECKLIST

### Before Starting

- [ ] Create SPECIFICATION.md with complete spec
- [ ] Create IMPLEMENTATION.md with architecture
- [ ] Create TASKS.md with ordered task list
- [ ] All three documents reviewed and complete

### Package Implementation Order

1. `@oxog/docs-core` - Engine first
2. `@oxog/docs-vanilla` - Simplest adapter
3. `@oxog/docs-theme-default` - Default theme
4. `@oxog/docs` - CLI orchestrator
5. `@oxog/docs-react` - React adapter
6. `@oxog/docs-vue` - Vue adapter
7. `@oxog/docs-svelte` - Svelte adapter
8. `@oxog/docs-solid` - Solid adapter

### Per Package Completion

- [ ] All tests passing (100%)
- [ ] Coverage at 100%
- [ ] No TypeScript errors
- [ ] JSDoc on every public API
- [ ] Package builds without errors

### Final Verification

- [ ] All packages build
- [ ] All tests pass
- [ ] Examples run successfully
- [ ] Website builds
- [ ] README complete
- [ ] llms.txt complete

---

## DEPENDENCY NOTES

### @oxog/markdown (External Dependency - Assume Exists)

This package depends on `@oxog/markdown` which provides:

```typescript
import { parse, render } from "@oxog/markdown";

// Parse markdown to AST
const ast = parse("# Hello World");

// Render AST to HTML
const html = render(ast);
```

**For implementation:** Mock this dependency or create a minimal implementation. The actual @oxog/markdown package will be created separately.

### @oxog/codeshine (External Dependency - Exists)

Use for syntax highlighting:

```typescript
import { highlight } from "@oxog/codeshine";

const html = highlight(code, { language: "typescript" });
```

---

## BEGIN IMPLEMENTATION

Start by creating **SPECIFICATION.md** with the complete package specification based on everything above.

Then create **IMPLEMENTATION.md** with architecture decisions.

Then create **TASKS.md** with ordered, numbered tasks.

Only after all three documents are complete, begin implementing code by following TASKS.md sequentially.

**Remember:**

- This is a monorepo with 8 packages
- All packages will be published to npm under @oxog scope
- Must be production-ready
- Zero external runtime dependencies (only @oxog/\* allowed)
- 100% test coverage per package
- Professionally documented
- LLM-native design
- Beautiful documentation website
