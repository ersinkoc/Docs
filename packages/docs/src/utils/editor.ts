/**
 * @oxog/docs - Editor Utilities
 */

import { spawn, spawnSync } from "node:child_process";

/**
 * Open file in default editor
 * @param filePath - File path to open
 */
export async function openInEditor(filePath: string): Promise<void> {
  const editor = process.env.VISUAL ?? process.env.EDITOR ?? detectEditor();

  if (!editor) {
    console.log(`File created: ${filePath}`);
    console.log("No editor found. Set VISUAL or EDITOR environment variable.");
    return;
  }

  return new Promise((resolve) => {
    const proc = spawn(editor, [filePath], {
      stdio: "inherit",
      detached: true,
    });

    proc.on("error", (error) => {
      console.log(`File created: ${filePath}`);
      console.log(`Could not open editor: ${error.message}`);
      resolve();
    });

    proc.on("exit", () => {
      resolve();
    });
  });
}

/**
 * Detect available editor
 * @returns Editor command or undefined
 */
function detectEditor(): string | undefined {
  // Check common editors
  const editors = ["code", "vim", "vi", "nano", "emacs", "subl"];

  for (const editor of editors) {
    try {
      spawnSync("which", [editor], { stdio: "ignore" });
      return editor;
    } catch {
      continue;
    }
  }

  return undefined;
}

/**
 * Format code with prettier
 * @param filePath - File path to format
 */
export async function formatWithPrettier(filePath: string): Promise<void> {
  try {
    spawnSync("npx", ["prettier", "--write", filePath], {
      stdio: "inherit",
    });
  } catch {
    // Prettier not available, skip formatting
  }
}
