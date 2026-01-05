# React Adapter Example

This documentation site is built using the **React adapter**.

## Features

- React 18 support
- Server-side rendering
- Client hydration
- Component-based theming

## Getting Started

```bash
npm install @oxog/docs @oxog/docs-react react react-dom
```

## Configuration

```typescript
import { defineConfig } from "@oxog/docs";
import react from "@oxog/docs-react";

export default defineConfig({
  title: "My React Docs",
  adapter: react(),
});
```
