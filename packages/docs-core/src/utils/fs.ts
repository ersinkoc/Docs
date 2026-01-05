/**
 * @oxog/docs-core - File System Utilities
 */

import {
  join,
  dirname,
  basename,
  extname,
  relative,
  isAbsolute,
} from "node:path";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  rmSync,
  readdirSync,
  lstatSync,
  statSync,
} from "node:fs";

/**
 * Check if path exists
 * @param path - Path to check
 * @returns True if exists
 */
export function pathExists(path: string): boolean {
  return existsSync(path);
}

/**
 * Check if path is directory
 * @param path - Path to check
 * @returns True if directory
 */
export function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if path is file
 * @param path - Path to check
 * @returns True if file
 */
export function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/**
 * Read file content
 * @param path - File path
 * @param encoding - Encoding (default: utf-8)
 * @returns File content
 */
export function readFile(path: string, encoding: string = "utf-8"): string {
  return readFileSync(path, encoding as BufferEncoding);
}

/**
 * Write file content
 * @param path - File path
 * @param content - Content to write
 * @param encoding - Encoding (default: utf-8)
 */
export function writeFile(
  path: string,
  content: string,
  encoding: string = "utf-8",
): void {
  ensureDirectory(dirname(path));
  writeFileSync(path, content, encoding as BufferEncoding);
}

/**
 * Copy file
 * @param src - Source path
 * @param dest - Destination path
 */
export function copyFile(src: string, dest: string): void {
  ensureDirectory(dirname(dest));
  copyFileSync(src, dest);
}

/**
 * Delete file
 * @param path - File path
 */
export function deleteFile(path: string): void {
  if (existsSync(path)) {
    rmSync(path);
  }
}

/**
 * Create directory recursively
 * @param path - Directory path
 */
export function ensureDirectory(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

/**
 * Delete directory recursively
 * @param path - Directory path
 */
export function deleteDirectory(path: string): void {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

/**
 * Read directory contents
 * @param path - Directory path
 * @param options - Options
 * @returns Directory entries
 */
export function readDir(
  path: string,
  options?: { withFileTypes?: boolean; recursive?: boolean },
): string[] {
  if (options?.recursive) {
    return readDirRecursive(path);
  }

  if (options?.withFileTypes) {
    const entries = readdirSync(path, { withFileTypes: true });
    return entries.map((e) => join(path, e.name));
  }

  return readdirSync(path);
}

/**
 * Read directory recursively
 * @param path - Directory path
 * @returns All file paths
 */
function readDirRecursive(path: string): string[] {
  const results: string[] = [];

  if (!existsSync(path)) {
    return results;
  }

  const entries = readdirSync(path, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(path, entry.name);
    if (entry.isDirectory()) {
      results.push(...readDirRecursive(fullPath));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Get files in directory
 * @param path - Directory path
 * @param recursive - Recursive search
 * @returns Array of file paths
 */
export function getFiles(path: string, recursive: boolean = false): string[] {
  if (!existsSync(path)) {
    return [];
  }

  const entries = readdirSync(path, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(path, entry.name);
    if (entry.isFile()) {
      files.push(fullPath);
    } else if (entry.isDirectory() && recursive) {
      files.push(...getFiles(fullPath, true));
    }
  }

  return files;
}

/**
 * Get subdirectories
 * @param path - Directory path
 * @returns Array of directory paths
 */
export function getDirectories(path: string): string[] {
  if (!existsSync(path)) {
    return [];
  }

  const entries = readdirSync(path, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => join(path, e.name));
}

/**
 * Copy directory recursively
 * @param src - Source directory
 * @param dest - Destination directory
 * @returns Array of copied files
 */
export function copyDirectory(
  src: string,
  dest: string,
): { src: string; dest: string }[] {
  const results: { src: string; dest: string }[] = [];

  if (!existsSync(src)) {
    return results;
  }

  ensureDirectory(dest);

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      results.push(...copyDirectory(srcPath, destPath));
    } else if (entry.isFile()) {
      copyFile(srcPath, destPath);
      results.push({ src: srcPath, dest: destPath });
    }
  }

  return results;
}

/**
 * Glob pattern matching
 * @param pattern - Glob pattern
 * @param cwd - Current working directory
 * @returns Matching paths
 */
export function glob(pattern: string, cwd: string = process.cwd()): string[] {
  // Simple glob implementation using minimatch
  // Convert glob pattern to regex
  const files = getFiles(cwd, true);
  return files.filter((file) => {
    const relativePath = relative(cwd, file);
    return globMatch(relativePath, pattern);
  });
}

/**
 * Simple glob pattern matching
 * Supports: *, **, ?, [...]
 */
function globMatch(path: string, pattern: string): boolean {
  const regexStr = globToRegex(pattern);
  const regex = new RegExp(regexStr);
  return regex.test(path);
}

/**
 * Convert glob pattern to regex
 */
function globToRegex(pattern: string): string {
  let regex = "";
  let inCharClass = false;
  let charClass = "";

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];

    if (char === "[") {
      inCharClass = true;
      charClass = "[";
    } else if (char === "]" && inCharClass) {
      inCharClass = false;
      charClass += "]";
    } else if (inCharClass) {
      charClass += char;
    } else if (char === "*") {
      if (pattern[i + 1] === "*") {
        // ** matches everything including slashes
        regex += ".*";
        i++; // skip next *
      } else {
        // * matches everything except slashes
        regex += "[^/]*";
      }
    } else if (char === "?") {
      regex += "[^/]";
    } else if (
      char === "." ||
      char === "+" ||
      char === "^" ||
      char === "$" ||
      char === "{" ||
      char === "}" ||
      char === "|" ||
      char === "\\"
    ) {
      regex += "\\" + char;
    } else if (char === "/") {
      regex += "/";
    } else {
      regex += char;
    }
  }

  return "^" + regex + "$";
}

/**
 * Find nearest file
 * @param filename - File to find
 * @param cwd - Starting directory
 * @returns File path or undefined
 */
export function findNearestFile(
  filename: string,
  cwd: string = process.cwd(),
): string | undefined {
  let dir = cwd;

  while (dir) {
    const filePath = join(dir, filename);
    if (existsSync(filePath)) {
      return filePath;
    }

    const parent = dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  return undefined;
}

/**
 * Get file extension
 * @param path - File path
 * @returns Extension with dot
 */
export function getExtension(path: string): string {
  return extname(path);
}

/**
 * Remove extension from path
 * @param path - File path
 * @returns Path without extension
 */
export function removeExtension(path: string): string {
  const ext = extname(path);
  return path.slice(0, -ext.length);
}

/**
 * Check if path is subpath of parent
 * @param parent - Parent path
 * @param child - Child path
 * @returns True if child is subpath of parent
 */
export function isSubPath(parent: string, child: string): boolean {
  const relativePath = relative(parent, child);
  return (
    !!relativePath &&
    !relativePath.startsWith("..") &&
    !isAbsolute(relativePath)
  );
}

/**
 * Get file size in bytes
 * @param path - File path
 * @returns File size
 */
export function getFileSize(path: string): number {
  return statSync(path).size;
}

/**
 * Get last modification time
 * @param path - File path
 * @returns Last modification timestamp
 */
export function getMTime(path: string): Date {
  return statSync(path).mtime;
}
