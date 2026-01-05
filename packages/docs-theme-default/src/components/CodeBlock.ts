/**
 * @oxog/docs-theme-default - Code Block Component
 */

export interface CodeBlockProps {
  /** Code content */
  code: string;

  /** Programming language */
  language?: string;

  /** Whether to show line numbers */
  showLineNumbers?: boolean;

  /** File name for header */
  filename?: string;

  /** Highlighted lines */
  highlights?: number[];
}

export function CodeBlock(props: CodeBlockProps): string {
  const {
    code,
    language = "text",
    showLineNumbers = false,
    filename,
    highlights = [],
  } = props;

  const lines = code.split("\n");
  const lineNumbers = lines.map((_, i) => i + 1);

  return `
<div class="code-block" data-language="${language}">
  ${filename ? `<div class="code-block-header">${escapeHtml(filename)}</div>` : ""}
  <div class="code-block-content">
    <table class="code-table">
      <tbody>
        ${lines
          .map((line, i) => {
            const lineNum = i + 1;
            const isHighlighted = highlights.includes(lineNum);
            return `
          <tr class="${isHighlighted ? "highlighted" : ""}">
            ${showLineNumbers ? `<td class="line-number">${lineNum}</td>` : ""}
            <td class="line-content"><code>${escapeHtml(line)}</code></td>
          </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  </div>
  <button class="code-copy" aria-label="Copy code">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  </button>
</div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
