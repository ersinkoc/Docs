import { defineConfig } from "@oxog/docs";
import vanilla from "@oxog/docs-vanilla";
import defaultTheme from "@oxog/docs-theme-default";

export default defineConfig({
  title: "My Documentation",
  description: "Documentation with custom configuration",
  srcDir: "docs",
  outDir: "dist",
  adapter: vanilla(),
  theme: defaultTheme({
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
      { text: "GitHub", link: "https://github.com/ersinkoc/docs" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/guide/" },
            { text: "Installation", link: "/guide/installation" },
          ],
        },
      ],
      "/api/": [
        {
          text: "Reference",
          items: [
            { text: "Configuration", link: "/api/configuration" },
            { text: "Plugins", link: "/api/plugins" },
          ],
        },
      ],
    },
    footer: {
      message: "Released under MIT License",
      links: [{ text: "GitHub", url: "https://github.com/ersinkoc/docs" }],
    },
  }),
});
