/**
 * @oxog/docs-core - Development Server
 * Development server with hot module replacement
 */

import {
  createServer,
  Server,
  IncomingMessage,
  ServerResponse,
} from "node:http";
import { URL } from "node:url";
import type {
  DocsConfig,
  DevServer as IDevServer,
  DevServerOptions,
} from "./types";
import { Kernel } from "./kernel";
import { Builder } from "./builder";
import { Router } from "./router";
import { ConfigLoader } from "./config";
import type { ContentFile } from "./types";

/**
 * Development server with HMR support
 */
export class DevServer implements IDevServer {
  /** Server instance */
  private server: Server | null = null;

  /** HTTP server instance */
  private httpServer: Server;

  /** Server URL */
  private _url!: string;

  /** Configuration */
  private config: DocsConfig;

  /** Kernel instance */
  private kernel: Kernel;

  /** Router instance */
  private router: Router;

  /** File watcher */
  private watcher: Map<string, "add" | "change" | "unlink"> = new Map();

  /** Rebuild debounce timer */
  private rebuildTimer: ReturnType<typeof setTimeout> | null = null;

  /** Client connections for HMR */
  private clients: Set<ServerResponse> = new Set();

  /** Whether server is running */
  private running = false;

  /**
   * Create dev server
   * @param config - Configuration
   * @param kernel - Kernel instance
   */
  constructor(config: DocsConfig, kernel: Kernel) {
    this.config = config;
    this.kernel = kernel;
    this.router = new Router(config.srcDir);

    // Create HTTP server
    this.httpServer = createServer((req, res) => this.handleRequest(req, res));
  }

  /**
   * Get server URL
   */
  get url(): string {
    return this._url;
  }

  /**
   * Start development server
   * @param options - Server options
   * @returns DevServer instance
   */
  async start(options: DevServerOptions = {}): Promise<this> {
    if (this.running) {
      return this;
    }

    const port = options.port ?? 3000;
    const host = options.host ?? "localhost";

    // Start HTTP server
    await new Promise<void>((resolve, reject) => {
      this.httpServer.on("error", reject);
      this.httpServer.listen(port, host, () => {
        this._url = `http://${host}:${port}`;
        resolve();
      });
    });

    this.running = true;

    // Initial build
    await this.build();

    // Setup file watching
    this.setupWatcher();

    // Emit dev server event
    await this.kernel.emit("onDevServer", this);

    console.log(`Dev server running at ${this._url}`);

    return this;
  }

  /**
   * Handle HTTP request
   * @param req - Incoming request
   * @param res - Server response
   */
  private async handleRequest(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    // Handle HMR endpoint
    if (url.pathname === "/__hmr") {
      this.handleHMR(res);
      return;
    }

    // Handle static files from dist
    const distDir = process.cwd();
    const filePath = this.getFilePath(url.pathname);

    if (filePath && this.fileExists(filePath)) {
      this.serveFile(res, filePath, url.pathname);
      return;
    }

    // Serve index.html for SPA fallback
    const indexPath = this.getFilePath("/index.html");
    if (indexPath && this.fileExists(indexPath)) {
      this.serveFile(res, indexPath, "/index.html");
      return;
    }

    // 404
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }

  /**
   * Get file path from URL
   * @param pathname - URL pathname
   * @returns File path or undefined
   */
  private getFilePath(pathname: string): string | undefined {
    const distDir = process.cwd();
    const outDir = this.config.outDir;

    // Normalize pathname
    let filename = pathname === "/" ? "/index.html" : pathname;
    if (!filename.endsWith(".html") && !filename.includes(".")) {
      filename = filename + "/index.html";
    }

    const filePath = require("node:path").join(
      distDir,
      outDir,
      filename.slice(1),
    );
    return filePath;
  }

  /**
   * Check if file exists
   * @param path - File path
   * @returns True if exists
   */
  private fileExists(path: string): boolean {
    try {
      const { existsSync } = require("node:fs");
      return existsSync(path);
    } catch {
      return false;
    }
  }

  /**
   * Serve file with appropriate headers
   * @param res - Server response
   * @param filePath - File path
   * @param pathname - URL pathname
   */
  private serveFile(
    res: ServerResponse,
    filePath: string,
    pathname: string,
  ): void {
    const { readFileSync, lstatSync } = require("node:fs");

    const ext = require("node:path").extname(pathname);
    const contentType = this.getContentType(ext);
    const content = readFileSync(filePath);

    // Add HMR script for HTML files
    let finalContent = content;
    if (ext === ".html") {
      const hmrScript = this.getHMRScript();
      finalContent = content
        .toString()
        .replace("</body>", `${hmrScript}</body>`);
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(finalContent);
  }

  /**
   * Get content type for file extension
   * @param ext - File extension
   * @returns Content type
   */
  private getContentType(ext: string): string {
    const types: Record<string, string> = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".eot": "application/vnd.ms-fontobject",
    };

    return types[ext] || "application/octet-stream";
  }

  /**
   * Get HMR client script
   * @returns HMR script
   */
  private getHMRScript(): string {
    return `
      <script>
        (function() {
          const url = new URL(window.location.href);
          url.pathname = '/__hmr';
          url.search = '';
          const eventSource = new EventSource(url.toString());

          eventSource.onmessage = function(event) {
            if (event.data === 'reload') {
              window.location.reload();
            }
          };

          eventSource.onerror = function() {
            eventSource.close();
          };
        })();
      </script>
    `;
  }

  /**
   * Handle HMR connection
   * @param res - Server response
   */
  private handleHMR(res: ServerResponse): void {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.write("\n");
    this.clients.add(res);

    // Send initial connection event
    res.write("data: connected\n\n");

    // Keep-alive
    const keepAlive = setInterval(() => {
      res.write(": keepalive\n\n");
    }, 30000);

    res.on("close", () => {
      clearInterval(keepAlive);
      this.clients.delete(res);
    });
  }

  /**
   * Send HMR update to all clients
   * @param data - Data to send
   */
  private sendHMR(data: string): void {
    for (const client of this.clients) {
      client.write(`data: ${data}\n\n`);
    }
  }

  /**
   * Setup file watcher
   */
  private setupWatcher(): void {
    const srcDir = require("node:path").join(process.cwd(), this.config.srcDir);
    const { watch, readdirSync, lstatSync, existsSync } = require("node:fs");

    if (!existsSync(srcDir)) {
      return;
    }

    // Watch docs directory
    watch(
      srcDir,
      { recursive: true },
      (eventType: string, filename: string | Buffer) => {
        if (!filename) return;

        const fullPath = require("node:path").join(srcDir, filename);

        // Debounce rebuilds
        if (this.rebuildTimer) {
          clearTimeout(this.rebuildTimer);
        }

        this.rebuildTimer = setTimeout(async () => {
          const type = (eventType === "rename" ? "change" : eventType) as
            | "add"
            | "change"
            | "unlink";

          console.log(`File changed: ${filename}`);

          // Emit file change event
          await this.kernel.emit("onFileChange", fullPath, type);

          // Rebuild
          await this.build();

          // Send HMR update
          this.sendHMR("reload");
        }, 100);
      },
    );
  }

  /**
   * Execute build
   */
  private async build(): Promise<void> {
    const builder = new Builder(this.config, this.kernel);
    await builder.build();
  }

  /**
   * Close server
   */
  async close(): Promise<void> {
    if (!this.running) {
      return;
    }

    // Close all HMR connections
    for (const client of this.clients) {
      client.end();
    }
    this.clients.clear();

    // Close HTTP server
    await new Promise<void>((resolve) => {
      this.httpServer.close(() => resolve());
    });

    // Destroy kernel
    await this.kernel.destroy();

    this.running = false;
    console.log("Dev server closed");
  }
}

/**
 * Create and start development server
 * @param config - Configuration
 * @param kernel - Kernel instance
 * @param options - Server options
 * @returns DevServer instance
 */
export async function createDevServer(
  config: DocsConfig,
  kernel: Kernel,
  options?: DevServerOptions,
): Promise<DevServer> {
  const server = new DevServer(config, kernel);
  await server.start(options);
  return server;
}
