/**
 * @oxog/docs-core - Core type definitions
 * Framework-agnostic documentation generator engine
 */

// ============================================================================
// Configuration
// ============================================================================

/**
 * Main configuration interface for documentation sites
 */
export interface DocsConfig {
  /** Site title */
  title: string;

  /** Site description */
  description?: string;

  /** Base URL path */
  base?: string;

  /** Source directory (default: 'docs') */
  srcDir?: string;

  /** Output directory (default: 'dist') */
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

/**
 * Framework adapter for rendering documentation
 */
export interface Adapter {
  /** Adapter name */
  name: string;

  /** Create renderer for content */
  createRenderer(config: AdapterConfig): Renderer;

  /** Transform HTML before rendering */
  transformHtml?(html: string): string;

  /** Hydrate on client */
  hydrate?(element: unknown, props: HydrationProps): void;
}

/**
 * Configuration for adapter
 */
export interface AdapterConfig {
  /** Site configuration */
  config: DocsConfig;

  /** Theme configuration */
  theme: ThemeConfig | undefined;
}

/**
 * Renderer interface for producing HTML output
 */
export interface Renderer {
  /** Render content to HTML string */
  render(content: RenderContent): string | Promise<string>;
}

/**
 * Content to be rendered by adapter
 */
export interface RenderContent {
  /** Page frontmatter */
  frontmatter: Record<string, unknown>;

  /** Main content HTML */
  html: string;

  /** Table of contents */
  toc?: TOCItem[];

  /** Custom data for adapter */
  data?: Record<string, unknown>;
}

/**
 * Properties for client-side hydration
 */
export interface HydrationProps {
  /** Rendered content */
  content: RenderContent;

  /** Theme configuration */
  theme: ThemeConfig;
}

// ============================================================================
// Theme
// ============================================================================

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /** Site logo URL */
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

/**
 * Navigation item
 */
export interface NavItem {
  /** Display text */
  text: string;

  /** Link URL */
  link: string;

  /** Active state (optional) */
  active?: boolean;
}

/**
 * Sidebar configuration
 */
export interface SidebarConfig {
  /** Sidebar sections by base path */
  [basePath: string]: SidebarSection[];
}

/**
 * Sidebar section
 */
export interface SidebarSection {
  /** Section header text */
  text: string;

  /** Section items */
  items: SidebarItem[];

  /** Collapsible (default: true) */
  collapsible?: boolean;
}

/**
 * Sidebar item
 */
export interface SidebarItem {
  /** Display text */
  text: string;

  /** Link URL */
  link: string;
}

/**
 * Footer configuration
 */
export interface FooterConfig {
  /** Copyright message */
  message?: string;

  /** Links */
  links?: FooterLink[];
}

/**
 * Footer link
 */
export interface FooterLink {
  /** Link text */
  text: string;

  /** Link URL */
  url: string;
}

/**
 * Social links configuration
 */
export interface SocialConfig {
  /** GitHub repository */
  github?: string;

  /** Twitter/X account */
  twitter?: string;

  /** Discord server */
  discord?: string;
}

// ============================================================================
// Plugin System
// ============================================================================

/**
 * Plugin interface for extending docs-core functionality
 */
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

// ============================================================================
// Content
// ============================================================================

/**
 * Route information for a documentation page
 */
export interface Route {
  /** URL path */
  path: string;

  /** Source file path */
  filePath?: string;

  /** Frontmatter */
  frontmatter: Record<string, unknown>;

  /** Sidebar position */
  sidebarPosition?: number;

  /** Component name */
  component?: string;

  /** Layout (default, full-width, etc.) */
  layout?: string;

  /** Children (for nested routes) */
  children?: Route[];
}

/**
 * Route hierarchy for sidebar navigation
 */
export interface RouteHierarchy {
  /** Route path */
  path: string;

  /** Display title */
  text: string;

  /** Frontmatter */
  frontmatter: Record<string, unknown>;

  /** Sidebar items */
  items?: Array<{
    text: string;
    link: string;
    frontmatter: Record<string, unknown>;
  }>;

  /** Child routes */
  children?: RouteHierarchy[];
}

/**
 * Content file representation
 */
export interface ContentFile {
  /** Absolute file path */
  path: string;

  /** Relative path from source directory */
  relativePath: string;

  /** URL path */
  url: string;

  /** Frontmatter metadata */
  frontmatter: Record<string, unknown>;

  /** Raw markdown content */
  content: string;

  /** Parsed AST (populated by markdown plugin) */
  ast?: MarkdownAST;

  /** Rendered HTML (populated by renderer) */
  html?: string;
}

/**
 * Markdown AST node
 */
export interface MarkdownAST {
  /** Node type */
  type: string;

  /** Node children */
  children?: MarkdownAST[];

  /** Node value (for text nodes) */
  value?: string;

  /** Node attributes (for element nodes) */
  attributes?: Record<string, unknown>;

  /** Position in source */
  position?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

/**
 * Table of contents item
 */
export interface TOCItem {
  /** Heading text */
  text: string;

  /** Heading slug */
  slug: string;

  /** Heading level (1-6) */
  level: number;

  /** Child items */
  children?: TOCItem[];
}

// ============================================================================
// Build
// ============================================================================

/**
 * Build manifest
 */
export interface BuildManifest {
  /** Built pages */
  pages: PageInfo[];

  /** Build assets */
  assets: AssetInfo[];

  /** Build timestamp */
  buildTime: number;
}

/**
 * Page information
 */
export interface PageInfo {
  /** URL path */
  url: string;

  /** Source file path */
  filePath: string;

  /** Output file path */
  outputPath: string;

  /** Frontmatter */
  frontmatter: Record<string, unknown>;
}

/**
 * Asset information
 */
export interface AssetInfo {
  /** Source path */
  src: string;

  /** Destination path */
  dest: string;

  /** Asset type */
  type: "copy" | "generated";
}

// ============================================================================
// Dev Server
// ============================================================================

/**
 * Development server
 */
export interface DevServer {
  /** Server URL */
  url: string;

  /** Close server */
  close(): Promise<void>;
}

/**
 * Development server options
 */
export interface DevServerOptions {
  /** Port number (default: 3000) */
  port?: number;

  /** Host to bind (default: 'localhost') */
  host?: string;

  /** HTTPS configuration */
  https?: boolean | HttpsServerOptions;
}

/**
 * HTTPS server options
 */
export interface HttpsServerOptions {
  /** Key file path */
  key?: string;

  /** Certificate file path */
  cert?: string;

  /** CA file path */
  ca?: string;
}

// ============================================================================
// Lifecycle Events
// ============================================================================

/**
 * Lifecycle event types
 */
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

// ============================================================================
// Utilities
// ============================================================================

/**
 * Vite user config (subset for type safety)
 */
export interface ViteUserConfig {
  /** Base path */
  base?: string;

  /** Mode */
  mode?: string;

  /** Define */
  define?: Record<string, string>;

  /** Plugins */
  plugins?: unknown[];

  /** CSS */
  css?: {
    postcss?: string | Record<string, unknown>;
  };

  /** Build options */
  build?: {
    target?: string;
    outDir?: string;
    assetsDir?: string;
    sourcemap?: boolean | "inline" | "hidden";
    minify?: boolean | "terser" | "esbuild";
    rollupOptions?: Record<string, unknown>;
  };

  /** Server options */
  server?: {
    port?: number;
    host?: string;
    https?: boolean | HttpsServerOptions;
    proxy?: Record<string, string | Record<string, unknown>>;
  };

  /** Preview options */
  preview?: {
    port?: number;
    host?: string;
    https?: boolean | HttpsServerOptions;
  };
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** Validation errors */
  errors: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Error path */
  path: string;

  /** Error message */
  message: string;

  /** Expected value */
  expected?: unknown;

  /** Actual value */
  actual?: unknown;
}
