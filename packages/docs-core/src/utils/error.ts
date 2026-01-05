/**
 * @oxog/docs-core - Error Handling Utilities
 */

/**
 * Error codes for documentation system
 */
export enum ErrorCode {
  // Config errors
  CONFIG_NOT_FOUND = "CONFIG_NOT_FOUND",
  CONFIG_SYNTAX_ERROR = "CONFIG_SYNTAX_ERROR",
  CONFIG_VALIDATION_ERROR = "CONFIG_VALIDATION_ERROR",
  CONFIG_PARSE_ERROR = "CONFIG_PARSE_ERROR",

  // Build errors
  BUILD_ERROR = "BUILD_ERROR",
  BUILD_NO_PAGES = "BUILD_NO_PAGES",
  BUILD_OUTPUT_ERROR = "BUILD_OUTPUT_ERROR",

  // Plugin errors
  PLUGIN_NOT_FOUND = "PLUGIN_NOT_FOUND",
  PLUGIN_ERROR = "PLUGIN_ERROR",
  PLUGIN_DEPENDENCY_MISSING = "PLUGIN_DEPENDENCY_MISSING",

  // File errors
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  FILE_READ_ERROR = "FILE_READ_ERROR",
  FILE_WRITE_ERROR = "FILE_WRITE_ERROR",
  FILE_PERMISSION_DENIED = "FILE_PERMISSION_DENIED",

  // Markdown errors
  MARKDOWN_PARSE_ERROR = "MARKDOWN_PARSE_ERROR",
  MARKDOWN_RENDER_ERROR = "MARKDOWN_RENDER_ERROR",

  // Frontmatter errors
  FRONTMATTER_PARSE_ERROR = "FRONTMATTER_PARSE_ERROR",
  FRONTMATTER_VALIDATION_ERROR = "FRONTMATTER_VALIDATION_ERROR",

  // Server errors
  SERVER_ERROR = "SERVER_ERROR",
  SERVER_PORT_IN_USE = "SERVER_PORT_IN_USE",
  SERVER_START_ERROR = "SERVER_START_ERROR",

  // Adapter errors
  ADAPTER_NOT_FOUND = "ADAPTER_NOT_FOUND",
  ADAPTER_ERROR = "ADAPTER_ERROR",

  // Router errors
  ROUTE_NOT_FOUND = "ROUTE_NOT_FOUND",
  ROUTE_CONFLICT = "ROUTE_CONFLICT",

  // Unknown
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Custom error class for documentation errors
 */
export class DocsError extends Error {
  /** Error code */
  code: ErrorCode;

  /** Cause error */
  override cause?: Error;

  /** Additional context */
  context?: Record<string, unknown>;

  /**
   * Create a DocsError
   * @param code - Error code
   * @param message - Error message
   * @param options - Error options
   */
  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message);
    this.name = "DocsError";
    this.code = code;
    this.cause = options?.cause;
    this.context = options?.context;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DocsError);
    }
  }

  /**
   * Convert to JSON for serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      cause: this.cause?.message,
      context: this.context,
      stack: this.stack,
    };
  }

  /**
   * Format error for display
   */
  format(): string {
    let output = `[${this.code}] ${this.message}`;

    if (this.context && Object.keys(this.context).length > 0) {
      const contextStr = JSON.stringify(this.context, null, 2);
      output += `\nContext: ${contextStr}`;
    }

    if (this.cause) {
      output += `\nCaused by: ${this.cause.message}`;
    }

    return output;
  }
}

/**
 * Create error with code
 * @param code - Error code
 * @param message - Error message
 * @param options - Error options
 * @returns DocsError
 */
export function error(
  code: ErrorCode,
  message: string,
  options?: {
    cause?: Error;
    context?: Record<string, unknown>;
  },
): DocsError {
  return new DocsError(code, message, options);
}

/**
 * Wrap error with DocsError
 * @param code - Error code
 * @param error - Error to wrap
 * @param context - Additional context
 * @returns DocsError
 */
export function wrapError(
  code: ErrorCode,
  error: Error,
  context?: Record<string, unknown>,
): DocsError {
  return new DocsError(code, error.message, {
    cause: error,
    context,
  });
}

/**
 * Handle error and log appropriately
 * @param error - Error to handle
 * @param options - Handling options
 */
export function handleError(
  error: unknown,
  options?: {
    logger?: (message: string) => void;
    rethrow?: boolean;
    exitCode?: number;
  },
): void {
  const logger = options?.logger ?? console.error;
  const rethrow = options?.rethrow ?? false;

  let message: string;
  let code: string = "UNKNOWN";

  if (error instanceof DocsError) {
    message = error.format();
    code = error.code;
  } else if (error instanceof Error) {
    message = error.message;
    code = "ERROR";
  } else {
    message = String(error);
  }

  logger(`[${code}] ${message}`);

  if (rethrow) {
    throw error;
  }

  if (options?.exitCode !== undefined) {
    process.exit(options.exitCode);
  }
}

/**
 * Create error from validation result
 * @param result - Validation result
 * @returns DocsError if invalid
 */
export function validationError(result: {
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
}): DocsError | null {
  if (result.valid) {
    return null;
  }

  const messages = result.errors
    .map((e) => `${e.path}: ${e.message}`)
    .join("\n");
  return new DocsError(
    ErrorCode.CONFIG_VALIDATION_ERROR,
    `Configuration validation failed:\n${messages}`,
  );
}

/**
 * Create error factory for common errors
 */
export const Errors = {
  configNotFound(path: string): DocsError {
    return new DocsError(
      ErrorCode.CONFIG_NOT_FOUND,
      `Configuration file not found: ${path}`,
    );
  },

  configSyntaxError(message: string, cause?: Error): DocsError {
    return new DocsError(
      ErrorCode.CONFIG_SYNTAX_ERROR,
      `Configuration syntax error: ${message}`,
      { cause },
    );
  },

  configValidationError(
    errors: Array<{ path: string; message: string }>,
  ): DocsError {
    const messages = errors.map((e) => `${e.path}: ${e.message}`).join("\n");
    return new DocsError(
      ErrorCode.CONFIG_VALIDATION_ERROR,
      `Configuration validation failed:\n${messages}`,
    );
  },

  fileNotFound(path: string): DocsError {
    return new DocsError(ErrorCode.FILE_NOT_FOUND, `File not found: ${path}`);
  },

  pluginNotFound(name: string): DocsError {
    return new DocsError(
      ErrorCode.PLUGIN_NOT_FOUND,
      `Plugin not found: ${name}`,
    );
  },

  pluginError(name: string, message: string, cause?: Error): DocsError {
    return new DocsError(
      ErrorCode.PLUGIN_ERROR,
      `Plugin error (${name}): ${message}`,
      { cause },
    );
  },

  buildError(message: string, cause?: Error): DocsError {
    return new DocsError(ErrorCode.BUILD_ERROR, `Build error: ${message}`, {
      cause,
    });
  },

  routeConflict(path: string, files: string[]): DocsError {
    return new DocsError(
      ErrorCode.ROUTE_CONFLICT,
      `Route conflict at ${path}: Multiple files map to this route: ${files.join(", ")}`,
    );
  },

  adapterNotFound(name: string): DocsError {
    return new DocsError(
      ErrorCode.ADAPTER_NOT_FOUND,
      `Adapter not found: ${name}`,
    );
  },

  markdownParseError(message: string, cause?: Error): DocsError {
    return new DocsError(
      ErrorCode.MARKDOWN_PARSE_ERROR,
      `Markdown parse error: ${message}`,
      { cause },
    );
  },
};
