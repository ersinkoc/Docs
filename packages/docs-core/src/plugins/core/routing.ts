/**
 * @oxog/docs-core - Routing Plugin
 * File-based routing resolution
 */

import type { DocsPlugin, ContentFile, Route } from "../../types.js";
import { Router } from "../../router.js";

/**
 * Create routing plugin
 * @param srcDir - Source directory
 * @returns Routing plugin
 */
export function createRoutingPlugin(srcDir: string = "docs"): DocsPlugin {
  const router = new Router(srcDir);

  return {
    name: "routing",
    version: "1.0.0",

    onContentLoad: async (files: ContentFile[]) => {
      const routes = router.generateRoutes(files);

      // Add route URLs to files
      return files.map((file) => {
        const route = router.match(file.relativePath);
        if (route) {
          return {
            ...file,
            url: route.path,
          };
        }
        return file;
      });
    },
  };
}

/**
 * Create routing plugin with router instance
 * @param router - Router instance
 * @returns Routing plugin
 */
export function createRoutingPluginWithRouter(router: Router): DocsPlugin {
  return {
    name: "routing",
    version: "1.0.0",

    onContentLoad: async (files: ContentFile[]) => {
      const routes = router.generateRoutes(files);

      // Add route URLs to files
      return files.map((file) => {
        const route = router.match(file.relativePath);
        if (route) {
          return {
            ...file,
            url: route.path,
          };
        }
        return file;
      });
    },
  };
}

/**
 * Get routes from router
 * @param srcDir - Source directory
 * @returns Routes
 */
export async function getRoutes(srcDir: string = "docs"): Promise<Route[]> {
  const router = new Router(srcDir);
  const files = await router.scan(srcDir);
  return router.generateRoutes(files);
}

// Export plugin instance with default srcDir
export const routingPlugin = createRoutingPlugin();
