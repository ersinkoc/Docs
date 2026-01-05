/**
 * @oxog/docs - Framework Detection Utilities
 */

import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

/**
 * Detect framework from package.json
 * @param cwd - Working directory
 * @returns Detected framework or undefined
 */
export function detectFramework(cwd: string): string | undefined {
  const pkgPath = join(cwd, "package.json");

  if (!existsSync(pkgPath)) {
    return undefined;
  }

  try {
    const content = readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(content);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Check for React
    if (deps.react || deps["react-dom"]) {
      return "react";
    }

    // Check for Vue
    if (deps.vue) {
      return "vue";
    }

    // Check for Svelte
    if (deps.svelte) {
      return "svelte";
    }

    // Check for Solid
    if (deps["solid-js"]) {
      return "solid";
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Get adapter import path for framework
 * @param framework - Framework name
 * @returns Adapter package name
 */
export function getAdapterPackage(framework: string): string {
  const adapters: Record<string, string> = {
    react: "@oxog/docs-react",
    vue: "@oxog/docs-vue",
    svelte: "@oxog/docs-svelte",
    solid: "@oxog/docs-solid",
    vanilla: "@oxog/docs-vanilla",
  };

  return adapters[framework] ?? adapters.vanilla;
}

/**
 * Get adapter factory name
 * @param framework - Framework name
 * @returns Factory function name
 */
export function getAdapterFactory(framework: string): string {
  const factories: Record<string, string> = {
    react: "react()",
    vue: "vue()",
    svelte: "svelte()",
    solid: "solid()",
    vanilla: "vanilla()",
  };

  return factories[framework] ?? factories.vanilla;
}
