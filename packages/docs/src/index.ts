/**
 * @oxog/docs - Main Export
 * CLI and programmatic API for documentation generation
 */

// CLI exports
export { cli } from "./cli.js";

// Command exports
export { init } from "./commands/init.js";
export { dev } from "./commands/dev.js";
export { build } from "./commands/build.js";
export { preview } from "./commands/preview.js";
export { newPage } from "./commands/new.js";

// Utility exports
export {
  detectFramework,
  getAdapterPackage,
  getAdapterFactory,
} from "./utils/framework.js";

// Re-export from docs-core
export type {
  DocsConfig,
  DocsPlugin,
  Adapter,
  ContentFile,
  BuildManifest,
  DevServer,
  ThemeConfig,
} from "@oxog/docs-core";
export {
  Kernel,
  ConfigLoader,
  Router,
  Builder,
  DevServer as DevServerClass,
} from "@oxog/docs-core";

/**
 * Define documentation configuration
 * @param config - Documentation configuration
 * @returns Configuration object
 *
 * @example
 * import { defineConfig } from '@oxog/docs'
 * import react from '@oxog/docs-react'
 *
 * export default defineConfig({
 *   title: 'My Docs',
 *   adapter: react()
 * })
 */
export function defineConfig(config: DocsConfig): DocsConfig {
  return config;
}

/**
 * Create documentation instance
 * @param options - Documentation options
 * @returns Documentation instance
 *
 * @example
 * import { createDocs } from '@oxog/docs'
 *
 * const docs = await createDocs({
 *   root: './docs',
 *   config: './docs.config.js'
 * })
 *
 * await docs.build()
 */
export async function createDocs(options: {
  root?: string;
  config?: string;
}): Promise<DocsInstance> {
  const { root = process.cwd(), config } = options;

  const configLoader = new ConfigLoader();
  const docsConfig = await configLoader.loadAndResolve(config, root);

  const kernel = new Kernel();

  // Load plugins
  if (docsConfig.plugins) {
    for (const plugin of docsConfig.plugins) {
      kernel.use(plugin);
    }
  }

  return new DocsInstance(docsConfig, kernel);
}

/**
 * Documentation instance
 */
export class DocsInstance {
  /** Configuration */
  private config: DocsConfig;

  /** Kernel instance */
  private kernel: Kernel;

  /**
   * Create documentation instance
   * @param config - Documentation configuration
   * @param kernel - Kernel instance
   */
  constructor(config: DocsConfig, kernel: Kernel) {
    this.config = config;
    this.kernel = kernel;
  }

  /**
   * Build documentation
   * @returns Build manifest
   */
  async build(): Promise<import("@oxog/docs-core").BuildManifest> {
    const { build } = await import("@oxog/docs-core");
    return build(this.config, this.kernel);
  }

  /**
   * Start development server
   * @param options - Server options
   * @returns Dev server instance
   */
  async serve(options?: {
    port?: number;
    host?: string;
  }): Promise<import("@oxog/docs-core").DevServer> {
    const { createDevServer } = await import("@oxog/docs-core");
    return createDevServer(this.config, this.kernel, options);
  }

  /**
   * Get configuration
   * @returns Documentation configuration
   */
  getConfig(): DocsConfig {
    return this.config;
  }

  /**
   * Get registered plugins
   * @returns Array of registered plugins
   */
  getPlugins(): DocsPlugin[] {
    return this.kernel.listPlugins();
  }

  /**
   * Destroy instance and cleanup
   */
  async destroy(): Promise<void> {
    await this.kernel.destroy();
  }
}
