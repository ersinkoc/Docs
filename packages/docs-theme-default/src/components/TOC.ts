/**
 * @oxog/docs-theme-default - Table of Contents Component
 */

export interface TOCProps {
  toc?: Array<{
    text: string;
    slug: string;
    level: number;
    children?: Array<{ text: string; slug: string }>;
  }>;
}

export function TOC(props: TOCProps): string {
  const { toc } = props;

  if (!toc || toc.length === 0) {
    return "";
  }

  const items = toc
    .map(
      (item) =>
        `<li class="toc-item toc-level-${item.level}">
          <a href="#${item.slug}" class="toc-link">${escapeHtml(item.text)}</a>
          ${item.children ? `<ul>${item.children.map((c) => `<li><a href="#${c.slug}">${escapeHtml(c.text)}</a></li>`).join("")}</ul>` : ""}
        </li>`,
    )
    .join("");

  return `
<nav class="toc">
  <h2 class="toc-title">On this page</h2>
  <ul class="toc-list">${items}</ul>
</nav>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
