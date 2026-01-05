# Custom Theme Example

This example demonstrates theme customization.

## Theme Options

- **Primary Color**: Change the accent color
- **Font Family**: Customize typography
- **Logo**: Add your brand logo
- **Navigation**: Configure menu items
- **Sidebar**: Organize content structure

## Example

```typescript
export default defineConfig({
  theme: {
    primaryColor: "#ff6600",
    fontFamily: {
      sans: "Inter, system-ui, sans-serif",
      mono: "JetBrains Mono, monospace",
    },
  },
});
```

## Dark Mode

The default theme includes dark mode support.
