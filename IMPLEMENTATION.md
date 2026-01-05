# @oxog/docs - Implementation Guide

## 1 Architecture Overview

### 1.1 Micro-Kernel Pattern

The @oxog/docs system follows a micro-kernel architecture where the core engine is minimal and feature-rich through plugins.

```
┌─────────────────────────────────────────────┐
│                 User Code                    │
│         (docs.config.ts)                    │
├─────────────────────────────────────────────┤
│           Plugin Registry API                │
│      use() · register() · unregister()      │
├──────────┬──────────┬──────────┬────────────┤
│  Core    │  Core    │ Optional │ Community  │
│ Plugin 1 │ Plugin 2 │ Plugin   │  Plugin    │
├──────────┴──────────┴──────────┴────────────┤
│              Micro Kernel                    │
│   Event Bus · Lifecycle · Error Boundary    │
└─────────────────────────────────────────────┘
```

### 1.2 Core Responsibilities

The kernel is intentionally minimal:

1. **Plugin Management**: Registration, lifecycle hooks, dependency resolution
2. **Event Bus**: Pub/sub for inter-plugin communication
3. **Error Boundary**: Graceful error handling and recovery
4. **Configuration**: Loading and merging configurations

### 1.3 Plugin Responsibilities

All other features are implemented as plugins:

- Markdown processing
- Frontmatter parsing
- File-based routing
- Asset handling
- Syntax highlighting
- Theme rendering

---

## 2 Core Module Design

### 2.1 Kernel Implementation (`kernel.ts`)

The kernel is the heart of the system. It manages plugins and provides lifecycle hooks.

```typescript
// Core types
export interface Kernel {
  /** Register a plugin */
  use<T extends DocsPlugin>(plugin: T): this;

  /** Get registered plugin */
  getPlugin(name: string): DocsPlugin | undefined;

  /** List all plugins */
  listPlugins(): DocsPlugin[];

  /** Emit event to all plugins */
  emit<K extends keyof LifecycleEvents>(
    event: K,
    ...args: Args<LifecycleEvents[K]>
  ): void;

  /** Execute with error boundary */
  runWithErrorBoundary<T>(fn: () => T): T;
}

export interface LifecycleEvents {
  onConfig: [config: DocsConfig, signal: AbortSignal];
  onContentLoad: [files: ContentFile[]];
  onMarkdownParse: [ast: MarkdownAST, file: ContentFile];
  onHtmlRender: [html: string, file: ContentFile];
  onBuildStart: [];
  onBuildEnd: [manifest: BuildManifest];
  onDevServer: [server: DevServer];
  onFileChange: [file: string, type: "add" | "change" | "unlink"];
  onDestroy: [];
  onError: [error: Error];
}
```

**Error Boundary Strategy:**

- Plugins wrapped in try/catch during registration
- Errors propagated via `onError` event
- Recovery mechanisms for non-fatal errors
- AbortSignal for cancellation

### 2.2 Configuration System (`config.ts`)

Configuration follows a cascading override pattern:

1. Default configuration (built-in)
2. User configuration (docs.config.ts)
3. Environment variables
4. CLI flags (highest priority)

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

export class ConfigLoader {
  /** Load configuration from file */
  async load(configPath?: string): Promise<DocsConfig>;

  /** Resolve cascading config */
  async resolve(config: RawConfig): Promise<ResolvedConfig>;

  /** Validate configuration */
  validate(config: DocsConfig): ValidationResult;
}
```

### 2.3 Router (`router.ts`)

File-based routing with support for frontmatter overrides.

```typescript
export interface Route {
  /** URL path */
  path: string;

  /** File path */
  filePath: string;

  /** Route component */
  component?: string;

  /** Frontmatter */
  frontmatter: Record<string, unknown>;

  /** Child routes */
  children?: Route[];
}

export class Router {
  /** Scan directory for markdown files */
  async scan(dir: string): Promise<ContentFile[]>;

  /** Generate routes from files */
  generateRoutes(files: ContentFile[]): Route[];

  /** Match URL to route */
  match(url: string): Route | undefined;

  /** Get route hierarchy for sidebar */
  getHierarchy(): RouteHierarchy[];
}
```

**Routing Algorithm:**

1. Walk docs directory recursively
2. Convert file paths to URLs:
   - `docs/index.md` → `/`
   - `docs/guide.md` → `/guide`
   - `docs/guide/getting-started.md` → `/guide/getting-started`
   - `docs/guide/index.md` → `/guide/`
3. Apply frontmatter `path` override if present

### 2.4 Builder (`builder.ts`)

Orchestrates the build process through lifecycle phases.

```typescript
export class Builder {
  constructor(config: ResolvedConfig, kernel: Kernel);

  /** Build for production */
  async build(): Promise<BuildManifest>;

  /** Get all pages to build */
  async getPages(): Promise<ContentFile[]>;

  /** Process single page */
  async processPage(file: ContentFile): Promise<RenderedPage>;

  /** Write output files */
  async writeOutput(manifest: BuildManifest): Promise<void>;
}

export interface BuildManifest {
  pages: PageInfo[];
  assets: AssetInfo[];
  buildTime: number;
}

export interface PageInfo {
  url: string;
  filePath: string;
  outputPath: string;
  frontmatter: Record<string, unknown>;
}

export interface AssetInfo {
  src: string;
  dest: string;
  type: "copy" | "generated";
}
```

**Build Phases:**

1. `onBuildStart` - Initialize plugins
2. Load content files
3. `onContentLoad` - Plugin file processing
4. For each page:
   - Parse markdown → AST
   - `onMarkdownParse` - Plugin AST processing
   - Render AST → HTML
   - `onHtmlRender` - Plugin HTML processing
   - Apply adapter (React/Vue/etc)
5. Generate assets
6. `onBuildEnd` - Plugin finalization
7. Write output files

### 2.5 Dev Server (`dev-server.ts`)

Development server with hot module replacement support.

```typescript
export interface DevServer {
  /** Server URL */
  url: string;

  /** Vite server instance */
  viteServer: ViteServer;

  /** Watcher instance */
  watcher: FSWatcher;

  /** Reload page */
  reload(): void;

  /** Custom HMR update */
  hmr(update: HMRPayload): void;

  /** Close server */
  close(): Promise<void>;
}

export class DevServer {
  constructor(config: ResolvedConfig, kernel: Kernel);

  /** Start dev server */
  async start(options?: DevServerOptions): Promise<DevServer>;

  /** Handle file changes */
  async handleFileChange(
    file: string,
    type: "add" | "change" | "unlink",
  ): Promise<void>;
}

export interface DevServerOptions {
  port?: number;
  host?: boolean;
  https?: boolean | HttpsServerOptions;
}
```

**HMR Strategy:**

1. Watch docs directory
2. On change, re-process affected file
3. Send HMR update to connected clients
4. Client updates content without full reload

---

## 3 Plugin System Design

### 3.1 Plugin Interface

```typescript
export interface DocsPlugin {
  /** Unique plugin identifier (kebab-case) */
  name: string;

  /** Semantic version */
  version: string;

  /** Plugin dependencies */
  dependencies?: string[];

  // Config lifecycle
  onConfig?: (
    config: DocsConfig,
    signal: AbortSignal,
  ) => DocsConfig | Promise<DocsConfig>;

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

### 3.2 Core Plugins

#### Markdown Plugin

- Imports `@oxog/markdown` for parsing/rendering
- Transforms markdown content to AST
- Transforms AST to HTML
- Handles custom markdown extensions

#### Frontmatter Plugin

- Parses YAML frontmatter from markdown
- Extracts metadata (title, description, sidebar config)
- Supports nested frontmatter objects

#### Routing Plugin

- Generates routes from file structure
- Resolves URL conflicts
- Applies frontmatter path overrides

#### Assets Plugin

- Copies static assets to output
- Handles image optimization
- Generates asset hashes for caching

#### Codeshine Plugin

- Imports `@oxog/codeshine` for syntax highlighting
- Transforms code blocks in markdown
- Supports multiple languages
- Theme support for syntax colors

### 3.3 Optional Plugins

#### Search Plugin

- Integrates Pagefind for static search
- Indexes content at build time
- Provides search UI component

#### Sitemap Plugin

- Generates sitemap.xml at build time
- Respects robots.txt
- Supports changefreq and priority

#### RSS Plugin

- Generates rss.xml feed
- Requires i18n for multi-language feeds

#### i18n Plugin

- Manages multiple locales
- Fallback language support
- Locale-specific routing

#### Analytics Plugin

- Privacy-friendly analytics
- Local storage for consent
- No external tracking scripts

#### Mermaid Plugin

- Transforms mermaid code blocks to diagrams
- Uses mermaid.js for rendering
- Supports dark theme

#### TOC Plugin

- Extracts headings from content
- Generates table of contents
- Supports nested TOC

### 3.4 Plugin Development API

```typescript
// Creating a plugin
export function myPlugin(options: PluginOptions): DocsPlugin {
  return {
    name: "my-plugin",
    version: "1.0.0",

    onConfig(config, signal) {
      // Modify config
      return config;
    },

    onMarkdownParse(ast, file) {
      // Transform AST
      return ast;
    },

    onHtmlRender(html, file) {
      // Transform HTML
      return html;
    },

    onBuildEnd(manifest) {
      // Finalize build
    },
  };
}
```

---

## 4 Adapter Pattern

Adapters bridge the core engine to specific rendering frameworks.

### 4.1 Adapter Interface

```typescript
export interface Adapter {
  /** Adapter name */
  name: string;

  /** Create renderer */
  createRenderer(config: AdapterConfig): Renderer;

  /** Transform HTML before rendering */
  transformHtml?(html: string): string;

  /** Hydrate on client */
  hydrate?(element: Element, props: HydrationProps): void;
}

export interface Renderer {
  /** Render content to HTML */
  render(content: RenderContent): Promise<string>;
}

export interface RenderContent {
  /** Page frontmatter */
  frontmatter: Record<string, unknown>;

  /** Rendered HTML content */
  html: string;

  /** Table of contents */
  toc?: TOCItem[];

  /** Custom data */
  data?: Record<string, unknown>;
}

export interface HydrationProps {
  content: RenderContent;
  theme: ThemeConfig;
}
```

### 4.2 Vanilla Adapter (Web Components)

```typescript
// docs-vanilla/src/adapter.ts
export function vanillaAdapter(): Adapter {
  return {
    name: "vanilla",

    createRenderer(config) {
      return {
        async render(content) {
          return `
            <docs-layout
              .frontmatter=${JSON.stringify(content.frontmatter)}
              .html=${content.html}
              .toc=${JSON.stringify(content.toc)}
            ></docs-layout>
          `;
        },
      };
    },

    hydrate(element, props) {
      // Web Components handle hydration automatically
    },
  };
}
```

### 4.3 React Adapter

```typescript
// docs-react/src/adapter.ts
export function reactAdapter(): Adapter {
  return {
    name: "react",

    createRenderer(config) {
      return {
        async render(content) {
          // Use React to render layout
          const app = React.createElement(Layout, content);
          return renderToStaticMarkup(app);
        },
      };
    },

    hydrate(element, props) {
      // Hydrate React app
      const root = createRoot(element);
      root.render(React.createElement(Layout, props));
    },
  };
}
```

### 4.4 Adapter Directory Structure

```
packages/docs-[framework]/
├── src/
│   ├── index.ts              # Main export + adapter factory
│   ├── adapter.ts            # Adapter implementation
│   ├── renderer.ts           # Framework-specific renderer
│   ├── hydration.ts          # Client-side hydration
│   └── components/           # Framework components
├── tests/
├── package.json
└── tsconfig.json
```

---

## 5 Theme System

### 5.1 Theme Interface

```typescript
export interface Theme {
  /** Theme name */
  name: string;

  /** Layout component */
  Layout: ComponentType<LayoutProps>;

  /** Components */
  components: Record<string, ComponentType<unknown>>;

  /** CSS styles */
  styles: string | (() => Promise<string>);

  /** Static assets */
  assets?: Asset[];
}

export interface LayoutProps {
  /** Page frontmatter */
  frontmatter: Record<string, unknown>;

  /** Main content HTML */
  content: string;

  /** Table of contents */
  toc?: TOCItem[];

  /** Theme configuration */
  config: ThemeConfig;

  /** Navigation state */
  nav: NavState;
}

export interface ThemeConfig {
  /** Site logo */
  logo?: string;

  /** Navigation items */
  nav?: NavItem[];

  /** Sidebar configuration */
  sidebar?: SidebarConfig;

  /** Footer configuration */
  footer?: FooterConfig;

  /** Social links */
  social?: SocialConfig;

  /** Custom CSS variables */
  cssVars?: Record<string, string>;
}
```

### 5.2 Default Theme Components

```
docs-theme-default/src/components/
├── Layout.tsx           # Main layout wrapper
├── Header.tsx           # Top navigation
├── Sidebar.tsx          # Sidebar navigation
├── Footer.tsx           # Page footer
├── TOC.tsx              # Table of contents
├── Search.tsx           # Search component
└── CodeBlock.tsx        # Code block wrapper
```

### 5.3 Theme CSS Structure

```
docs-theme-default/src/styles/
├── base.css             # Reset + base styles
├── components.css       # Component styles
├── utilities.css        # Utility classes
├── variables.css        # CSS variables
└── themes.css           # Dark/light themes
```

---

## 6 Configuration File Detection

### 6.1 Detection Order

1. `docs.config.ts` (TypeScript)
2. `docs.config.js` (JavaScript)
3. `docs.config.mjs` (ES Module)
4. `package.json` (oxog field)

### 6.2 Config Loader Implementation

```typescript
export class ConfigLoader {
  private resolvers: ConfigResolver[] = [
    new TypeScriptResolver(),
    new JavaScriptResolver(),
    new PackageJsonResolver(),
  ];

  async load(configPath?: string): Promise<DocsConfig> {
    const path = configPath || (await this.detectConfigPath());

    if (!path) {
      return this.getDefaultConfig();
    }

    const resolver = this.getResolver(path);
    const rawConfig = await resolver.load(path);

    return this.resolveConfig(rawConfig, path);
  }

  private async detectConfigPath(): Promise<string | undefined> {
    for (const name of CONFIG_FILE_NAMES) {
      const path = join(process.cwd(), name);
      if (await pathExists(path)) {
        return path;
      }
    }
    return undefined;
  }
}
```

---

## 7 Utility Modules

### 7.1 File System Utilities

```typescript
// utils/fs.ts
export function glob(pattern: string): Promise<string[]>;
export function readDirDeep(dir: string): Promise<string[]>;
export function copyDir(src: string, dest: string): Promise<void>;
export function removeDir(dir: string): Promise<void>;
export function isSubPath(parent: string, child: string): boolean;
```

### 7.2 Path Utilities

```typescript
// utils/path.ts
export function normalizePath(path: string): string;
export function resolveRelative(from: string, to: string): string;
export function getExtension(path: string): string;
export function removeExtension(path: string): string;
export function pathToUrl(path: string, base: string): string;
```

### 7.3 Frontmatter Parser

```typescript
// utils/frontmatter.ts
export function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  content: string;
};

export function stringifyFrontmatter(
  frontmatter: Record<string, unknown>,
  content: string,
): string;

export function validateFrontmatter(
  frontmatter: Record<string, unknown>,
  schema: JSONSchema,
): ValidationResult;
```

### 7.4 Markdown Utilities

```typescript
// utils/markdown.ts
export function extractHeadings(content: string): Heading[];
export function extractTOC(content: string): TOCItem[];
export function resolveLinks(content: string, baseUrl: string): string;
export function slugify(text: string): string;
```

---

## 8 Build Output Structure

### 8.1 Production Build

```
dist/
├── index.html           # Homepage
├── 404.html             # Not found page
├── assets/
│   ├── index.css        # Compiled styles
│   ├── index.js         # Client bundle
│   └── *.svg            # Static assets
├── guide/
│   ├── index.html
│   └── getting-started.html
├── api/
│   ├── index.html
│   └── reference.html
├── sitemap.xml
└── robots.txt
```

### 8.2 Development Output

```
.vite/
├── cache/
│   ├── deps/            # Cached dependencies
│   └── src/             # Cached source files
└── dist/
    ├── client/          # Client bundle
    └── server/          # SSR bundle (if applicable)
```

---

## 9 Error Handling

### 9.1 Error Codes

```typescript
export enum ErrorCode {
  CONFIG_NOT_FOUND = "CONFIG_NOT_FOUND",
  CONFIG_SYNTAX_ERROR = "CONFIG_SYNTAX_ERROR",
  CONFIG_VALIDATION_ERROR = "CONFIG_VALIDATION_ERROR",
  ADAPTER_NOT_FOUND = "ADAPTER_NOT_FOUND",
  PLUGIN_ERROR = "PLUGIN_ERROR",
  BUILD_ERROR = "BUILD_ERROR",
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  MARKDOWN_PARSE_ERROR = "MARKDOWN_PARSE_ERROR",
  FRONTMATTER_PARSE_ERROR = "FRONTMATTER_PARSE_ERROR",
}
```

### 9.2 Error Handling Strategy

```typescript
export class DocsError extends Error {
  code: ErrorCode;
  cause?: Error;
  context?: Record<string, unknown>;
}

export function handleError(error: unknown): void {
  if (error instanceof DocsError) {
    // Known error, handle gracefully
    console.error(`[${error.code}] ${error.message}`);
  } else if (error instanceof Error) {
    // Unknown error, wrap and report
    throw new DocsError("UNKNOWN_ERROR", { cause: error });
  }
}
```

---

## 10 Performance Optimizations

### 10.1 Build Performance

- Parallel file processing
- Incremental builds with caching
- Lazy plugin loading
- Tree-shaking unused features

### 10.2 Runtime Performance

- Code splitting per page
- Lazy-loaded route components
- Optimized static asset delivery
- Preconnect to external resources

### 10.3 Bundle Size

- ESM only, no CommonJS
- Tree-shaking friendly exports
- Minimal core, plugin-based features
- gzip compression targets per package

---

## 11 Security Considerations

### 11.1 Input Validation

- Validate all file paths (prevent path traversal)
- Sanitize user content (prevent XSS)
- Validate frontmatter schemas
- Limit file sizes

### 11.2 Build Security

- Isolate plugin execution
- Limit filesystem access
- Validate output paths
- Sanitize generated HTML

### 11.3 Runtime Security

- Content Security Policy headers
- No eval() or dangerous functions
- Sandboxed script execution
- HTTPS in production
