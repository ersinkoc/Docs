/**
 * @oxog/docs-core - Error Tests
 */

import { describe, it, expect } from "vitest";
import {
  DocsError,
  ErrorCode,
  error,
  wrapError,
  Errors,
  handleError,
  validationError,
} from "../src/utils/error.js";

describe("DocsError", () => {
  it("should create error with code and message", () => {
    const err = new DocsError(ErrorCode.FILE_NOT_FOUND, "File not found");

    expect(err.code).toBe(ErrorCode.FILE_NOT_FOUND);
    expect(err.message).toBe("File not found");
    expect(err.name).toBe("DocsError");
  });

  it("should include cause", () => {
    const cause = new Error("Original error");
    const err = new DocsError(ErrorCode.BUILD_ERROR, "Build failed", { cause });

    expect(err.cause).toBe(cause);
  });

  it("should include context", () => {
    const context = { path: "/test/file.md" };
    const err = new DocsError(ErrorCode.FILE_NOT_FOUND, "File not found", {
      context,
    });

    expect(err.context).toEqual(context);
  });

  it("should format correctly", () => {
    const err = new DocsError(ErrorCode.FILE_NOT_FOUND, "File not found", {
      context: { path: "/test.md" },
    });

    const formatted = err.format();

    expect(formatted).toContain("[FILE_NOT_FOUND]");
    expect(formatted).toContain("File not found");
    expect(formatted).toContain("/test.md");
  });

  it("should convert to JSON", () => {
    const err = new DocsError(ErrorCode.FILE_NOT_FOUND, "File not found", {
      context: { path: "/test.md" },
    });

    const json = err.toJSON();

    expect(json.name).toBe("DocsError");
    expect(json.code).toBe(ErrorCode.FILE_NOT_FOUND);
    expect(json.message).toBe("File not found");
    expect(json.context).toEqual({ path: "/test.md" });
  });
});

describe("error()", () => {
  it("should create DocsError", () => {
    const err = error(ErrorCode.FILE_NOT_FOUND, "File not found");

    expect(err).toBeInstanceOf(DocsError);
    expect(err.code).toBe(ErrorCode.FILE_NOT_FOUND);
  });

  it("should include options", () => {
    const cause = new Error("Original");
    const err = error(ErrorCode.BUILD_ERROR, "Build failed", {
      cause,
      context: { line: 42 },
    });

    expect(err.cause).toBe(cause);
    expect(err.context).toEqual({ line: 42 });
  });
});

describe("wrapError()", () => {
  it("should wrap error with code", () => {
    const original = new Error("Original error");
    const wrapped = wrapError(ErrorCode.PLUGIN_ERROR, original, {
      plugin: "test",
    });

    expect(wrapped.code).toBe(ErrorCode.PLUGIN_ERROR);
    expect(wrapped.cause).toBe(original);
    expect(wrapped.context).toEqual({ plugin: "test" });
  });
});

describe("Errors factory", () => {
  it("should create config not found error", () => {
    const err = Errors.configNotFound("/path/to/config.ts");

    expect(err.code).toBe(ErrorCode.CONFIG_NOT_FOUND);
    expect(err.message).toContain("/path/to/config.ts");
  });

  it("should create file not found error", () => {
    const err = Errors.fileNotFound("/path/to/file.md");

    expect(err.code).toBe(ErrorCode.FILE_NOT_FOUND);
    expect(err.message).toContain("/path/to/file.md");
  });

  it("should create plugin not found error", () => {
    const err = Errors.pluginNotFound("my-plugin");

    expect(err.code).toBe(ErrorCode.PLUGIN_NOT_FOUND);
    expect(err.message).toContain("my-plugin");
  });

  it("should create route conflict error", () => {
    const err = Errors.routeConflict("/test/", ["a.md", "b.md"]);

    expect(err.code).toBe(ErrorCode.ROUTE_CONFLICT);
    expect(err.message).toContain("/test/");
    expect(err.message).toContain("a.md");
  });
});

describe("validationError()", () => {
  it("should return null for valid config", () => {
    const result = validationError({ valid: true, errors: [] });

    expect(result).toBeNull();
  });

  it("should return error for invalid config", () => {
    const result = validationError({
      valid: false,
      errors: [{ path: "title", message: "Title is required" }],
    });

    expect(result).toBeInstanceOf(DocsError);
    expect(result?.code).toBe(ErrorCode.CONFIG_VALIDATION_ERROR);
  });
});

describe("handleError()", () => {
  it("should log DocsError", () => {
    const logger = vi.fn();
    const err = new DocsError(ErrorCode.FILE_NOT_FOUND, "File not found");

    handleError(err, { logger });

    expect(logger).toHaveBeenCalled();
    expect(logger.mock.calls[0][0]).toContain("[FILE_NOT_FOUND]");
  });

  {
    const logger = vi.fn();
    handleError(new Error("Unknown error"), { logger });

    expect(logger).toHaveBeenCalled();
    expect(logger.mock.calls[0][0]).toContain("[ERROR]");
  }
});
