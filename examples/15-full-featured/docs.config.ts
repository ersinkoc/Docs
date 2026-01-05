import { defineConfig } from "@oxog/docs";
import vanilla from "@oxog/docs-vanilla";
import defaultTheme from "@oxog/docs-theme-default";
import { search, sitemap } from "@oxog/docs-core/plugins";

export default defineConfig({
  title: "Full-Featured Documentation",
  description: "Documentation with all features enabled",
  adapter: vanilla(),
  theme: defaultTheme({
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
      { text: "Examples", link: "/examples/" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/guide/" },
            { text: "Installation", link: "/guide/installation" },
            { text: "Configuration", link: "/guide/configuration" },
          ],
        },
      ],
      "/api/": [
        {
          text: "Reference",
          items: [
            { text: "Configuration", link: "/api/configuration" },
            { text: "Plugins", link: "/api/plugins" },
            { text: "Themes", link: "/api/themes" },
          ],
        },
      ],
      "/examples/": [
        {
          text: "Examples",
          items: [
            { text: "Basic", link: "/examples/basic" },
            { text: "Advanced", link: "/examples/advanced" },
          ],
        },
      ],
    },
    footer: {
      message: "Released under MIT License",
      links: [
        { text: "GitHub", url: "https://github.com/ersinkoc/docs" },
        { text: "NPM", url: "https://npmjs.com/package/@oxog/docs" },
      ],
    },
  }),
  plugins: [sitemap({ hostname: "https://docs.example.com" })],
});
