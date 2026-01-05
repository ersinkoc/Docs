/**
 * @oxog/docs-theme-default - Type Definitions
 */

import type { ThemeConfig as CoreThemeConfig } from "@oxog/docs-core";

/**
 * Extended theme configuration
 */
export interface ThemeConfig extends CoreThemeConfig {
  /** Color scheme */
  colorScheme?: "light" | "dark" | "system";

  /** Primary color */
  primaryColor?: string;

  /** Font family */
  fontFamily?: {
    sans?: string;
    mono?: string;
  };

  /** Code block theme */
  codeTheme?: string;

  /** Social links */
  social?: {
    github?: string;
    twitter?: string;
    discord?: string;
  };
}

/**
 * Theme options for factory
 */
export interface ThemeOptions {
  /** Theme configuration */
  config?: Partial<ThemeConfig>;
}

/**
 * Nav item with icon
 */
export interface NavItemWithIcon {
  /** Display text */
  text: string;
  /** Link URL */
  link: string;
  /** Active state */
  active?: boolean;
  /** Icon name (Lucide icon) */
  icon?: string;
}

/**
 * Sidebar item with icon
 */
export interface SidebarItemWithIcon {
  items: Array<{
    text: string;
    link: string;
    icon?: string;
    badge?: string;
  }>;
}
