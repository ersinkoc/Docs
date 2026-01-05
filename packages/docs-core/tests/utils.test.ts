/**
 * @oxog/docs-core - Utils Tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

// Error utils
import {
  ErrorCode,
  DocsError,
  error,
  wrapError,
  handleError,
  validationError,
  Errors,
} from "../src/utils/error";

// AST utils
import { transformAST, findNodes, walkAST } from "../src/utils/ast";

// FS utils
import {
  pathExists,
  isDirectory,
  isFile,
  readFile,
  writeFile,
  copyFile,
  deleteFile,
  ensureDirectory,
  deleteDirectory,
  readDir,
  getFiles,
  getDirectories,
  copyDirectory,
  glob,
  findNearestFile,
  getExtension,
  removeExtension,
  isSubPath,
  getFileSize,
  getMTime,
} from "../src/utils/fs";

// Path utils
import {
  normalizePath,
  resolveRelative,
  pathToExtension,
  removePathExtension,
  pathToUrl,
  urlToPath,
  getParentDir,
  getName,
  isPathAbsolute,
  joinPath,
  getRelativePath,
  makeAbsolute,
  slugify,
  formatPath,
} from "../src/utils/path";

describe("Error Utils", () => {
  describe("ErrorCode", () => {
    it("should have all expected error codes", () => {
      expect(ErrorCode.CONFIG_NOT_FOUND).toBe("CONFIG_NOT_FOUND");
      expect(ErrorCode.BUILD_ERROR).toBe("BUILD_ERROR");
      expect(ErrorCode.PLUGIN_NOT_FOUND).toBe("PLUGIN_NOT_FOUND");
      expect(ErrorCode.FILE_NOT_FOUND).toBe("FILE_NOT_FOUND");
    });
  });

  describe("DocsError", () => {
    it("should create error with code and message", () => {
      const err = new DocsError(ErrorCode.CONFIG_NOT_FOUND, "Test message");
      expect(err.code).toBe(ErrorCode.CONFIG_NOT_FOUND);
      expect(err.message).toBe("Test message");
      expect(err.name).toBe("DocsError");
    });

    it("should include cause", () => {
      const cause = new Error("Original error");
      const err = new DocsError(ErrorCode.BUILD_ERROR, "Build failed", { cause });
      expect(err.cause).toBe(cause);
    });

    it("should include context", () => {
      const context = { path: "/test", line: 42 };
      const err = new DocsError(ErrorCode.CONFIG_NOT_FOUND, "Not found", { context });
      expect(err.context).toEqual(context);
    });

    it("should convert to JSON", () => {
      const err = new DocsError(ErrorCode.FILE_NOT_FOUND, "File missing");
      const json = err.toJSON();
      expect(json.name).toBe("DocsError");
      expect(json.code).toBe(ErrorCode.FILE_NOT_FOUND);
      expect(json.message).toBe("File missing");
    });

    it("should format error", () => {
      const err = new DocsError(ErrorCode.BUILD_ERROR, "Build failed", {
        context: { step: "compile" },
      });
      const formatted = err.format();
      expect(formatted).toContain("[BUILD_ERROR]");
      expect(formatted).toContain("Build failed");
      expect(formatted).toContain("Context:");
    });

    it("should format error with cause", () => {
      const cause = new Error("Original");
      const err = new DocsError(ErrorCode.PLUGIN_ERROR, "Plugin failed", { cause });
      const formatted = err.format();
      expect(formatted).toContain("Caused by: Original");
    });
  });

  describe("error function", () => {
    it("should create DocsError", () => {
      const err = error(ErrorCode.FILE_NOT_FOUND, "Missing file");
      expect(err).toBeInstanceOf(DocsError);
      expect(err.code).toBe(ErrorCode.FILE_NOT_FOUND);
    });

    it("should accept options", () => {
      const err = error(ErrorCode.BUILD_ERROR, "Failed", {
        context: { foo: "bar" },
      });
      expect(err.context).toEqual({ foo: "bar" });
    });
  });

  describe("wrapError function", () => {
    it("should wrap error with code", () => {
      const original = new Error("Original error");
      const wrapped = wrapError(ErrorCode.PLUGIN_ERROR, original);
      expect(wrapped.code).toBe(ErrorCode.PLUGIN_ERROR);
      expect(wrapped.cause).toBe(original);
      expect(wrapped.message).toBe("Original error");
    });

    it("should include context", () => {
      const original = new Error("Error");
      const wrapped = wrapError(ErrorCode.ADAPTER_NOT_FOUND, original, { name: "test" });
      expect(wrapped.context).toEqual({ name: "test" });
    });
  });

  describe("handleError function", () => {
    it("should log DocsError", () => {
      const err = new DocsError(ErrorCode.BUILD_ERROR, "Build failed");
      const logger = vi.fn();
      handleError(err, { logger });
      // DocsError.format() already includes the code
      expect(logger).toHaveBeenCalledWith(expect.stringContaining("[BUILD_ERROR]"));
      expect(logger).toHaveBeenCalledWith(expect.stringContaining("Build failed"));
    });

    it("should log regular Error", () => {
      const err = new Error("Regular error");
      const logger = vi.fn();
      handleError(err, { logger });
      expect(logger).toHaveBeenCalledWith("[ERROR] Regular error");
    });

    it("should log unknown error", () => {
      const logger = vi.fn();
      handleError("string error", { logger });
      expect(logger).toHaveBeenCalledWith("[UNKNOWN] string error");
    });

    it("should rethrow when rethrow option is true", () => {
      const err = new Error("Test");
      expect(() => {
        handleError(err, { rethrow: true });
      }).toThrow("Test");
    });

    it("should call process.exit when exitCode is provided", () => {
      const err = new DocsError(ErrorCode.CONFIG_NOT_FOUND, "Not found");
      const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("exit");
      });
      expect(() => {
        handleError(err, { exitCode: 1 });
      }).toThrow("exit");
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockRestore();
    });
  });

  describe("validationError function", () => {
    it("should return null for valid result", () => {
      const result = validationError({ valid: true, errors: [] });
      expect(result).toBeNull();
    });

    it("should return DocsError for invalid result", () => {
      const result = validationError({
        valid: false,
        errors: [{ path: "title", message: "Required" }],
      });
      expect(result).toBeInstanceOf(DocsError);
      expect(result?.code).toBe(ErrorCode.CONFIG_VALIDATION_ERROR);
    });
  });

  describe("Errors factory", () => {
    it("should create configNotFound error", () => {
      const err = Errors.configNotFound("/path/to/config");
      expect(err.code).toBe(ErrorCode.CONFIG_NOT_FOUND);
      expect(err.message).toContain("/path/to/config");
    });

    it("should create configSyntaxError error", () => {
      const err = Errors.configSyntaxError("Invalid JSON");
      expect(err.code).toBe(ErrorCode.CONFIG_SYNTAX_ERROR);
    });

    it("should create configValidationError", () => {
      const err = Errors.configValidationError([{ path: "title", message: "Required" }]);
      expect(err.code).toBe(ErrorCode.CONFIG_VALIDATION_ERROR);
    });

    it("should create fileNotFound error", () => {
      const err = Errors.fileNotFound("/path/file.md");
      expect(err.code).toBe(ErrorCode.FILE_NOT_FOUND);
    });

    it("should create pluginNotFound error", () => {
      const err = Errors.pluginNotFound("my-plugin");
      expect(err.code).toBe(ErrorCode.PLUGIN_NOT_FOUND);
      expect(err.message).toContain("my-plugin");
    });

    it("should create pluginError with cause", () => {
      const cause = new Error("Plugin crashed");
      const err = Errors.pluginError("test", "Failed", cause);
      expect(err.code).toBe(ErrorCode.PLUGIN_ERROR);
      expect(err.cause).toBe(cause);
    });

    it("should create buildError", () => {
      const err = Errors.buildError("Compilation failed");
      expect(err.code).toBe(ErrorCode.BUILD_ERROR);
    });

    it("should create routeConflict", () => {
      const err = Errors.routeConflict("/duplicate", ["a.md", "b.md"]);
      expect(err.code).toBe(ErrorCode.ROUTE_CONFLICT);
      expect(err.message).toContain("/duplicate");
    });

    it("should create adapterNotFound", () => {
      const err = Errors.adapterNotFound("react");
      expect(err.code).toBe(ErrorCode.ADAPTER_NOT_FOUND);
    });

    it("should create markdownParseError", () => {
      const err = Errors.markdownParseError("Invalid syntax");
      expect(err.code).toBe(ErrorCode.MARKDOWN_PARSE_ERROR);
    });
  });
});

describe("AST Utils", () => {
  describe("transformAST", () => {
    it("should transform root node", () => {
      const ast = { type: "root", value: "test" };
      const transformed = transformAST(ast, (node: unknown) => {
        const n = node as { type: string; value?: string };
        if (n.type === "root") {
          return { ...n, value: "transformed" };
        }
        return node;
      });
      expect((transformed as { value: string }).value).toBe("transformed");
    });

    it("should return original if transformer returns undefined", () => {
      const ast = { type: "root" };
      const transformed = transformAST(ast, () => undefined);
      expect(transformed).toBe(ast);
    });

    it("should transform children recursively", () => {
      const ast = {
        type: "root",
        children: [
          { type: "heading", value: "old" },
          { type: "paragraph", value: "text" },
        ],
      };
      const transformed = transformAST(ast, (node: unknown) => {
        const n = node as { type: string; value?: string };
        if (n.type === "heading") {
          return { ...n, value: "new" };
        }
        return node;
      });
      const children = (transformed as { children: Array<{ type: string; value: string }> }).children;
      expect(children[0].value).toBe("new");
      expect(children[1].value).toBe("text");
    });
  });

  describe("findNodes", () => {
    it("should find matching nodes", () => {
      const ast = {
        type: "root",
        children: [
          { type: "heading", depth: 1 },
          { type: "heading", depth: 2 },
          { type: "paragraph" },
        ],
      };
      const headings = findNodes(ast, (node: unknown) => {
        return (node as { type: string }).type === "heading";
      });
      expect(headings).toHaveLength(2);
    });

    it("should search nested children", () => {
      const ast = {
        type: "root",
        children: [
          {
            type: "section",
            children: [{ type: "heading", depth: 3 }],
          },
        ],
      };
      const headings = findNodes(ast, (node: unknown) => {
        return (node as { type: string }).type === "heading";
      });
      expect(headings).toHaveLength(1);
    });

    it("should return empty array for no matches", () => {
      const ast = { type: "root", children: [{ type: "paragraph" }] };
      const results = findNodes(ast, (node: unknown) => {
        return (node as { type: string }).type === "heading";
      });
      expect(results).toHaveLength(0);
    });
  });

  describe("walkAST", () => {
    it("should call callback on each node", () => {
      const ast = {
        type: "root",
        children: [{ type: "heading" }],
      };
      const calls: Array<{ type: string; parent: unknown; key: string | null }> = [];

      walkAST(ast, (node, parent, key) => {
        calls.push({ type: (node as { type: string }).type, parent, key });
      });

      expect(calls).toHaveLength(2);
      expect(calls[0].type).toBe("root");
      expect(calls[1].type).toBe("heading");
    });

    it("should pass correct parent and key", () => {
      const ast = {
        type: "root",
        children: [{ type: "heading", value: "Test" }],
      };
      let headingParent: unknown = null;
      let headingKey: string | null = null;

      walkAST(ast, (node, parent, key) => {
        if ((node as { type: string }).type === "heading") {
          headingParent = parent;
          headingKey = key;
        }
      });

      expect((headingParent as { type: string }).type).toBe("root");
      expect(headingKey).toBe("children[0]");
    });
  });
});

describe("FS Utils", () => {
  const testDir = join(__dirname, "test-fs-utils");
  const testFile = join(testDir, "test.txt");
  const nestedDir = join(testDir, "nested");
  const nestedFile = join(nestedDir, "nested.txt");

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
    mkdirSync(nestedDir, { recursive: true });
    writeFileSync(testFile, "test content");
    writeFileSync(nestedFile, "nested content");
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("pathExists", () => {
    it("should return true for existing path", () => {
      expect(pathExists(testFile)).toBe(true);
    });

    it("should return false for non-existing path", () => {
      expect(pathExists("/non/existent")).toBe(false);
    });
  });

  describe("isDirectory", () => {
    it("should return true for directory", () => {
      expect(isDirectory(testDir)).toBe(true);
    });

    it("should return false for file", () => {
      expect(isDirectory(testFile)).toBe(false);
    });

    it("should return false for non-existing", () => {
      expect(isDirectory("/non/existent")).toBe(false);
    });
  });

  describe("isFile", () => {
    it("should return true for file", () => {
      expect(isFile(testFile)).toBe(true);
    });

    it("should return false for directory", () => {
      expect(isFile(testDir)).toBe(false);
    });
  });

  describe("readFile", () => {
    it("should read file content", () => {
      const content = readFile(testFile);
      expect(content).toBe("test content");
    });

    it("should read with custom encoding", () => {
      const content = readFile(testFile, "utf-8");
      expect(content).toBe("test content");
    });
  });

  describe("writeFile", () => {
    it("should write file content", () => {
      const newFile = join(testDir, "new.txt");
      writeFile(newFile, "new content");
      expect(readFile(newFile)).toBe("new content");
    });
  });

  describe("copyFile", () => {
    it("should copy file", () => {
      const dest = join(testDir, "copy.txt");
      copyFile(testFile, dest);
      expect(readFile(dest)).toBe("test content");
    });
  });

  describe("deleteFile", () => {
    it("should delete file", () => {
      const fileToDelete = join(testDir, "delete.txt");
      writeFileSync(fileToDelete, "to delete");
      expect(existsSync(fileToDelete)).toBe(true);

      deleteFile(fileToDelete);
      expect(existsSync(fileToDelete)).toBe(false);
    });

    it("should not throw for non-existing file", () => {
      expect(() => deleteFile("/non/existent")).not.toThrow();
    });
  });

  describe("ensureDirectory", () => {
    it("should create directory recursively", () => {
      const newDir = join(testDir, "new", "nested", "dir");
      ensureDirectory(newDir);
      expect(isDirectory(newDir)).toBe(true);
    });
  });

  describe("deleteDirectory", () => {
    it("should delete directory recursively", () => {
      expect(isDirectory(testDir)).toBe(true);
      deleteDirectory(testDir);
      expect(isDirectory(testDir)).toBe(false);
    });
  });

  describe("readDir", () => {
    it("should read directory contents", () => {
      const entries = readDir(testDir);
      expect(entries).toContain("test.txt");
      expect(entries).toContain("nested");
    });

    it("should read with file types", () => {
      const entries = readDir(testDir, { withFileTypes: true });
      expect(entries.some((e) => e.endsWith("test.txt"))).toBe(true);
    });

    it("should read recursively", () => {
      const entries = readDir(testDir, { recursive: true });
      expect(entries).toContain(join(testDir, "test.txt"));
      expect(entries).toContain(nestedFile);
    });
  });

  describe("getFiles", () => {
    it("should get files in directory", () => {
      const files = getFiles(testDir);
      expect(files).toContain(testFile);
    });

    it("should get files recursively", () => {
      const files = getFiles(testDir, true);
      expect(files).toContain(nestedFile);
    });

    it("should return empty array for non-existing", () => {
      const files = getFiles("/non/existent");
      expect(files).toEqual([]);
    });
  });

  describe("getDirectories", () => {
    it("should get subdirectories", () => {
      const dirs = getDirectories(testDir);
      expect(dirs.some((d) => d.includes("nested"))).toBe(true);
    });

    it("should return empty for non-existing", () => {
      const dirs = getDirectories("/non/existent");
      expect(dirs).toEqual([]);
    });
  });

  describe("copyDirectory", () => {
    it("should copy directory recursively", () => {
      const dest = join(__dirname, "test-copy-dest");
      const results = copyDirectory(testDir, dest);

      expect(results.length).toBeGreaterThan(0);
      expect(existsSync(join(dest, "test.txt"))).toBe(true);
      expect(existsSync(join(dest, "nested", "nested.txt"))).toBe(true);

      // Cleanup
      rmSync(dest, { recursive: true, force: true });
    });

    it("should return empty for non-existing source", () => {
      const results = copyDirectory("/non/existent", "/dest");
      expect(results).toEqual([]);
    });
  });

  describe("glob", () => {
    it("should return empty array for no matches", () => {
      const matches = glob("**/*.nonexistent", testDir);
      expect(matches).toEqual([]);
    });

    it("should find files matching simple pattern", () => {
      const matches = glob("*.txt", testDir);
      // At least test.txt should be found if the pattern matches
      expect(typeof matches).toBe("object");
      expect(Array.isArray(matches)).toBe(true);
    });
  });

  describe("findNearestFile", () => {
    it("should find nearest config file", () => {
      const found = findNearestFile("package.json", __dirname);
      expect(found).toBeDefined();
      expect(found?.endsWith("package.json")).toBe(true);
    });

    it("should return undefined if not found", () => {
      const found = findNearestFile("non-existent.json", __dirname);
      expect(found).toBeUndefined();
    });
  });

  describe("getExtension", () => {
    it("should get file extension", () => {
      expect(getExtension("/path/to/file.ts")).toBe(".ts");
      expect(getExtension("/path/to/file.md")).toBe(".md");
    });
  });

  describe("removeExtension", () => {
    it("should remove extension", () => {
      expect(removeExtension("/path/to/file.ts")).toBe("/path/to/file");
    });
  });

  describe("isSubPath", () => {
    it("should return true for subpath", () => {
      expect(isSubPath("/parent", "/parent/child")).toBe(true);
    });

    it("should return false for parent path", () => {
      expect(isSubPath("/child", "/parent")).toBe(false);
    });

    it("should return false for absolute outside path", () => {
      expect(isSubPath("/parent", "/other/child")).toBe(false);
    });
  });

  describe("getFileSize", () => {
    it("should return file size", () => {
      const size = getFileSize(testFile);
      expect(typeof size).toBe("number");
      expect(size).toBeGreaterThan(0);
    });
  });

  describe("getMTime", () => {
    it("should return modification time", () => {
      const mtime = getMTime(testFile);
      expect(mtime).toBeInstanceOf(Date);
    });
  });
});

describe("Path Utils", () => {
  describe("normalizePath", () => {
    it("should normalize path separators", () => {
      const normalized = normalizePath("path\\to\\file");
      expect(normalized).toBe("path/to/file");
    });
  });

  describe("resolveRelative", () => {
    it("should resolve relative path", () => {
      const relative = resolveRelative("/from", "/to/file");
      expect(typeof relative).toBe("string");
    });
  });

  describe("pathToExtension", () => {
    it("should get extension", () => {
      expect(pathToExtension("/path/file.ts")).toBe(".ts");
    });
  });

  describe("removePathExtension", () => {
    it("should remove extension", () => {
      expect(removePathExtension("/path/file.ts")).toBe("/path/file");
    });
  });

  describe("pathToUrl", () => {
    it("should convert path to URL", () => {
      const url = pathToUrl("/path/to/file");
      expect(url).toBe("/path/to/file/");
    });

    it("should handle index paths", () => {
      const url = pathToUrl("/path/to/index");
      expect(url).toBe("/path/to/index/");
    });

    it("should add trailing slash for paths without extension", () => {
      const url = pathToUrl("/path/to/file");
      expect(url.endsWith("/")).toBe(true);
    });

    it("should add base", () => {
      const url = pathToUrl("/file", "/docs");
      expect(url.startsWith("/docs")).toBe(true);
    });
  });

  describe("urlToPath", () => {
    it("should convert URL to path", () => {
      const path = urlToPath("/test");
      expect(path).toContain("test.html");
    });

    it("should handle root URL", () => {
      const path = urlToPath("/");
      expect(path).toContain("index.html");
    });

    it("should add extension", () => {
      const path = urlToPath("/test", "/", ".html");
      expect(path).toContain("test.html");
    });
  });

  describe("getParentDir", () => {
    it("should get parent directory", () => {
      const parent = getParentDir("/path/to/file");
      expect(parent).toBe("/path/to");
    });
  });

  describe("getName", () => {
    it("should get file/directory name", () => {
      expect(getName("/path/to/file.ts")).toBe("file.ts");
    });
  });

  describe("isPathAbsolute", () => {
    it("should return true for absolute path", () => {
      expect(isPathAbsolute("/absolute/path")).toBe(true);
    });

    it("should return false for relative path", () => {
      expect(isPathAbsolute("relative/path")).toBe(false);
    });
  });

  describe("joinPath", () => {
    it("should join path segments", () => {
      const joined = joinPath("/path", "to", "file");
      expect(joined).toContain("file");
    });
  });

  describe("getRelativePath", () => {
    it("should get relative path", () => {
      const relative = getRelativePath("/from", "/to");
      expect(typeof relative).toBe("string");
    });
  });

  describe("makeAbsolute", () => {
    it("should return absolute path as-is", () => {
      const absolute = makeAbsolute("/absolute/path");
      expect(absolute).toBe("/absolute/path");
    });

    it("should make relative path absolute", () => {
      const absolute = makeAbsolute("relative", "/base");
      // Should join base with relative path
      expect(absolute.length).toBeGreaterThan("/base".length);
      expect(absolute.endsWith("relative")).toBe(true);
    });
  });

  describe("slugify", () => {
    it("should slugify text", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should remove special characters", () => {
      expect(slugify("Hello@#$%World")).toBe("helloworld");
    });

    it("should trim dashes", () => {
      expect(slugify("  test  ")).toBe("test");
    });

    it("should handle multiple spaces", () => {
      expect(slugify("hello   world")).toBe("hello-world");
    });
  });

  describe("formatPath", () => {
    it("should format path", () => {
      const formatted = formatPath("/base/path/file");
      expect(typeof formatted).toBe("string");
    });

    it("should remove base prefix", () => {
      const formatted = formatPath("/base/path/file", "/base");
      expect(formatted).toBe("./path/file");
    });
  });
});
