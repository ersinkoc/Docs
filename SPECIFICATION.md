# @oxog/docs - Specification

## 1 Overview

### 1.1 Purpose

@oxog/docs is a framework-agnostic documentation generator that provides a unified experience for creating beautiful documentation sites across React, Vue, Svelte, Solid, and vanilla JavaScript ecosystems.

### 1.2 Core Philosophy

- **Zero-config default**: Convention over configuration enables users to have a working docs site in under 5 minutes
- **Plugin-first architecture**: Micro-kernel design allows extensibility without core bloat
- **Framework agnostic**: Adapters bridge the core engine to any rendering framework
- **LLM-native**: Designed for both human developers and AI assistants

### 1.3 Target Users

- Open source maintainers creating project documentation
- Teams building internal documentation portals
- Individual developers seeking simple, beautiful docs
- Enterprise teams requiring custom theming and plugins

---

## 2 Package Identity

| Field             | Value                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| **NPM Scope**     | `@oxog`                                                                                                          |
| **Packages**      | `docs`, `docs-core`, `docs-theme-default`, `docs-react`, `docs-vue`, `docs-svelte`, `docs-solid`, `docs-vanilla` |
| **Repository**    | `https://github.com/ersinkoc/docs`                                                                               |
| **Documentation** | `https://docs.oxog.dev`                                                                                          |
| **License**       | MIT                                                                                                              |
| **Author**        | Ersin Koç (@ersinkoc)                                                                                            |

---

## 3 Non-Negotiable Requirements

### 3.1 Zero Runtime Dependencies

All packages MUST have zero external runtime dependencies except:

- `@oxog/markdown` - Markdown parsing and rendering (to be created separately)
- `@oxog/codeshine` - Syntax highlighting (exists)

**Forbidden**: lodash, axios, unified, remark, or any other external utility library.

**Allowed DevDependencies**:

- `typescript: ^5.0.0`
- `vitest: ^2.0.0`
- `@vitest/coverage-v8: ^2.0.0`
- `tsup: ^8.0.0`
- `@types/node: ^20.0.0`
- `prettier: ^3.0.0`
- `eslint: ^9.0.0`
- `vite: ^6.0.0`

### 3.2 100% Test Coverage

- Every line of code must be tested
- Every branch must be tested
- Every function must be tested
- 100% test success rate required
- Coverage thresholds enforced in Vitest configuration

### 3.3 Micro-Kernel Architecture

All packages MUST implement plugin-based architecture with:

- Plugin registration and lifecycle management
- Event bus for inter-plugin communication
- Error boundary and recovery mechanisms
- Configuration management

### 3.4 TypeScript Strict Mode

All packages MUST use TypeScript strict mode with:

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`

### 3.5 LLM-Native Design

- `llms.txt` file in root (< 2000 tokens)
- Predictable API naming (`defineConfig`, `createDocs`, `use`, `build`, `serve`)
- Rich JSDoc with @example on every public API
- 15+ organized examples
- README optimized for LLM consumption

### 3.6 No External Links

Allowed:

- GitHub repository URL
- Custom domain (docs.oxog.dev)
- npm package URL

Forbidden:

- Social media links
- Discord/Slack links
- Email addresses
- Donation/sponsor links

---

## 4 Monorepo Structure

```
docs/                                    # Monorepo root
├── .github/
│   └── workflows/
│       └── deploy.yml                   # GitHub Actions workflow
├── packages/
│   ├── docs/                            # @oxog/docs - CLI orchestrator
│   │   ├── src/
│   │   │   ├── index.ts                 # Main exports
│   │   │   ├── cli.ts                   # CLI entry point
│   │   │   ├── commands/
│   │   │   │   ├── init.ts              # Initialize new docs
│   │   │   │   ├── dev.ts               # Development server
│   │   │   │   ├── build.ts             # Production build
│   │   │   │   ├── preview.ts           # Preview build
│   │   │   │   └── new.ts               # Create new page
│   │   │   └── utils/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── docs-core/                       # @oxog/docs-core - Engine
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── kernel.ts                # Micro kernel implementation
│   │   │   ├── types.ts                 # Core type definitions
│   │   │   ├── config.ts                # Configuration loader
│   │   │   ├── router.ts                # File-based routing
│   │   │   ├── builder.ts               # Build orchestration
│   │   │   ├── dev-server.ts            # Dev server with HMR
│   │   │   ├── plugins/
│   │   │   │   ├── index.ts             # Plugin exports
│   │   │   │   ├── core/
│   │   │   │   │   ├── markdown.ts      # Markdown processing
│   │   │   │   │   ├── frontmatter.ts   # YAML frontmatter
│   │   │   │   │   ├── routing.ts       # Routing plugin
│   │   │   │   │   ├── assets.ts        # Static assets
│   │   │   │   │   └── codeshine.ts     # Syntax highlighting
│   │   │   │   └── optional/
│   │   │   │       ├── search.ts        # Pagefind search
│   │   │   │       ├── sitemap.ts       # Sitemap generation
│   │   │   │       ├── rss.ts           # RSS feed
│   │   │   │       ├── i18n.ts          # Internationalization
│   │   │   │       ├── analytics.ts     # Analytics
│   │   │   │       ├── mermaid.ts       # Mermaid diagrams
│   │   │   │       └── toc.ts           # Table of contents
│   │   │   └── utils/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── docs-theme-default/              # @oxog/docs-theme-default
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
│   ├── docs-react/                      # @oxog/docs-react
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── adapter.ts               # React SSG adapter
│   │   │   ├── renderer.ts              # React renderer
│   │   │   ├── hydration.ts             # Client hydration
│   │   │   └── components/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── docs-vue/                        # @oxog/docs-vue
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
│   ├── docs-svelte/                     # @oxog/docs-svelte
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
│   ├── docs-solid/                      # @oxog/docs-solid
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
│   └── docs-vanilla/                    # @oxog/docs-vanilla
│       ├── src/
│       │   ├── index.ts
│       │   ├── adapter.ts
│       │   ├── renderer.ts              # Plain HTML/Web Components
│       │   └── components/
│       ├── tests/
│       ├── package.json
│       └── tsconfig.json
│
├── examples/                            # 15 examples
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
├── website/                             # docs.oxog.dev
│   ├── public/
│   │   ├── CNAME
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
├── package.json                         # Root package.json
├── pnpm-workspace.yaml
├── tsconfig.json                       # Base tsconfig
└── .gitignore
```

---

## 5 Core Features

### 5.1 Zero-Config Start

Users can create a docs site with zero configuration:

```bash
npx @oxog/docs init
npx @oxog/docs dev
```

Default conventions:

- `docs/` folder for markdown files
- `docs/index.md` → homepage at `/`
- File structure maps to URL structure
- Auto-detect framework from package.json

### 5.2 Framework Adapters

Each adapter provides SSG rendering for its respective framework:

```typescript
// React
import react from "@oxog/docs-react";
export default defineConfig({ adapter: react() });

// Vue
import vue from "@oxog/docs-vue";
export default defineConfig({ adapter: vue() });

// Svelte
import svelte from "@oxog/docs-svelte";
export default defineConfig({ adapter: svelte() });

// Solid
import solid from "@oxog/docs-solid";
export default defineConfig({ adapter: solid() });

// Vanilla (Web Components / Plain HTML)
import vanilla from "@oxog/docs-vanilla";
export default defineConfig({ adapter: vanilla() });
```

### 5.3 Plugin System

Micro-kernel with core and optional plugins:

```typescript
export default defineConfig({
  plugins: [
    search(),
    sitemap({ hostname: "https://example.com" }),
    i18n({ locales: ["en", "tr"] }),
  ],
});
```

### 5.4 File-Based Routing

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

### 5.5 Frontmatter Support

```yaml
---
title: Getting Started
description: Learn how to use @oxog/docs
sidebar: true
order: 1
---
```

### 5.6 Theme System

```typescript
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

## 6 Plugin System

### 6.1 Plugin Interface

```typescript
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

### 6.2 Core Plugins (Always Loaded)

| Plugin               | Description                              |
| -------------------- | ---------------------------------------- |
| `markdown-plugin`    | Markdown → AST → HTML via @oxog/markdown |
| `frontmatter-plugin` | YAML frontmatter extraction              |
| `routing-plugin`     | File-based routing resolution            |
| `assets-plugin`      | Static asset handling                    |
| `codeshine-plugin`   | Syntax highlighting via @oxog/codeshine  |

### 6.3 Optional Plugins (Opt-in)

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

## 7 API Design

### 7.1 Main Export (@oxog/docs)

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

### 7.2 CLI Interface

```bash
# Initialize new docs project
npx @oxog/docs init
npx @oxog/docs init --react
npx @oxog/docs init --vue
npx @oxog/docs init --svelte
npx @oxog/docs init --solid
npx @oxog/docs init --vanilla

# Development
npx @oxog/docs dev
npx @oxog/docs dev --port 4000

# Production
npx @oxog/docs build
npx @oxog/docs preview

# Utilities
npx @oxog/docs new guide/intro
```

### 7.3 Type Definitions

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

## 8 Technical Requirements

| Requirement        | Value           |
| ------------------ | --------------- |
| Runtime            | Node.js         |
| Module Format      | ESM only        |
| Node.js Version    | >= 18.0.0       |
| TypeScript Version | >= 5.0          |
| Monorepo Tool      | pnpm workspaces |

### 8.1 Bundle Size Targets

| Package                    | Target (gzipped) |
| -------------------------- | ---------------- |
| `@oxog/docs`               | < 10KB           |
| `@oxog/docs-core`          | < 15KB           |
| `@oxog/docs-theme-default` | < 20KB           |
| `@oxog/docs-react`         | < 5KB            |
| `@oxog/docs-vue`           | < 5KB            |
| `@oxog/docs-svelte`        | < 5KB            |
| `@oxog/docs-solid`         | < 5KB            |
| `@oxog/docs-vanilla`       | < 5KB            |

---

## 9 LLM-Native Requirements

### 9.1 llms.txt File

Create `/llms.txt` in project root (< 2000 tokens) with:

- Installation instructions
- Quick start guide
- Configuration examples
- Available adapters
- CLI commands
- Plugin API
- Links to docs and repository

### 9.2 API Naming Standards

Predictable patterns LLMs can infer:

- `defineConfig()` - Config factory
- `createDocs()` - Instance factory
- `build()` - Build action
- `serve()` - Serve action
- `use()` - Register plugin

### 9.3 Example Organization

15 examples organized by category:

1. Minimal (zero-config)
2. Custom configuration
   3-7. Framework-specific usage
3. Theme customization
4. Plugin usage
5. Monorepo workspace
6. API documentation style
7. Blog-style documentation
8. Multi-language support
9. Search integration
10. Full-featured

### 9.4 npm Keywords

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

## 10 Configuration Files

### 10.1 pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
  - "website"
  - "examples/*"
```

### 10.2 Root package.json

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

### 10.3 Base tsconfig.json

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

### 10.4 Package tsconfig.json

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

### 10.5 tsup.config.ts

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

### 10.6 vitest.config.ts

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

## 11 GitHub Actions

Single workflow file: `.github/workflows/deploy.yml`

Requirements:

- Run tests on every push
- Build all packages
- Build and deploy website to GitHub Pages
- Use pnpm for dependency management

---

## 12 Website Requirements

### 12.1 Technology Stack

- React 19 + Vite 6 + TypeScript
- Tailwind CSS v4 (CSS-first configuration)
- @oxog/codeshine for syntax highlighting
- Lucide React for icons

### 12.2 Required Pages

- Home (landing page)
- Getting Started
- Configuration
- Adapters (React, Vue, Svelte, Solid, Vanilla)
- Plugins
- Theme Customization
- API Reference
- Examples

### 12.3 Required Features

- IDE-style code blocks with @oxog/codeshine
- Dark/Light theme toggle
- Mobile responsive design
- Search functionality
- CNAME: docs.oxog.dev
- Footer: "Made with ❤️ by Ersin KOÇ"

---

## 13 External Dependencies

### 13.1 @oxog/markdown (Assumed to Exist)

To be created as a separate package. Provides:

```typescript
import { parse, render } from "@oxog/markdown";

// Parse markdown to AST
const ast = parse("# Hello World");

// Render AST to HTML
const html = render(ast);
```

For implementation: Mock this dependency or create a minimal implementation.

### 13.2 @oxog/codeshine (Exists)

Use for syntax highlighting:

```typescript
import { highlight } from "@oxog/codeshine";

const html = highlight(code, { language: "typescript" });
```

---

## 14 Implementation Order

1. `@oxog/docs-core` - Engine first (foundational)
2. `@oxog/docs-vanilla` - Simplest adapter (proof of concept)
3. `@oxog/docs-theme-default` - Default theme
4. `@oxog/docs` - CLI orchestrator
5. `@oxog/docs-react` - React adapter
6. `@oxog/docs-vue` - Vue adapter
7. `@oxog/docs-svelte` - Svelte adapter
8. `@oxog/docs-solid` - Solid adapter

---

## 15 Completion Criteria

### 15.1 Per Package

- [ ] All tests passing (100%)
- [ ] Coverage at 100%
- [ ] No TypeScript errors
- [ ] JSDoc on every public API
- [ ] Package builds without errors

### 15.2 Final Verification

- [ ] All packages build successfully
- [ ] All tests pass
- [ ] Examples run successfully
- [ ] Website builds
- [ ] README complete
- [ ] llms.txt complete
