#!/usr/bin/env node
/**
 * @oxog/docs - CLI Entry Point
 */

import { Command } from "commander";
import { init } from "./commands/init.js";
import { dev } from "./commands/dev.js";
import { build } from "./commands/build.js";
import { preview } from "./commands/preview.js";
import { newPage } from "./commands/new.js";

// Version - hardcoded for build compatibility
const VERSION = "1.0.0";

const program = new Command();

program
  .name("docs")
  .description("Framework-agnostic documentation generator")
  .version(VERSION);

/**
 * Run the CLI
 */
export function cli(): void {
  // Parse arguments
  program.parse();
}

// Show help if no command provided
if (process.argv.length <= 2) {
  program.outputHelp();
}

/**
 * Initialize a new documentation project
 */
program
  .command("init [path]")
  .description("Initialize a new documentation project")
  .option("--template <template>", "Template to use (minimal, blog, api)")
  .option(
    "--framework <framework>",
    "Framework (react, vue, svelte, solid, vanilla)",
  )
  .action(async (path, options) => {
    try {
      await init({ path, ...options });
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

/**
 * Start development server
 */
program
  .command("dev")
  .description("Start development server")
  .option("-p, --port <port>", "Port number", "3000")
  .option("-h, --host <host>", "Host to bind", "localhost")
  .option("--config <config>", "Config file path")
  .action(async (options) => {
    try {
      await dev(options);
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

/**
 * Build for production
 */
program
  .command("build")
  .description("Build for production")
  .option("--config <config>", "Config file path")
  .action(async (options) => {
    try {
      await build(options);
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

/**
 * Preview production build
 */
program
  .command("preview")
  .description("Preview production build")
  .option("-p, --port <port>", "Port number", "4173")
  .option("-h, --host <host>", "Host to bind", "localhost")
  .action(async (options) => {
    try {
      await preview(options);
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

/**
 * Create new page
 */
program
  .command("new <path>")
  .description("Create a new documentation page")
  .option("--title <title>", "Page title")
  .option("--open", "Open the file in editor")
  .action(async (path, options) => {
    try {
      await newPage(path, options);
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Parse arguments
program.parse();

// Show help if no command provided
if (process.argv.length <= 2) {
  program.outputHelp();
}
