/**
 * @oxog/docs - Preview Command
 * Preview production build locally
 */

import { join } from "node:path";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { ConfigLoader } from "@oxog/docs-core";

interface PreviewOptions {
  port?: string;
  host?: string;
}

/**
 * Preview production build
 */
export async function preview(options: PreviewOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const port = parseInt(options.port ?? "4173", 10);
  const host = options.host ?? "localhost";

  // Load config to get output directory
  const configLoader = new ConfigLoader();
  const rawConfig = await configLoader.load();
  const outDir = join(cwd, rawConfig.outDir ?? "dist");

  if (!existsSync(outDir)) {
    console.error(`Output directory not found: ${outDir}`);
    console.error('Run "npx @oxog/docs build" first.');
    process.exit(1);
  }

  console.log(`Previewing: http://${host}:${port}`);

  // Create static server
  const server = createServer((req, res) => {
    let url = req.url ?? "/";

    // Remove query string
    url = url.split("?")[0];

    // Default to index.html
    if (url === "/") {
      url = "/index.html";
    }

    const filePath = join(outDir, url.slice(1));

    if (existsSync(filePath)) {
      const content = readFileSync(filePath);
      const ext = filePath.split(".").pop() ?? "";
      const contentType = getContentType(ext);

      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    } else {
      // Try index.html for SPA routing
      const indexPath = join(outDir, "index.html");
      if (existsSync(indexPath)) {
        const content = readFileSync(indexPath);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content);
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    }
  });

  server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
    console.log(`Press Ctrl+C to stop`);
  });

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\nShutting down...");
    server.close(() => {
      process.exit(0);
    });
  });

  process.on("SIGTERM", () => {
    console.log("\nShutting down...");
    server.close(() => {
      process.exit(0);
    });
  });
}

/**
 * Get content type for file extension
 */
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    html: "text/html; charset=utf-8",
    css: "text/css; charset=utf-8",
    js: "application/javascript; charset=utf-8",
    json: "application/json; charset=utf-8",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    woff: "font/woff",
    woff2: "font/woff2",
  };

  return types[ext] ?? "application/octet-stream";
}
