/**
 * @oxog/docs-core - DevServer Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { DocsConfig, DevServerOptions } from "../src/types";
import { Kernel } from "../src/kernel";

// We need to mock the http module before importing
const mockServer = {
  on: vi.fn(),
  listen: vi.fn((port, host, callback) => {
    if (typeof host === "function") {
      callback();
    } else {
      callback();
    }
    return mockServer;
  }),
  close: vi.fn((callback) => {
    if (callback) callback();
    return mockServer;
  }),
};

const mockCreateServer = vi.fn(() => mockServer);

vi.mock("node:http", () => ({
  createServer: mockCreateServer,
  Server: class {},
  IncomingMessage: class {},
  ServerResponse: class {},
}));

describe("DevServer", () => {
  let DevServer: typeof import("../src/dev-server").DevServer;
  let createDevServer: typeof import("../src/dev-server").createDevServer;
  let kernel: Kernel;
  let mockConfig: DocsConfig;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../src/dev-server");
    DevServer = module.DevServer;
    createDevServer = module.createDevServer;

    kernel = new Kernel();

    mockConfig = {
      title: "Test Docs",
      srcDir: "docs",
      outDir: "dist",
      adapter: {
        name: "vanilla",
        createRenderer: () => ({
          name: "vanilla",
          render: async () => "<div></div>",
        }),
        transformHtml: (html) => html,
        hydrate: () => {},
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create server instance", () => {
      const server = new DevServer(mockConfig, kernel);
      expect(server).toBeDefined();
    });

    it("should create HTTP server", () => {
      new DevServer(mockConfig, kernel);
      expect(mockCreateServer).toHaveBeenCalled();
    });

    it("should create router with correct srcDir", () => {
      const server = new DevServer(mockConfig, kernel);
      // Router should be created internally
      expect(server).toBeDefined();
    });
  });

  describe("getContentType", () => {
    it("should return correct content types", () => {
      const server = new DevServer(mockConfig, kernel);

      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".html")).toBe("text/html; charset=utf-8");
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".css")).toBe("text/css; charset=utf-8");
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".js")).toBe("application/javascript; charset=utf-8");
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".json")).toBe("application/json; charset=utf-8");
    });

    it("should return octet-stream for unknown types", () => {
      const server = new DevServer(mockConfig, kernel);
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".unknown")).toBe("application/octet-stream");
    });

    it("should return correct image types", () => {
      const server = new DevServer(mockConfig, kernel);
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".png")).toBe("image/png");
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".jpg")).toBe("image/jpeg");
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".svg")).toBe("image/svg+xml");
    });

    it("should return correct font types", () => {
      const server = new DevServer(mockConfig, kernel);
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".woff")).toBe("font/woff");
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".woff2")).toBe("font/woff2");
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".ttf")).toBe("font/ttf");
    });

    it("should return correct content types for other files", () => {
      const server = new DevServer(mockConfig, kernel);
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".gif")).toBe("image/gif");
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".ico")).toBe("image/x-icon");
      expect((server as unknown as { getContentType: (ext: string) => string }).getContentType(".eot")).toBe("application/vnd.ms-fontobject");
    });
  });

  describe("getHMRScript", () => {
    it("should return HMR script", () => {
      const server = new DevServer(mockConfig, kernel);
      const script = (server as unknown as { getHMRScript: () => string }).getHMRScript();

      expect(script).toContain("EventSource");
      expect(script).toContain("/__hmr");
      expect(script).toContain("window.location.reload");
    });

    it("should include event source error handling", () => {
      const server = new DevServer(mockConfig, kernel);
      const script = (server as unknown as { getHMRScript: () => string }).getHMRScript();
      expect(script).toContain("eventSource.onerror");
      expect(script).toContain("eventSource.close");
    });
  });

  describe("fileExists", () => {
    it("should return true for existing file", () => {
      const server = new DevServer(mockConfig, kernel);
      // Use a file that exists
      const result = (server as unknown as { fileExists: (path: string) => boolean }).fileExists(__filename);
      expect(result).toBe(true);
    });

    it("should return false for non-existing file", () => {
      const server = new DevServer(mockConfig, kernel);
      const result = (server as unknown as { fileExists: (path: string) => boolean }).fileExists("/non/existent/file.txt");
      expect(result).toBe(false);
    });

    it("should return false for invalid path", () => {
      const server = new DevServer(mockConfig, kernel);
      const result = (server as unknown as { fileExists: (path: string) => boolean }).fileExists("");
      expect(result).toBe(false);
    });
  });

  describe("getFilePath", () => {
    it("should return index.html for root path", () => {
      const server = new DevServer(mockConfig, kernel);
      const path = (server as unknown as { getFilePath: (pathname: string) => string | undefined }).getFilePath("/");
      expect(path).toContain("index.html");
    });

    it("should return correct file path for pathname", () => {
      const server = new DevServer(mockConfig, kernel);
      const path = (server as unknown as { getFilePath: (pathname: string) => string | undefined }).getFilePath("/docs/page");
      expect(path).toContain("docs");
      expect(path).toContain("page");
    });

    it("should handle paths without extension", () => {
      const server = new DevServer(mockConfig, kernel);
      const path = (server as unknown as { getFilePath: (pathname: string) => string | undefined }).getFilePath("/about");
      expect(path).toContain("about");
    });

    it("should add /index.html for paths without extension", () => {
      const server = new DevServer(mockConfig, kernel);
      const path = (server as unknown as { getFilePath: (pathname: string) => string | undefined }).getFilePath("/about");
      expect(path).toContain("index.html");
    });

    it("should handle nested paths", () => {
      const server = new DevServer(mockConfig, kernel);
      const path = (server as unknown as { getFilePath: (pathname: string) => string | undefined }).getFilePath("/docs/api/reference");
      expect(path).toContain("docs");
      expect(path).toContain("api");
      expect(path).toContain("reference");
    });

    it("should preserve .html extension", () => {
      const server = new DevServer(mockConfig, kernel);
      const path = (server as unknown as { getFilePath: (pathname: string) => string | undefined }).getFilePath("/docs/page.html");
      expect(path).toContain(".html");
    });
  });

  describe("sendHMR", () => {
    it("should send data to clients", () => {
      const server = new DevServer(mockConfig, kernel);
      const mockRes = {
        write: vi.fn(),
        end: vi.fn(),
      };

      // Add a mock client
      (server as unknown as { clients: Set<unknown> }).clients.add(mockRes as unknown);

      (server as unknown as { sendHMR: (data: string) => void }).sendHMR("reload");

      expect(mockRes.write).toHaveBeenCalledWith("data: reload\n\n");
    });

    it("should handle multiple clients", () => {
      const server = new DevServer(mockConfig, kernel);
      const mockRes1 = { write: vi.fn(), end: vi.fn() };
      const mockRes2 = { write: vi.fn(), end: vi.fn() };

      (server as unknown as { clients: Set<unknown> }).clients.add(mockRes1 as unknown);
      (server as unknown as { clients: Set<unknown> }).clients.add(mockRes2 as unknown);

      (server as unknown as { sendHMR: (data: string) => void }).sendHMR("update");

      expect(mockRes1.write).toHaveBeenCalled();
      expect(mockRes2.write).toHaveBeenCalled();
    });

    it("should handle empty clients", () => {
      const server = new DevServer(mockConfig, kernel);
      expect(() => {
        (server as unknown as { sendHMR: (data: string) => void }).sendHMR("test");
      }).not.toThrow();
    });
  });

  describe("close", () => {
    it("should do nothing if not running", async () => {
      const server = new DevServer(mockConfig, kernel);
      await expect(server.close()).resolves.not.toThrow();
    });

    it("should clear clients when closing", async () => {
      const server = new DevServer(mockConfig, kernel);
      const mockRes = { write: vi.fn(), end: vi.fn() };
      (server as unknown as { clients: Set<unknown> }).clients.add(mockRes as unknown);
      (server as unknown as { running: boolean }).running = true;

      await server.close();

      expect((server as unknown as { clients: Set<unknown> }).clients.size).toBe(0);
    });
  });

  describe("start", () => {
    it("should return immediately if already running", async () => {
      const server = new DevServer(mockConfig, kernel);
      (server as unknown as { running: boolean }).running = true;

      const result = await server.start();
      expect(result).toBe(server);
    });

    it("should start with custom port and host", async () => {
      const server = new DevServer(mockConfig, kernel);
      await server.start({ port: 9999, host: "0.0.0.0" });
      expect(server).toBeDefined();
      await server.close();
    });

    it("should set url after starting", async () => {
      const server = new DevServer(mockConfig, kernel);
      await server.start({ port: 3456, host: "localhost" });
      expect(server.url).toContain("localhost:3456");
      await server.close();
    });
  });

  describe("handleHMR", () => {
    it("should add client to clients set", () => {
      const server = new DevServer(mockConfig, kernel);
      const mockRes = {
        writeHead: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
        on: vi.fn(),
      };

      (server as unknown as { handleHMR: (res: unknown) => void }).handleHMR(mockRes);

      expect((server as unknown as { clients: Set<unknown> }).clients.has(mockRes)).toBe(true);
    });

    it("should send connected event", () => {
      const server = new DevServer(mockConfig, kernel);
      const mockRes = {
        writeHead: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
        on: vi.fn(),
      };

      (server as unknown as { handleHMR: (res: unknown) => void }).handleHMR(mockRes);

      expect(mockRes.write).toHaveBeenCalledWith("data: connected\n\n");
    });

    it("should set correct headers", () => {
      const server = new DevServer(mockConfig, kernel);
      const mockRes = {
        writeHead: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
        on: vi.fn(),
      };

      (server as unknown as { handleHMR: (res: unknown) => void }).handleHMR(mockRes);

      expect(mockRes.writeHead).toHaveBeenCalledWith(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
    });
  });

  describe("createDevServer function", () => {
    it("should create and start server", async () => {
      const server = await createDevServer(mockConfig, kernel, { port: 3456, host: "127.0.0.1" });
      expect(server).toBeDefined();
      await server.close();
    });

    it("should use default options when not provided", async () => {
      const server = await createDevServer(mockConfig, kernel);
      expect(server).toBeDefined();
      await server.close();
    });
  });
});
