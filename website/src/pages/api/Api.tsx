import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/code/CodeBlock";

const apiFunctions = [
  {
    name: "defineConfig",
    description: "Define the documentation configuration",
    signature: "function defineConfig(config: DocsConfig): DocsConfig",
    parameters: [
      {
        name: "config",
        type: "DocsConfig",
        description: "Configuration object for the documentation",
      },
    ],
    returns: "DocsConfig",
    example: `import { defineConfig } from '@oxog/docs'

export default defineConfig({
  title: 'My Docs',
  adapter: react(),
})`,
  },
  {
    name: "createRouter",
    description: "Create a router and scan for routes",
    signature: "async function createRouter(srcDir?: string): Promise<Router>",
    parameters: [
      {
        name: "srcDir",
        type: "string",
        description: "Source directory (default: 'docs')",
      },
    ],
    returns: "Promise&lt;Router&gt;",
    example: `import { createRouter } from '@oxog/docs'

const router = await createRouter('docs')
const routes = router.getRoutes()`,
  },
  {
    name: "Builder",
    description: "Build documentation to static files",
    signature: "class Builder extends Kernel<PageInfo>",
    methods: [
      {
        name: "build",
        signature: "async build(): Promise<BuildResult>",
        description: "Build all pages to output directory",
      },
      {
        name: "scan",
        signature: "async scan(): Promise<void>",
        description: "Scan source directory for content files",
      },
    ],
    example: `import { Builder } from '@oxog/docs'

const builder = new Builder(config)
await builder.scan()
await builder.build()`,
  },
];

const typeDefinitions = `interface DocsConfig {
  /** Site title */
  title: string

  /** Site description */
  description?: string

  /** Base URL path */
  base?: string

  /** Source directory */
  srcDir?: string

  /** Output directory */
  outDir?: string

  /** Documentation adapter */
  adapter: Adapter

  /** Theme configuration */
  theme?: ThemeConfig

  /** Plugins to enable */
  plugins?: Plugin[]
}

interface Adapter {
  name: string
  createRenderer: () => Renderer
  transformHtml?: (html: string) => string
  hydrate?: () => void
}

interface Renderer {
  render(content: RenderContent): string | Promise<string>
}

interface Route {
  path: string
  filePath?: string
  frontmatter: Record<string, unknown>
  sidebarPosition?: number
}`;

export function Api() {
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden lg:block sticky top-14 z-40",
          "h-[calc(100vh-3.5rem)] w-64",
          "border-r border-border bg-background overflow-y-auto"
        )}
      >
        <nav className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search API..."
              className={cn(
                "w-full pl-9 pr-4 py-2 rounded-lg",
                "text-sm bg-muted/50 border border-border",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 px-2">Functions</h3>
              <ul className="space-y-1">
                {apiFunctions.map((func) => (
                  <li key={func.name}>
                    <a
                      href={`#${func.name}`}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5",
                        "text-sm text-muted-foreground hover:text-foreground",
                        "hover:bg-accent rounded-md transition-colors"
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                      {func.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 px-2">Types</h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#types"
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5",
                      "text-sm text-muted-foreground hover:text-foreground",
                      "hover:bg-accent rounded-md transition-colors"
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                    DocsConfig
                  </a>
                </li>
                <li>
                  <a
                    href="#types"
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5",
                      "text-sm text-muted-foreground hover:text-foreground",
                      "hover:bg-accent rounded-md transition-colors"
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                    Adapter
                  </a>
                </li>
                <li>
                  <a
                    href="#types"
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5",
                      "text-sm text-muted-foreground hover:text-foreground",
                      "hover:bg-accent rounded-md transition-colors"
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                    Route
                  </a>
                </li>
              </ul>
            </div>
          </div>
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
            <span className="text-foreground">API Reference</span>
          </nav>

          {/* Content */}
          <div className="space-y-12">
            <div>
              <h1 className="text-3xl font-bold mb-4">API Reference</h1>
              <p className="text-lg text-muted-foreground">
                Complete API documentation for @oxog/docs. All functions,
                classes, and types are fully typed and documented.
              </p>
            </div>

            {/* Functions */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Functions</h2>
              <div className="space-y-8">
                {apiFunctions.map((func) => (
                  <div
                    key={func.name}
                    id={func.name}
                    className="scroll-mt-24 border border-border rounded-xl overflow-hidden"
                  >
                    <div className="bg-muted/50 px-6 py-4 border-b border-border">
                      <h3 className="text-lg font-semibold">{func.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {func.description}
                      </p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Signature</h4>
                        <CodeBlock
                          code={func.signature}
                          language="typescript"
                          showLineNumbers={false}
                        />
                      </div>

                      {func.parameters && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Parameters
                          </h4>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-2 pr-4 font-medium">
                                  Name
                                </th>
                                <th className="text-left py-2 pr-4 font-medium">
                                  Type
                                </th>
                                <th className="text-left py-2 font-medium">
                                  Description
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {func.parameters.map((param) => (
                                <tr key={param.name} className="border-b border-border/50">
                                  <td className="py-2 pr-4 font-mono text-primary">
                                    {param.name}
                                  </td>
                                  <td className="py-2 pr-4 font-mono text-muted-foreground">
                                    {param.type}
                                  </td>
                                  <td className="py-2 text-muted-foreground">
                                    {param.description}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium mb-2">Returns</h4>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {func.returns}
                        </code>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Example</h4>
                        <CodeBlock
                          code={func.example}
                          language="typescript"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Types */}
            <section id="types">
              <h2 className="text-2xl font-semibold mb-6">Type Definitions</h2>
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-6 py-4 border-b border-border">
                  <h3 className="text-lg font-semibold">Core Types</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Core type definitions for configuration and routing
                  </p>
                </div>
                <div className="p-6">
                  <CodeBlock code={typeDefinitions} language="typescript" />
                </div>
              </div>
            </section>
          </div>

          {/* Navigation */}
          <nav className="flex items-center justify-between mt-12 pt-8 border-t border-border">
            <Link
              to="/docs"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
              Back to Docs
            </Link>
            <Link
              to="/examples"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Next: Examples
              <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
