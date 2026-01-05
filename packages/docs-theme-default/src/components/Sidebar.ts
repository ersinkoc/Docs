/**
 * @oxog/docs-theme-default - Sidebar Component
 */

export interface SidebarProps {
  sidebar: Record<
    string,
    Array<{ text: string; items: Array<{ text: string; link: string }> }>
  >;
  pathname?: string;
}

export function Sidebar(props: SidebarProps): string {
  const { sidebar, pathname } = props;

  let sidebarContent = "";

  for (const [, sections] of Object.entries(sidebar)) {
    for (const section of sections) {
      const items = section.items
        .map(
          (item) =>
            `<a href="${item.link}" class="sidebar-link ${pathname === item.link ? "active" : ""}">${escapeHtml(item.text)}</a>`,
        )
        .join("");

      sidebarContent += `
      <div class="sidebar-section">
        <h3 class="sidebar-title">${escapeHtml(section.text)}</h3>
        <div class="sidebar-list">${items}</div>
      </div>`;
    }
  }

  if (!sidebarContent) {
    return '<aside class="sidebar"></aside>';
  }

  return `<aside class="sidebar">${sidebarContent}</aside>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
