/**
 * @oxog/docs-theme-default - Search Component
 */

export interface SearchProps {
  /** Placeholder text */
  placeholder?: string;

  /** Whether search is loading */
  loading?: boolean;

  /** Search results */
  results?: Array<{ title: string; url: string; snippet: string }>;
}

export function Search(props: SearchProps): string {
  const { placeholder = "Search documentation...", loading, results } = props;

  return `
<div class="search-container">
  <div class="search-input-wrapper">
    <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
    <input
      type="text"
      class="search-input"
      placeholder="${escapeHtml(placeholder)}"
      aria-label="Search"
    >
    <kbd class="search-shortcut">⌘K</kbd>
  </div>
  ${loading ? '<div class="search-loading">Loading...</div>' : ""}
  ${results && results.length > 0 ? renderResults(results) : ""}
</div>`;
}

function renderResults(
  results: Array<{ title: string; url: string; snippet: string }>,
): string {
  const items = results
    .map(
      (result) => `
    <a href="${result.url}" class="search-result">
      <div class="search-result-title">${escapeHtml(result.title)}</div>
      <div class="search-result-snippet">${escapeHtml(result.snippet)}</div>
    </a>`,
    )
    .join("");

  return `<div class="search-results">${items}</div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
