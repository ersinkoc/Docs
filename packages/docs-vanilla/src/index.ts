/**
 * @oxog/docs-vanilla - Main Export
 * Plain HTML adapter for @oxog/docs
 */

// Adapter
export { createVanillaAdapter, vanillaAdapter } from "./adapter.js";
export type { VanillaAdapterOptions } from "./adapter.js";

// Web Components
export {
  DocsLayoutElement,
  registerWebComponents,
} from "./components/web-components.js";

// Types
export type { Adapter, RenderContent, HydrationProps } from "@oxog/docs-core";
