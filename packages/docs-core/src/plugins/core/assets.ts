/**
 * @oxog/docs-core - Assets Plugin
 * Static asset handling and copying
 */

import { join, relative, extname } from "node:path";
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
  lstatSync,
  writeFileSync,
} from "node:fs";
import type {
  DocsPlugin,
  AssetInfo,
  BuildManifest,
  ContentFile,
} from "../../types.js";

/**
 * Asset configuration
 */
export interface AssetsConfig {
  /** Pattern of files to include */
  pattern?: string[];

  /** Pattern of files to exclude */
  exclude?: string[];

  /** Copy directory name (default: 'assets') */
  dir?: string;

  /** Output directory (default: 'assets') */
  outDir?: string;
}

/**
 * Create assets plugin
 * @param config - Assets configuration
 * @returns Assets plugin
 */
export function createAssetsPlugin(config: AssetsConfig = {}): DocsPlugin {
  const pattern = config.pattern ?? ["**/*"];
  const exclude = config.exclude ?? ["**/*.md", "**/*.markdown"];
  const assetDir = config.dir ?? "assets";
  const outDir = config.outDir ?? "assets";

  return {
    name: "assets",
    version: "1.0.0",

    onBuildEnd: async (manifest: BuildManifest) => {
      const cwd = process.cwd();
      const srcDir = join(cwd, "docs", assetDir);
      const outputDir = join(cwd, "dist", outDir);

      if (!existsSync(srcDir)) {
        return;
      }

      // Copy assets
      const assets = copyAssetsRecursive(srcDir, outputDir, pattern, exclude);

      // Add to manifest
      manifest.assets.push(
        ...assets.map((asset) => ({
          src: relative(cwd, asset.src),
          dest: relative(cwd, asset.dest),
          type: "copy" as const,
        })),
      );
    },
  };
}

/**
 * Copy assets recursively
 * @param src - Source directory
 * @param dest - Destination directory
 * @param includePatterns - Include patterns
 * @param excludePatterns - Exclude patterns
 * @returns Array of copied files
 */
function copyAssetsRecursive(
  src: string,
  dest: string,
  includePatterns: string[],
  excludePatterns: string[],
): { src: string; dest: string }[] {
  const results: { src: string; dest: string }[] = [];

  if (!existsSync(src)) {
    return results;
  }

  mkdirSync(dest, { recursive: true });

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    // Check if should exclude
    const relativePath = relative(src, srcPath);
    if (shouldExclude(relativePath, excludePatterns)) {
      continue;
    }

    // Check if should include
    const isIncluded = shouldInclude(relativePath, includePatterns);

    if (entry.isDirectory()) {
      results.push(
        ...copyAssetsRecursive(
          srcPath,
          destPath,
          includePatterns,
          excludePatterns,
        ),
      );
    } else if (entry.isFile() && (isIncluded || !includePatterns.length)) {
      copyFileSync(srcPath, destPath);
      results.push({ src: srcPath, dest: destPath });
    }
  }

  return results;
}

/**
 * Check if path should be excluded
 * @param path - Path to check
 * @param patterns - Exclude patterns
 * @returns True if should exclude
 */
function shouldExclude(path: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (matchPattern(path, pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if path should be included
 * @param path - Path to check
 * @param patterns - Include patterns
 * @returns True if should include
 */
function shouldInclude(path: string, patterns: string[]): boolean {
  if (!patterns.length) return true;

  for (const pattern of patterns) {
    if (matchPattern(path, pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Match path against pattern
 * @param path - Path to match
 * @param pattern - Glob pattern
 * @returns True if matches
 */
function matchPattern(path: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\./g, "\\.")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

// Export plugin instance
export const assetsPlugin = createAssetsPlugin();
