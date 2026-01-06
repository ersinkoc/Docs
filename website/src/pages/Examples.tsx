import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/code/CodeBlock";

const examples = [
  {
    title: "Basic Configuration",
    description: "Minimal configuration to get started",
    category: "Getting Started",
    code: `import { defineConfig } from '@oxog/docs'

export default defineConfig({
  title: 'My Docs',
  adapter: {
    name: 'vanilla',
    createRenderer: () => ({
      render: (content) => \`<div>\${content.frontmatter.title}</div>\`,
    }),
  },
})`,
  },
  {
    title: "React Adapter",
    description: "Using the official React adapter",
    category: "Adapters",
    code: `import { defineConfig } from '@oxog/docs'
import react from '@oxog/docs-react'

export default defineConfig({
  title: 'React Docs',
  adapter: react({
    theme: 'github-dark',
  }),
})`,
  },
  {
    title: "Custom Frontmatter",
    description: "Using custom frontmatter fields",
    category: "Content",
    code: `---
title: Getting Started
description: Learn how to use our library
order: 1
featured: true
---

# Getting Started

This is a featured section of the documentation.`,
  },
  {
    title: "Custom Sidebar",
    description: "Configuring sidebar order manually",
    category: "Navigation",
    code: `---
title: Installation
order: 1
---

# Installation

\`\`\`bash
npm install my-package
\`\`\`
---
title: Configuration
order: 2
---

# Configuration

Configure your application...`,
  },
  {
    title: "Custom Plugin",
    description: "Creating a custom documentation plugin",
    category: "Plugins",
    code: `import { type Plugin } from '@oxog/docs'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',

    onBuildStart() {
      console.log('Build starting!')
    },

    onPageRender(page) {
      // Modify rendered page
      return page
    },
  }
}`,
  },
  {
    title: "Multi-language Support",
    description: "Using the i18n plugin",
    category: "Plugins",
    code: `import { defineConfig } from '@oxog/docs'
import i18n from '@oxog/docs-i18n'

export default defineConfig({
  title: 'Multi-language Docs',
  adapter: react(),
  plugins: [
    i18n({
      defaultLocale: 'en',
      locales: ['en', 'tr', 'de'],
    }),
  ],
})`,
  },
];

const categories = ["Getting Started", "Adapters", "Content", "Navigation", "Plugins"];

export function Examples() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Examples</span>
      </nav>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Examples</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn by example with these common use cases and patterns. Each
            example includes code you can copy directly into your project.
          </p>
        </div>

        {/* Examples Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {examples.map((example, index) => (
            <div
              key={index}
              className={cn(
                "border border-border rounded-xl overflow-hidden",
                "hover:shadow-lg transition-shadow"
              )}
            >
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{example.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {example.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {example.description}
                </p>
              </div>
              <div className="p-4">
                <CodeBlock
                  code={example.code}
                  language={example.code.startsWith("---") ? "yaml" : "typescript"}
                  showLineNumbers={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* More Resources */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">More Resources</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/docs"
              className={cn(
                "px-4 py-2 rounded-lg border border-border",
                "hover:bg-accent transition-colors"
              )}
            >
              Read the Docs
            </Link>
            <a
              href="https://github.com/ersinkoc/docs/tree/main/examples"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "px-4 py-2 rounded-lg border border-border",
                "hover:bg-accent transition-colors"
              )}
            >
              View on GitHub
            </a>
            <Link
              to="/playground"
              className={cn(
                "px-4 py-2 rounded-lg bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors"
              )}
            >
              Try Playground
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between mt-12 pt-8 border-t border-border max-w-5xl mx-auto">
        <Link
          to="/api"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to API
        </Link>
        <Link
          to="/playground"
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Next: Playground
          <ChevronRight className="h-4 w-4" />
        </Link>
      </nav>
    </div>
  );
}
