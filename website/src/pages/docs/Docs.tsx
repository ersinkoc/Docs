import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/code/CodeBlock";

const sidebarItems = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Quick Start", href: "/docs/quick-start" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "Configuration", href: "/docs/configuration" },
      { title: "Routing", href: "/docs/routing" },
      { title: "Frontmatter", href: "/docs/frontmatter" },
    ],
  },
  {
    title: "Plugins",
    items: [
      { title: "Core Plugins", href: "/docs/plugins/core" },
      { title: "Optional Plugins", href: "/docs/plugins/optional" },
      { title: "Creating Plugins", href: "/docs/plugins/custom" },
    ],
  },
];

const installationCode = `npm install @oxog/docs`;

const configCode = `import { defineConfig } from '@oxog/docs'
import react from '@oxog/docs-react'

export default defineConfig({
  title: 'My Docs',
  description: 'My awesome documentation',
  adapter: react(),

  // Theme options
  theme: {
    primaryColor: '#6366f1',
  },

  // Plugins
  plugins: [
    // Core plugins are included by default
  ],
})`;

export function Docs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Getting Started",
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-background border border-border cursor-pointer"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-14 z-40 h-[calc(100vh-3.5rem)] w-64",
          "border-r border-border bg-background overflow-y-auto",
          "transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-4 space-y-4">
          {sidebarItems.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  "flex items-center justify-between w-full px-2 py-1.5",
                  "text-sm font-semibold text-foreground",
                  "hover:text-primary transition-colors cursor-pointer"
                )}
              >
                {section.title}
                {expandedSections.includes(section.title) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {expandedSections.includes(section.title) && (
                <ul className="mt-2 space-y-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 pl-6",
                          "text-sm text-muted-foreground hover:text-foreground",
                          "hover:bg-accent rounded-md transition-colors"
                        )}
                      >
                        <FileText className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Documentation</span>
          </nav>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <h1>Introduction</h1>
            <p className="text-lg text-muted-foreground">
              @oxog/docs is a zero-config, plugin-first documentation generator
              that works with any framework. React, Vue, Svelte, Solid, or
              Vanilla - you choose.
            </p>

            <h2>Installation</h2>
            <p>Install @oxog/docs using your preferred package manager:</p>
            <CodeBlock code={installationCode} language="bash" filename="Terminal" />

            <h2>Quick Start</h2>
            <p>
              Create a <code>docs.config.ts</code> file in your project root:
            </p>
            <CodeBlock
              code={configCode}
              language="typescript"
              filename="docs.config.ts"
            />

            <p>Then run the development server:</p>
            <CodeBlock code="npx @oxog/docs dev" language="bash" filename="Terminal" />

            <h2>Features</h2>
            <ul>
              <li>Zero-config setup with sensible defaults</li>
              <li>Framework-agnostic architecture</li>
              <li>Plugin-based extensibility</li>
              <li>TypeScript-native with full type safety</li>
              <li>100% test coverage</li>
              <li>LLM-optimized output</li>
              <li>Built-in syntax highlighting</li>
              <li>Dark/Light theme support</li>
            </ul>

            <h2>Next Steps</h2>
            <p>Check out the following sections to learn more:</p>
            <ul>
              <li>
                <Link to="/docs/installation">Installation</Link> - Step-by-step
                installation guide
              </li>
              <li>
                <Link to="/docs/quick-start">Quick Start</Link> - Get running in
                5 minutes
              </li>
              <li>
                <Link to="/docs/configuration">Configuration</Link> - Customize
                your docs
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <nav className="flex items-center justify-between mt-12 pt-8 border-t border-border">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </Link>
            <Link
              to="/docs/installation"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Next: Installation
              <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
