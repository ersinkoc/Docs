# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-alpha.0] - 2026-01-05

### Added

- Initial alpha release of @oxog/docs monorepo
- Core packages:
  - `@oxog/docs` - CLI and orchestrator
  - `@oxog/docs-core` - Engine with micro-kernel architecture
  - `@oxog/docs-theme-default` - Default theme
  - `@oxog/docs-react` - React SSG adapter
  - `@oxog/docs-vue` - Vue SSG adapter
  - `@oxog/docs-svelte` - Svelte SSG adapter
  - `@oxog/docs-solid` - Solid SSG adapter
  - `@oxog/docs-vanilla` - Vanilla HTML/Web Components adapter

- Framework-agnostic documentation generation
- Zero-config initialization
- File-based routing
- Markdown processing with frontmatter support
- Plugin system with core and optional plugins
- Default theme with layout, header, sidebar, footer, and TOC
- LLM-native design with llms.txt file
- TypeScript strict mode support
- Vitest with 100% coverage requirements

### Core Plugins (Auto-loaded)

- `markdown-plugin` - Markdown to AST to HTML conversion
- `frontmatter-plugin` - YAML frontmatter extraction
- `routing-plugin` - File-based routing resolution
- `assets-plugin` - Static asset handling
- `codeshine-plugin` - Syntax highlighting

### Optional Plugins

- `search()` - Full-text search with Pagefind
- `sitemap()` - sitemap.xml generation
- `rss()` - RSS feed generation
- `i18n()` - Multi-language support
- `analytics()` - Privacy-friendly analytics
- `mermaid()` - Diagram support
- `toc()` - Table of contents extraction

### CLI Commands

- `init` - Initialize new documentation project
- `dev` - Start development server
- `build` - Production build
- `preview` - Preview production build
- `new <path>` - Create new page

### Examples

- 15 example projects organized by category:
  - 01-minimal - Zero-config start
  - 02-with-config - Custom configuration
  - 03-react-adapter - React usage
  - 04-vue-adapter - Vue usage
  - 05-svelte-adapter - Svelte usage
  - 06-solid-adapter - Solid usage
  - 07-vanilla-adapter - Vanilla/Web Components
  - 08-custom-theme - Theme customization
  - 09-plugins - Using plugins
  - 10-monorepo - Workspace documentation
  - 11-api-docs - API reference style
  - 12-blog - Blog-style docs
  - 13-i18n - Multi-language
  - 14-search - Search integration
  - 15-full-featured - All features combined

### Documentation

- Full API documentation
- Configuration guide
- Plugin development guide
- Theme customization guide
- LLM-optimized llms.txt file

### Technical Requirements

- Node.js >= 18.0.0
- TypeScript >= 5.0
- pnpm workspaces >= 9
- ESM only

### Known Issues

This is an alpha release. Some features may be incomplete or subject to change.

### Breaking Changes (Planned for v1.0.0)

- API may change before stable release
- Plugin interface may be refined
- Configuration format may be adjusted
- Theme API may evolve

---

## [0.0.0] - 2025-12-01

### Added

- Project initialization
- Monorepo setup
- Basic package structure
