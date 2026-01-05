/**
 * @oxog/docs-core - Path Utilities
 */

import {
  join,
  dirname,
  basename,
  extname,
  relative,
  isAbsolute,
  normalize,
  sep,
} from "node:path";

/**
 * Normalize path (cross-platform)
 * @param path - Path to normalize
 * @returns Normalized path
 */
export function normalizePath(path: string): string {
  return normalize(path).split(sep).join("/");
}

/**
 * Resolve relative path from base
 * @param from - Base path
 * @param to - Target path
 * @returns Relative path
 */
export function resolveRelative(from: string, to: string): string {
  return relative(from, to);
}

/**
 * Get file extension
 * @param path - File path
 * @returns Extension with dot (e.g., '.ts')
 */
export function pathToExtension(path: string): string {
  return extname(path);
}

/**
 * Remove extension from path
 * @param path - File path
 * @returns Path without extension
 */
export function removePathExtension(path: string): string {
  const ext = extname(path);
  return path.slice(0, -ext.length) || path;
}

/**
 * Convert file path to URL
 * @param path - File path
 * @param base - Base URL
 * @returns URL path
 */
export function pathToUrl(path: string, base: string = "/"): string {
  // Normalize path separators
  let urlPath = path.split(sep).join("/");

  // Remove extension
  urlPath = removePathExtension(urlPath);

  // Ensure leading slash
  if (!urlPath.startsWith("/")) {
    urlPath = "/" + urlPath;
  }

  // Add base if not already included
  if (base !== "/" && !urlPath.startsWith(base)) {
    urlPath = base.replace(/\/$/, "") + urlPath;
  }

  // Ensure trailing slash for directories
  if (!urlPath.endsWith("/") && !extname(urlPath)) {
    urlPath = urlPath + "/";
  }

  return urlPath;
}

/**
 * Convert URL to file path
 * @param url - URL path
 * @param base - Base directory
 * @param extension - Default extension
 * @returns File path
 */
export function urlToPath(
  url: string,
  base: string = process.cwd(),
  extension: string = ".html",
): string {
  // Remove base prefix
  let path = url;
  if (base !== "/" && url.startsWith(base)) {
    path = url.slice(base.length);
  }

  // Remove leading slash
  if (path.startsWith("/")) {
    path = path.slice(1);
  }

  // Handle index
  if (path === "" || path === "/") {
    path = "index" + extension;
  } else if (path.endsWith("/")) {
    path = path + "index" + extension;
  } else if (!extname(path)) {
    path = path + extension;
  }

  return join(base, path);
}

/**
 * Get parent directory
 * @param path - File or directory path
 * @returns Parent directory
 */
export function getParentDir(path: string): string {
  return dirname(path);
}

/**
 * Get file/directory name
 * @param path - File or directory path
 * @returns Name
 */
export function getName(path: string): string {
  return basename(path);
}

/**
 * Check if path is absolute
 * @param path - Path to check
 * @returns True if absolute
 */
export function isPathAbsolute(path: string): boolean {
  return isAbsolute(path);
}

/**
 * Join path segments
 * @param segments - Path segments
 * @returns Joined path
 */
export function joinPath(...segments: string[]): string {
  return join(...segments);
}

/**
 * Get relative path between two paths
 * @param from - From path
 * @param to - To path
 * @returns Relative path
 */
export function getRelativePath(from: string, to: string): string {
  return relative(from, to);
}

/**
 * Make path absolute
 * @param path - Path to make absolute
 * @param base - Base path
 * @returns Absolute path
 */
export function makeAbsolute(
  path: string,
  base: string = process.cwd(),
): string {
  if (isAbsolute(path)) {
    return path;
  }
  return join(base, path);
}

/**
 * Slugify path segment
 * @param text - Text to slugify
 * @returns Slugified string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format path for display
 * @param path - Path to format
 * @param base - Base path to remove
 * @returns Formatted path
 */
export function formatPath(path: string, base?: string): string {
  let formatted = normalizePath(path);

  if (base) {
    const baseNormalized = normalizePath(base);
    if (formatted.startsWith(baseNormalized)) {
      formatted = "." + formatted.slice(baseNormalized.length);
    }
  }

  return formatted;
}
