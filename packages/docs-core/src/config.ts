/**
 * @oxog/docs-core - Configuration Loader
 * Handles configuration file detection, loading, and validation
 */

import { join, dirname, extname, basename, relative } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import type {
  DocsConfig,
  Adapter,
  ValidationResult,
  ValidationError,
} from "./types";

/**
 * Configuration file names to detect
 */
const CONFIG_FILE_NAMES = [
  "docs.config.ts",
  "docs.config.mts",
  "docs.config.js",
  "docs.config.mjs",
];

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<DocsConfig> = {
  srcDir: "docs",
  outDir: "dist",
  base: "/",
  description: "",
};

/**
 * Raw configuration (before resolution)
 */
export interface RawConfig {
  /** Site title */
  title?: string;

  /** Site description */
  description?: string;

  /** Base URL path */
  base?: string;

  /** Source directory */
  srcDir?: string;

  /** Output directory */
  outDir?: string;

  /** Framework adapter */
  adapter?: Adapter | (() => Adapter);

  /** Theme configuration */
  theme?: unknown;

  /** Plugins */
  plugins?: unknown[];

  /** Vite config */
  vite?: unknown;
}

/**
 * Config resolver interface
 */
interface ConfigResolver {
  /** Supported file extensions */
  extensions: string[];

  /** Load configuration from file */
  load(path: string): Promise<RawConfig>;
}

/**
 * TypeScript config resolver
 */
class TypeScriptResolver implements ConfigResolver {
  extensions = [".ts", ".mts"];

  async load(path: string): Promise<RawConfig> {
    // Dynamic import for ESM TypeScript
    const mod = await import(path);
    return mod.default ?? mod;
  }
}

/**
 * JavaScript config resolver
 */
class JavaScriptResolver implements ConfigResolver {
  extensions = [".js", ".mjs"];

  async load(path: string): Promise<RawConfig> {
    const mod = await import(path);
    return mod.default ?? mod;
  }
}

/**
 * Configuration loader class
 */
export class ConfigLoader {
  /** Resolvers for different file types */
  private resolvers: ConfigResolver[] = [
    new TypeScriptResolver(),
    new JavaScriptResolver(),
  ];

  /**
   * Detect configuration file path
   * @param cwd - Working directory
   * @returns Configuration file path or undefined
   */
  detectConfigPath(cwd: string = process.cwd()): string | undefined {
    for (const name of CONFIG_FILE_NAMES) {
      const path = join(cwd, name);
      if (existsSync(path)) {
        return path;
      }
    }
    return undefined;
  }

  /**
   * Get resolver for file extension
   * @param path - File path
   * @returns Resolver or undefined
   */
  private getResolver(path: string): ConfigResolver | undefined {
    const ext = extname(path);
    return this.resolvers.find((r) => r.extensions.includes(ext));
  }

  /**
   * Load configuration from file
   * @param configPath - Path to config file
   * @returns Raw configuration
   */
  async load(configPath?: string): Promise<RawConfig> {
    const path = configPath ?? this.detectConfigPath();

    if (!path) {
      return {};
    }

    const resolver = this.getResolver(path);
    if (!resolver) {
      throw new Error(`Unsupported config file extension: ${extname(path)}`);
    }

    if (!existsSync(path)) {
      throw new Error(`Config file not found: ${path}`);
    }

    return resolver.load(path);
  }

  /**
   * Resolve configuration with defaults and validation
   * @param rawConfig - Raw configuration
   * @param configPath - Path to config file (for resolution)
   * @returns Resolved configuration
   */
  async resolve(
    rawConfig: RawConfig,
    configPath?: string,
  ): Promise<DocsConfig> {
    // Apply defaults
    const config: DocsConfig = {
      title: rawConfig.title ?? "Documentation",
      description: rawConfig.description ?? DEFAULT_CONFIG.description!,
      base: rawConfig.base ?? DEFAULT_CONFIG.base!,
      srcDir: rawConfig.srcDir ?? DEFAULT_CONFIG.srcDir!,
      outDir: rawConfig.outDir ?? DEFAULT_CONFIG.outDir!,
      adapter: this.resolveAdapter(rawConfig.adapter),
      theme: rawConfig.theme as DocsConfig["theme"],
      plugins: rawConfig.plugins as DocsConfig["plugins"],
      vite: rawConfig.vite as DocsConfig["vite"],
    };

    return config;
  }

  /**
   * Resolve adapter from raw config
   * @param adapter - Raw adapter value
   * @returns Resolved adapter
   */
  private resolveAdapter(adapter?: Adapter | (() => Adapter)): Adapter {
    if (!adapter) {
      throw new Error("Adapter is required");
    }

    if (typeof adapter === "function") {
      return adapter();
    }

    return adapter;
  }

  /**
   * Validate configuration
   * @param config - Configuration to validate
   * @returns Validation result
   */
  validate(config: DocsConfig): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate title
    if (!config.title || typeof config.title !== "string") {
      errors.push({
        path: "title",
        message: "Title is required and must be a string",
        expected: "string",
        actual: typeof config.title,
      });
    }

    // Validate adapter
    if (!config.adapter) {
      errors.push({
        path: "adapter",
        message: "Adapter is required",
        expected: "Adapter",
        actual: undefined,
      });
    } else if (!config.adapter.name) {
      errors.push({
        path: "adapter.name",
        message: "Adapter name is required",
        expected: "string",
        actual: undefined,
      });
    }

    // Validate srcDir
    if (config.srcDir && typeof config.srcDir !== "string") {
      errors.push({
        path: "srcDir",
        message: "srcDir must be a string",
        expected: "string",
        actual: typeof config.srcDir,
      });
    }

    // Validate outDir
    if (config.outDir && typeof config.outDir !== "string") {
      errors.push({
        path: "outDir",
        message: "outDir must be a string",
        expected: "string",
        actual: typeof config.outDir,
      });
    }

    // Validate base
    if (config.base !== undefined && typeof config.base !== "string") {
      errors.push({
        path: "base",
        message: "base must be a string",
        expected: "string",
        actual: typeof config.base,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Load and resolve configuration
   * @param configPath - Optional config file path
   * @param cwd - Working directory
   * @returns Resolved configuration
   */
  async loadAndResolve(
    configPath?: string,
    cwd: string = process.cwd(),
  ): Promise<DocsConfig> {
    const rawConfig = await this.load(configPath);
    const resolvedConfig = await this.resolve(rawConfig, configPath);

    // Validate
    const validation = this.validate(resolvedConfig);
    if (!validation.valid) {
      const errorMessages = validation.errors
        .map((e) => `${e.path}: ${e.message}`)
        .join("\n");
      throw new Error(`Configuration validation failed:\n${errorMessages}`);
    }

    return resolvedConfig;
  }
}

/**
 * Create a default configuration
 * @param adapter - Adapter to use
 * @returns Default configuration
 */
export function createDefaultConfig(adapter: Adapter): DocsConfig {
  return {
    title: "Documentation",
    description: "",
    base: "/",
    srcDir: "docs",
    outDir: "dist",
    adapter,
    theme: undefined,
    plugins: [],
    vite: undefined,
  };
}
