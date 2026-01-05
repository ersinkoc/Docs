/**
 * @oxog/docs-theme-default - Header Component
 */

export interface HeaderProps {
  logo?: string;
  nav: Array<{ text: string; link: string }>;
  pathname?: string;
}

export function Header(props: HeaderProps): string {
  const { logo, nav, pathname } = props;

  const navLinks = nav
    .map(
      (item) =>
        `<a href="${item.link}" class="header-link ${pathname === item.link ? "active" : ""}">${escapeHtml(item.text)}</a>`,
    )
    .join("");

  return `
<header class="header">
  <div class="header-inner">
    ${logo ? `<a href="/" class="header-logo"><img src="${logo}" alt="Logo"></a>` : ""}
    <nav class="header-nav">${navLinks}</nav>
    <div class="header-actions">
      <button class="header-search" aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
      <button class="header-theme-toggle" aria-label="Toggle theme">
        <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </div>
  </div>
</header>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
