/**
 * @oxog/docs-core - Micro Kernel Implementation
 * Plugin registry and lifecycle management
 */

import type {
  DocsPlugin,
  LifecycleEvents,
  DocsConfig,
  ContentFile,
  MarkdownAST,
  BuildManifest,
  DevServer,
  PageInfo,
  AssetInfo,
} from "./types";

/**
 * Event callback type for lifecycle events
 */
type EventCallback<K extends keyof LifecycleEvents> = (
  ...args: LifecycleEvents[K]
) => void | Promise<void>;

/**
 * Kernel class - core of the micro-kernel architecture
 * Manages plugins and provides lifecycle hooks
 */
export class Kernel {
  /** Registered plugins */
  private plugins: Map<string, DocsPlugin> = new Map();

  /** Event listeners */
  private listeners: Map<
    keyof LifecycleEvents,
    Set<EventCallback<keyof LifecycleEvents>>
  > = new Map();

  /** Plugin order for deterministic execution */
  private pluginOrder: string[] = [];

  /** Whether kernel is destroyed */
  private destroyed = false;

  /**
   * Register a plugin
   * @param plugin - Plugin to register
   * @returns Kernel instance for chaining
   */
  use<T extends DocsPlugin>(plugin: T): this {
    if (this.destroyed) {
      throw new Error("Cannot use plugin on destroyed kernel");
    }

    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already registered`);
    }

    this.plugins.set(plugin.name, plugin);
    this.pluginOrder.push(plugin.name);

    return this;
  }

  /**
   * Get a registered plugin
   * @param name - Plugin name
   * @returns Plugin if found, undefined otherwise
   */
  getPlugin(name: string): DocsPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * List all registered plugins
   * @returns Array of registered plugins
   */
  listPlugins(): DocsPlugin[] {
    return this.pluginOrder
      .map((name) => this.plugins.get(name)!)
      .filter(Boolean);
  }

  /**
   * Register an event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  on<K extends keyof LifecycleEvents>(
    event: K,
    callback: EventCallback<K>,
  ): void {
    if (this.destroyed) {
      return;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners
      .get(event)!
      .add(callback as EventCallback<keyof LifecycleEvents>);
  }

  /**
   * Remove an event listener
   * @param event - Event name
   * @param callback - Callback function to remove
   */
  off<K extends keyof LifecycleEvents>(
    event: K,
    callback: EventCallback<K>,
  ): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback<keyof LifecycleEvents>);
    }
  }

  /**
   * Emit an event to all listeners
   * @param event - Event name
   * @param args - Arguments to pass to callbacks
   */
  async emit<K extends keyof LifecycleEvents>(
    event: K,
    ...args: LifecycleEvents[K]
  ): Promise<void> {
    if (this.destroyed) {
      return;
    }

    const callbacks = this.listeners.get(event);
    if (!callbacks) {
      return;
    }

    const errors: Error[] = [];

    for (const callback of callbacks) {
      try {
        const result = callback(...args);
        if (result instanceof Promise) {
          await result;
        }
      } catch (error) {
        errors.push(error as Error);
      }
    }

    // Emit collected errors after all callbacks have been processed
    for (const error of errors) {
      await this.emit("onError", error);
    }
  }

  /**
   * Execute a function with error boundary
   * @param fn - Function to execute
   * @returns Result of the function
   */
  runWithErrorBoundary<T>(fn: () => T): T {
    try {
      return fn();
    } catch (error) {
      this.emit("onError", error as Error);
      throw error;
    }
  }

  /**
   * Execute a function with async error boundary
   * @param fn - Async function to execute
   * @returns Promise resolving to result
   */
  async runWithErrorBoundaryAsync<T>(fn: () => T | Promise<T>): Promise<T> {
    try {
      const result = fn();
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    } catch (error) {
      await this.emit("onError", error as Error);
      throw error;
    }
  }

  /**
   * Get plugin execution order
   * @returns Array of plugin names in execution order
   */
  getPluginOrder(): string[] {
    return [...this.pluginOrder];
  }

  /**
   * Check if kernel is destroyed
   * @returns True if destroyed
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * Destroy the kernel and all plugins
   */
  async destroy(): Promise<void> {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;

    // Call onDestroy on all plugins in reverse order
    for (let i = this.pluginOrder.length - 1; i >= 0; i--) {
      const pluginName = this.pluginOrder[i];
      if (!pluginName) continue;
      const plugin = this.plugins.get(pluginName);
      if (plugin?.onDestroy) {
        try {
          await plugin.onDestroy();
        } catch (error) {
          this.emit("onError", error as Error);
        }
      }
    }

    // Clear all data
    this.plugins.clear();
    this.listeners.clear();
    this.pluginOrder = [];
  }
}

/**
 * Plugin API utilities for creating plugins
 */
export namespace PluginAPI {
  /**
   * Create a config modifier plugin
   * @param modifier - Function to modify config
   * @returns Plugin
   */
  export function config(
    modifier: (config: DocsConfig) => DocsConfig,
  ): DocsPlugin {
    return {
      name: "config-modifier",
      version: "1.0.0",
      onConfig: async (config) => modifier(config),
    };
  }

  /**
   * Create a content processor plugin
   * @param processor - Function to process content files
   * @returns Plugin
   */
  export function content(
    processor: (files: ContentFile[]) => ContentFile[] | Promise<ContentFile[]>,
  ): DocsPlugin {
    return {
      name: "content-processor",
      version: "1.0.0",
      onContentLoad: processor,
    };
  }

  /**
   * Create a markdown transformer plugin
   * @param transformer - Function to transform markdown AST
   * @returns Plugin
   */
  export function markdown(
    transformer: (
      ast: MarkdownAST,
      file: ContentFile,
    ) => MarkdownAST | Promise<MarkdownAST>,
  ): DocsPlugin {
    return {
      name: "markdown-transformer",
      version: "1.0.0",
      onMarkdownParse: transformer,
    };
  }

  /**
   * Create an HTML transformer plugin
   * @param transformer - Function to transform HTML
   * @returns Plugin
   */
  export function html(
    transformer: (html: string, file: ContentFile) => string | Promise<string>,
  ): DocsPlugin {
    return {
      name: "html-transformer",
      version: "1.0.0",
      onHtmlRender: transformer,
    };
  }
}
