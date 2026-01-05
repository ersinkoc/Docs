import { defineConfig } from "@oxog/docs";
import vanilla from "@oxog/docs-vanilla";

// Custom theme configuration
const customTheme = {
  logo: "/logo.svg",
  primaryColor: "#ff6600",
  fontFamily: {
    sans: "Inter, system-ui, sans-serif",
    mono: "JetBrains Mono, monospace",
  },
};

export default defineConfig({
  title: "Custom Theme Docs",
  adapter: vanilla(),
  theme: {
    ...customTheme,
    nav: [{ text: "Guide", link: "/guide/" }],
    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/guide/" },
            { text: "Customization", link: "/guide/customization" },
          ],
        },
      ],
    },
    footer: {
      message: "Built with @oxog/docs",
    },
  },
});
