import { Link } from "react-router-dom";
import {
  Zap,
  Layers,
  Puzzle,
  Bot,
  Shield,
  CheckCircle2,
  Download,
  Github,
  ArrowRight,
} from "lucide-react";
import { CodeBlock } from "@/components/code/CodeBlock";
import { Button } from "@/components/ui/button";
import { VERSION, GITHUB_REPO } from "@/lib/constants";
import { cn } from "@/lib/utils";

const HERO_CODE = `// Create docs.config.ts
import { defineConfig } from '@oxog/docs'
import react from '@oxog/docs-react'

export default defineConfig({
  title: 'My Docs',
  adapter: react()
})

// Run CLI
npx @oxog/docs dev`;

const features = [
  {
    icon: Zap,
    title: "Zero-Config",
    description:
      "Works out of the box with sensible defaults. Just run the CLI and start writing docs.",
  },
  {
    icon: Layers,
    title: "Framework Agnostic",
    description:
      "React, Vue, Svelte, Solid, or Vanilla - you choose. Works with any framework.",
  },
  {
    icon: Puzzle,
    title: "Plugin System",
    description:
      "Extend functionality without bloating the core. Core and optional plugins available.",
  },
  {
    icon: Bot,
    title: "LLM Native",
    description:
      "Optimized for AI assistants with structured output and llms.txt generation.",
  },
  {
    icon: Shield,
    title: "TypeScript",
    description:
      "Full type safety out of the box. 100% test coverage on all core modules.",
  },
  {
    icon: CheckCircle2,
    title: "100% Test Coverage",
    description:
      "Every line tested, guaranteed quality. Test coverage verified on every commit.",
  },
];

const installCommands = {
  npm: `npm install @oxog/docs`,
  pnpm: `pnpm add @oxog/docs`,
  yarn: `yarn add @oxog/docs`,
  bun: `bun add @oxog/docs`,
};

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background gradient */}
        <div
          className={cn(
            "absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]",
            "from-primary/20 via-background to-background"
          )}
        />
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl animate-fade-in">
            {/* Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-1.5",
                "text-sm font-medium text-primary bg-primary/10",
                "mb-6"
              )}
            >
              <span>v{VERSION} is now available</span>
              <ArrowRight className="h-4 w-4" />
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Framework-Agnostic{" "}
              <span className="text-primary">Documentation</span> Generator
            </h1>

            {/* Description */}
            <p
              className={cn(
                "text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8")
              }
            >
              Zero-config, plugin-first documentation generator that works with
              React, Vue, Svelte, Solid, or Vanilla. You choose the framework,
              we handle the docs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/docs">
                <Button size="lg" className="cursor-pointer">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a
                href={`https://github.com/${GITHUB_REPO}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg" className="cursor-pointer">
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </Button>
              </a>
            </div>

            {/* Install Command */}
            <div className="max-w-md mx-auto">
              <div
                className={cn(
                  "rounded-lg border border-border bg-card p-4",
                  "text-left"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Install</span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
                <CodeBlock
                  code={installCommands.npm}
                  language="bash"
                  filename="Terminal"
                  showLineNumbers={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with modern tools and best practices. Focus on writing docs,
              not configuring build tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={cn(
                  "rounded-xl border border-border bg-card p-6",
                  "hover:shadow-lg transition-shadow"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center",
                    "mb-4"
                  )}
                >
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Simple to use
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Just create a config file, run the CLI, and start writing your
                documentation in Markdown.
              </p>
              <ul className="space-y-3">
                {[
                  "Automatic route generation",
                  "Plugin-based architecture",
                  "Hot module replacement",
                  "Built-in syntax highlighting",
                  "Dark/Light theme support",
                  "LLM-optimized output",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <CodeBlock
                code={HERO_CODE}
                language="typescript"
                filename="docs.config.ts"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">100%</div>
              <div className="text-sm opacity-80">Test Coverage</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">0</div>
              <div className="text-sm opacity-80">Runtime Dependencies</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">45+</div>
              <div className="text-sm opacity-80">Languages Supported</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">14</div>
              <div className="text-sm opacity-80">Code Themes</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to document?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get started with @oxog/docs today and ship beautiful documentation
            in minutes.
          </p>
          <Link to="/docs">
            <Button size="lg" className="cursor-pointer">
              Read the Docs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
