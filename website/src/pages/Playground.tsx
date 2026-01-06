import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Play,
  Copy,
  Check,
  RefreshCw,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/code/CodeBlock";
import { Button } from "@/components/ui/button";

const presets = [
  {
    name: "Basic Config",
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
    name: "React Adapter",
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
    name: "With Plugins",
    code: `import { defineConfig } from '@oxog/docs'
import react from '@oxog/docs-react'
import toc from '@oxog/docs-toc'

export default defineConfig({
  title: 'My Docs',
  adapter: react(),
  plugins: [
    toc({
      headings: ['h2', 'h3'],
    }),
  ],
})`,
  },
];

export function Playground() {
  const [code, setCode] = useState(presets[0].code);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"config" | "preview">("config");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const params = new URLSearchParams();
    params.set("code", btoa(code));
    window.history.pushState({}, "", `${window.location.pathname}?${params}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Playground</span>
      </nav>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Playground</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experiment with @oxog/docs configuration in your browser. Write code,
            see results, and share your creations.
          </p>
        </div>

        {/* Main Playground */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Configuration</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setCode(preset.code)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm",
                    "transition-colors cursor-pointer",
                    code === preset.code
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Code Editor */}
            <div className="border border-border rounded-xl overflow-hidden">
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-2",
                  "bg-muted/50 border-b border-border"
                )}
              >
                <span className="text-sm font-mono">docs.config.ts</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCode(presets[0].code)}
                    className="p-1 hover:bg-accent rounded cursor-pointer"
                    aria-label="Reset"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={cn(
                  "w-full h-96 p-4 font-mono text-sm",
                  "bg-background resize-none",
                  "focus:outline-none"
                )}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Preview</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("config")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer",
                    activeTab === "config"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  Config
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer",
                    activeTab === "preview"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  Output
                </button>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2",
                  "bg-muted/50 border-b border-border"
                )}
              >
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-sm text-muted-foreground">Preview</span>
              </div>
              <div className="p-6 bg-muted/20 min-h-96">
                {activeTab === "config" ? (
                  <CodeBlock
                    code={`// Configuration preview

${code}`}
                    language="typescript"
                    showLineNumbers={false}
                  />
                ) : (
                  <div className="prose prose-sm dark:prose-invert">
                    <p className="text-muted-foreground">
                      Run <code>npx @oxog/docs dev</code> to see your
                      documentation in action.
                    </p>
                    <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                      <h3 className="font-semibold mb-2">Output Structure</h3>
                      <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
{`dist/
├── index.html
├── api/
│   └── index.html
├── assets/
│   └── styles.css
└── llms.txt`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button className="cursor-pointer">
                <Play className="h-4 w-4 mr-2" />
                Run Build
              </Button>
              <Button variant="outline" className="cursor-pointer">
                <Share2 className="h-4 w-4 mr-2" />
                Share Config
              </Button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 p-6 bg-muted/30 rounded-xl">
          <h3 className="font-semibold mb-4">Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Use{" "}
              <code className="px-1.5 py-0.5 bg-muted rounded text-foreground">
                Ctrl+Enter
              </code>{" "}
              to run the build
            </li>
            <li>
              • Click the share button to generate a shareable URL with your
              configuration
            </li>
            <li>
              • Presets demonstrate common patterns and best practices
            </li>
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between mt-12 pt-8 border-t border-border max-w-6xl mx-auto">
        <Link
          to="/examples"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Examples
        </Link>
        <Link
          to="/docs"
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Read the Docs
          <ChevronRight className="h-4 w-4" />
        </Link>
      </nav>
    </div>
  );
}
