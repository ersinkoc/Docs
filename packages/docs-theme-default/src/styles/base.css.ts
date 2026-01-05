/**
 * @oxog/docs-theme-default - Base Styles
 */

export const baseStyles = `/* Reset */
*, *::before, *::after { box-sizing: border-box; }

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #1a1a1a;
  background: #ffffff;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin: 2rem 0 1rem;
  font-weight: 600;
  line-height: 1.3;
  color: #1a1a1a;
}

h1 { font-size: 2.25rem; margin-top: 0; }
h2 { font-size: 1.75rem; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.5rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }

p { margin: 1rem 0; }

a { color: #0066cc; text-decoration: none; }
a:hover { text-decoration: underline; }

/* Code */
code {
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  font-size: 0.9em;
  background: #f6f8fa;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

pre {
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: #f6f8fa;
  border-radius: 12px;
  overflow-x: auto;
}

pre code {
  background: none;
  padding: 0;
  font-size: 0.875rem;
  line-height: 1.7;
}

/* Lists */
ul, ol { padding-left: 1.5rem; }
li { margin: 0.5rem 0; }

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

th, td {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e5e5;
  text-align: left;
}

th { background: #f8f9fa; font-weight: 600; }

/* Images */
img { max-width: 100%; height: auto; }

/* HR */
hr {
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 2rem 0;
}
`;
