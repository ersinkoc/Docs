/**
 * @oxog/docs-core - i18n Plugin
 * Multi-language support
 */

import { join, dirname } from "node:path";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import type { DocsPlugin, ContentFile, DocsConfig } from "../../types.js";

/**
 * i18n plugin options
 */
export interface I18nOptions {
  /** Available locales */
  locales: string[];

  /** Default locale */
  defaultLocale: string;

  /** Locale names (for display) */
  localeNames?: Record<string, string>;

  /** Strategy for language detection */
  strategy?: "prefix" | "prefix-except-default" | "domain";

  /** Custom language configurations */
  localesConfig?: Record<string, LocaleConfig>;
}

/**
 * Locale configuration
 */
export interface LocaleConfig {
  /** Language code (e.g., 'en-US') */
  lang: string;

  /** Direction (ltr or rtl) */
  dir?: "ltr" | "rtl";

  /** Date format */
  dateFormat?: string;

  /** Number format */
  numberFormat?: string;
}

/**
 * Create i18n plugin
 * @param options - i18n options
 * @returns i18n plugin
 */
export function createI18nPlugin(options: I18nOptions): DocsPlugin {
  const {
    locales,
    defaultLocale,
    localeNames = {},
    strategy = "prefix-except-default",
    localesConfig = {},
  } = options;

  return {
    name: "i18n",
    version: "1.0.0",

    onConfig: async (config: DocsConfig) => {
      // Add i18n to config
      return {
        ...config,
        vite: {
          ...config.vite,
          plugins: [
            ...((config.vite?.plugins as unknown[]) ?? []),
            createI18nVitePlugin({
              locales,
              defaultLocale,
              strategy,
            }),
          ],
        },
      };
    },

    onContentLoad: async (files: ContentFile[]) => {
      // Group files by locale
      const localeFiles: Record<string, ContentFile[]> = {};

      for (const file of files) {
        const locale = detectLocale(file.relativePath, locales);
        if (!localeFiles[locale]) {
          localeFiles[locale] = [];
        }
        localeFiles[locale].push({
          ...file,
          frontmatter: {
            ...file.frontmatter,
            locale,
          },
        });
      }

      return files;
    },
  };
}

/**
 * Detect locale from file path
 * @param path - File path
 * @param locales - Available locales
 * @returns Detected locale
 */
function detectLocale(path: string, locales: string[]): string {
  const segments = path.split("/");
  const firstSegment = segments[0] ?? "";

  if (firstSegment && locales.includes(firstSegment)) {
    return firstSegment;
  }

  return locales[0] ?? "en";
}

/**
 * Create i18n Vite plugin (placeholder)
 */
function createI18nVitePlugin(options: {
  locales: string[];
  defaultLocale: string;
  strategy: string;
}) {
  return {
    name: "docs-i18n",
    configureServer() {
      // Would configure language detection middleware
    },
  };
}

// Export plugin instance and factory
export const i18nPlugin = createI18nPlugin({
  locales: ["en"],
  defaultLocale: "en",
});
export function i18n(options: I18nOptions): DocsPlugin {
  return createI18nPlugin(options);
}
