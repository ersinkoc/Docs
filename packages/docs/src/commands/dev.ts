/**
 * @oxog/docs - Dev Command
 * Start development server with HMR
 */

import { ConfigLoader, Kernel, createDevServer } from "@oxog/docs-core";
import { detectFramework } from "../utils/framework.js";

interface DevOptions {
  port?: string;
  host?: string;
  config?: string;
}

/**
 * Start development server
 */
export async function dev(options: DevOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const configPath = options.config;
  const port = parseInt(options.port ?? "3000", 10);
  const host = options.host ?? "localhost";

  console.log("Starting development server...");

  // Load configuration
  const configLoader = new ConfigLoader();
  const config = await configLoader.loadAndResolve(configPath, cwd);

  // Detect framework if not specified in config
  if (!config.adapter.name || config.adapter.name === "vanilla") {
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

  // Start dev server
  const server = await createDevServer(config, kernel, {
    port,
    host,
  });

  console.log(`\nServer running at: ${server.url}`);
  console.log(`\nPress Ctrl+C to stop`);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await server.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\nShutting down...");
    await server.close();
    process.exit(0);
  });
}
