/**
 * @oxog/docs-core - Main Export
 * Framework-agnostic documentation generator engine
 */

// Core classes
export { Kernel } from "./kernel.js";
export { ConfigLoader, createDefaultConfig } from "./config.js";
export { Router, createRouter } from "./router.js";
export { Builder, build } from "./builder.js";
export { DevServer, createDevServer } from "./dev-server.js";

// Plugin exports
export * from "./plugins/index.js";

// Types
export * from "./types.js";

// Utilities
export * from "./utils/index.js";
