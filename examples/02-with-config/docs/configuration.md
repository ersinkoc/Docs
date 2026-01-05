# Configuration Guide

Learn how to configure your documentation site.

## Basic Configuration

```typescript
import { defineConfig } from "@oxog/docs";
import vanilla from "@oxog/docs-vanilla";

export default defineConfig({
  title: "My Docs",
  description: "My documentation",
  adapter: vanilla(),
});
```

## Options

| Option      | Type    | Default | Description         |
| ----------- | ------- | ------- | ------------------- |
| title       | string  | -       | Site title          |
| description | string  | ''      | Site description    |
| srcDir      | string  | 'docs'  | Source directory    |
| outDir      | string  | 'dist'  | Output directory    |
| adapter     | Adapter | -       | Framework adapter   |
| theme       | Theme   | -       | Theme configuration |

## Theme Configuration

```typescript
export default defineConfig({
  theme: defaultTheme({
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' }
    ],
    sidebar: {
      '/guide/': [
        { text: 'Getting Started', items: [...] }
      ]
    }
  })
})
```
