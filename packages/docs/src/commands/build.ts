/**
 * @oxog/docs - Build Command
 * Build documentation for production
 */

import { ConfigLoader, Kernel, build as coreBuild } from "@oxog/docs-core";
import { detectFramework } from "../utils/framework.js";

interface BuildOptions {
  config?: string;
}

/**
 * Build documentation for production
 */
export async function build(options: BuildOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const configPath = options.config;

  console.log("Building documentation...");

  // Load configuration
  const configLoader = new ConfigLoader();
  const config = await configLoader.loadAndResolve(configPath, cwd);

  // Detect framework if not specified in config
  if (!config.adapter?.name || config.adapter.name === "vanilla") {
    const detectedFramework = detectFramework(cwd);
    if (detectedFramework && detectedFramework !== "vanilla") {
      console.log(`Detected framework: ${detectedFramework}`);
    }
  }

  // Create kernel
  const kernel = new Kernel();

  // Load plugins from config
  if (config.plugins) {
    for (const plugin of config.plugins) {
      kernel.use(plugin);
    }
  }

  // Execute build
  const manifest = await coreBuild(config, kernel);

  // Print summary
  console.log(`\nBuild complete!`);
  console.log(`  Pages: ${manifest.pages.length}`);
  console.log(`  Assets: ${manifest.assets.length}`);
  console.log(`  Time: ${manifest.buildTime}ms`);
  console.log(`\nOutput directory: ${config.outDir ?? "dist"}`);

  // Cleanup
  await kernel.destroy();
}
