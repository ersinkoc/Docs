import { defineConfig } from "@oxog/docs";
import react from "@oxog/docs-react";
import defaultTheme from "@oxog/docs-theme-default";

export default defineConfig({
  title: "React Documentation",
  description: "Documentation built with React",
  adapter: react(),
  theme: defaultTheme({
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
    ],
  }),
});
