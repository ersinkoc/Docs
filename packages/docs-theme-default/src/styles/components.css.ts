/**
 * @oxog/docs-theme-default - Component Styles
 */

export const componentStyles = `/* Layout */
.theme-container { display: flex; flex-direction: column; min-height: 100vh; }
.theme-main { display: flex; flex: 1; }
.theme-content { flex: 1; padding: 2rem 3rem; max-width: 900px; }
.theme-article { max-width: 100%; }

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.header-logo img { height: 32px; }

.header-nav { display: flex; gap: 2rem; }

.header-link {
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.header-link:hover,
.header-link.active { color: #0066cc; }

.header-actions { display: flex; gap: 1rem; align-items: center; }

.header-search,
.header-theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #1a1a1a;
  border-radius: 8px;
  transition: background 0.2s;
}

.header-search:hover,
.header-theme-toggle:hover { background: #f8f9fa; }

/* Sidebar */
.sidebar {
  width: 280px;
  padding: 2rem 1.5rem;
  border-right: 1px solid #e5e5e5;
  background: #f8f9fa;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-section { margin-bottom: 1.5rem; }

.sidebar-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #666666;
  margin: 0 0 0.75rem;
  font-weight: 600;
}

.sidebar-list { display: flex; flex-direction: column; gap: 0.25rem; }

.sidebar-link {
  display: block;
  padding: 0.5rem 0.75rem;
  color: #1a1a1a;
  text-decoration: none;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.sidebar-link:hover { background: #ffffff; }

.sidebar-link.active {
  color: #0066cc;
  background: #ffffff;
  font-weight: 500;
}

/* Article */
.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.2;
}

/* TOC */
.toc {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e5e5;
}

.toc-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: #666666;
}

.toc-list { list-style: none; padding: 0; margin: 0; }

.toc-item { margin: 0.5rem 0; }

.toc-link {
  color: #666666;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s;
}

.toc-link:hover { color: #0066cc; }

/* Footer */
.footer {
  border-top: 1px solid #e5e5e5;
  padding: 2rem;
  background: #f8f9fa;
  margin-top: 3rem;
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.footer-message { color: #666666; margin: 0; }

.footer-links { display: flex; gap: 1.5rem; }

.footer-links a { color: #666666; font-size: 0.9rem; }

.footer-links a:hover { color: #0066cc; }

.footer-social { display: flex; gap: 1rem; }

.footer-social a { color: #666666; transition: color 0.2s; }

.footer-social a:hover { color: #0066cc; }

/* Responsive */
@media (max-width: 1024px) {
  .sidebar { display: none; }
  .theme-content { padding: 1.5rem; }
}

@media (max-width: 640px) {
  .header-nav { display: none; }
  .article-title { font-size: 1.75rem; }
  h1 { font-size: 1.75rem; }
  h2 { font-size: 1.5rem; }
}
`;
