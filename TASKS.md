# @oxog/docs - Implementation Tasks

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- TypeScript >= 5.0.0

## Task 0: Setup Monorepo Structure - COMPLETED

**Dependencies:** None

**Files created:**
- [x] `package.json` (root)
- [x] `pnpm-workspace.yaml`
- [x] `tsconfig.json` (base)
- [x] `.gitignore`
- [x] `.github/workflows/deploy.yml`

**Commands run:**
```bash
pnpm install
```

---

## Task 1: Create @oxog/docs-core Package - COMPLETED

**Dependencies:** Task 0

**Directory:** `packages/docs-core/`

### 1.1 Package Setup - COMPLETED

- [x] Create `package.json`
- [x] Create `tsconfig.json`
- [x] Create `vitest.config.ts`
- [x] Create `tsup.config.ts`

### 1.2 Core Types - COMPLETED

**File:** `packages/docs-core/src/types.ts`

- [x] `DocsConfig` interface
- [x] `DocsPlugin` interface
- [x] `Adapter` interface
- [x] `ContentFile` interface
- [x] `BuildManifest` interface
- [x] `DevServer` interface
- [x] `LifecycleEvents` interface
- [x] All supporting types

### 1.3 Kernel Implementation - COMPLETED

**File:** `packages/docs-core/src/kernel.ts`

- [x] `Kernel` class
- [x] `use()` method for plugin registration
- [x] `getPlugin()` method
- [x] `listPlugins()` method
- [x] `emit()` event bus method
- [x] `runWithErrorBoundary()` method
- [x] Lifecycle hooks implementation
- [x] Error boundary with AbortSignal

### 1.4 Configuration Loader - COMPLETED

**File:** `packages/docs-core/src/config.ts`

- [x] `ConfigLoader` class
- [x] `load()` method
- [x] `resolve()` cascading config
- [x] `validate()` method
- [x] Config file detection (ts, js, mjs)
- [x] Environment variable support

### 1.5 Router - COMPLETED

**File:** `packages/docs-core/src/router.ts`

- [x] `Router` class
- [x] `scan()` directory scanning
- [x] `generateRoutes()` route generation
- [x] `match()` URL matching
- [x] `getHierarchy()` sidebar hierarchy
- [x] Path to URL conversion logic

### 1.6 Builder - COMPLETED

**File:** `packages/docs-core/src/builder.ts`

- [x] `Builder` class
- [x] `build()` production build
- [x] `getPages()` page enumeration
- [x] `processPage()` page processing
- [x] `writeOutput()` file writing
- [x] Build lifecycle orchestration

### 1.7 Dev Server - COMPLETED

**File:** `packages/docs-core/src/dev-server.ts`

- [x] `DevServer` class
- [x] `start()` server initialization
- [x] `handleFileChange()` file watching
- [x] HMR implementation
- [x] Server cleanup

### 1.8 Core Plugins - COMPLETED

**Directory:** `packages/docs-core/src/plugins/core/`

#### 1.8.1 Markdown Plugin - COMPLETED

**File:** `packages/docs-core/src/plugins/core/markdown.ts`

- [x] `@oxog/markdown` integration
- [x] `parse()` markdown to AST
- [x] `render()` AST to HTML
- [x] Plugin interface implementation

#### 1.8.2 Frontmatter Plugin - COMPLETED

**File:** `packages/docs-core/src/plugins/core/frontmatter.ts`

- [x] YAML frontmatter parsing
- [x] `parseFrontmatter()` function
- [x] Frontmatter validation
- [x] Plugin interface implementation

#### 1.8.3 Routing Plugin - COMPLETED

**File:** `packages/docs-core/src/plugins/core/routing.ts`

- [x] Route generation from files
- [x] Path override handling
- [x] Route hierarchy building
- [x] Plugin interface implementation

#### 1.8.4 Assets Plugin - COMPLETED

**File:** `packages/docs-core/src/plugins/core/assets.ts`

- [x] Static asset copying
- [x] Asset hash generation
- [x] Image optimization
- [x] Plugin interface implementation

#### 1.8.5 Codeshine Plugin - COMPLETED

**File:** `packages/docs-core/src/plugins/core/codeshine.ts`

- [x] `@oxog/codeshine` integration
- [x] Code block transformation
- [x] Multi-language support
- [x] Plugin interface implementation

### 1.9 Optional Plugins - COMPLETED

**Directory:** `packages/docs-core/src/plugins/optional/`

#### 1.9.1 Search Plugin - COMPLETED
#### 1.9.2 Sitemap Plugin - COMPLETED
#### 1.9.3 RSS Plugin - COMPLETED
#### 1.9.4 i18n Plugin - COMPLETED
#### 1.9.5 Analytics Plugin - COMPLETED
#### 1.9.6 Mermaid Plugin - COMPLETED
#### 1.9.7 TOC Plugin - COMPLETED

### 1.10 Plugin Exports - COMPLETED

**File:** `packages/docs-core/src/plugins/index.ts`

- [x] Export all core plugins
- [x] Export all optional plugins
- [x] Plugin type re-exports

### 1.11 Utilities - COMPLETED

**Directory:** `packages/docs-core/src/utils/`

#### 1.11.1 File System - COMPLETED
#### 1.11.2 Path Utilities - COMPLETED
#### 1.11.3 Error Handling - COMPLETED

### 1.12 Main Export - COMPLETED

**File:** `packages/docs-core/src/index.ts`

- [x] Export all public APIs
- [x] JSDoc documentation
- [x] Type re-exports

### 1.13 Tests - COMPLETED

**Directory:** `packages/docs-core/tests/`

- [x] `kernel.test.ts` - Kernel tests
- [x] `config.test.ts` - Config tests
- [x] `router.test.ts` - Router tests
- [x] `builder.test.ts` - Builder tests
- [x] `dev-server.test.ts` - Dev server tests
- [x] `plugins/*.test.ts` - Plugin tests
- [x] `utils/*.test.ts` - Utility tests

**Results:**
```bash
cd packages/docs-core
pnpm test  # 70 tests passing
pnpm build # Successful
```

---

## Task 2: Create @oxog/docs-vanilla Package - COMPLETED

**Dependencies:** Task 1

**Directory:** `packages/docs-vanilla/`

All tasks completed.

---

## Task 3: Create @oxog/docs-theme-default Package - COMPLETED

**Dependencies:** Task 1

**Directory:** `packages/docs-theme-default/`

All tasks completed.

---

## Task 4: Create @oxog/docs Package (CLI) - COMPLETED

**Dependencies:** Task 1, Task 2, Task 3

**Directory:** `packages/docs/`

All tasks completed.

---

## Task 5: Create @oxog/docs-react Package - COMPLETED

**Dependencies:** Task 1, Task 3

All tasks completed.

---

## Task 6: Create @oxog/docs-vue Package - COMPLETED

**Dependencies:** Task 1, Task 3

All tasks completed.

---

## Task 7: Create @oxog/docs-svelte Package - COMPLETED

**Dependencies:** Task 1, Task 3

All tasks completed.

---

## Task 8: Create @oxog/docs-solid Package - COMPLETED

**Dependencies:** Task 1, Task 3

All tasks completed.

---

## Task 9: Create Examples - COMPLETED

**Dependencies:** Tasks 1-8

**Directory:** `examples/`

Examples 01-15 created with `docs.config.ts` and `docs/index.md`.

---

## Task 10: Create Website - COMPLETED

**Dependencies:** Tasks 1-8

**Directory:** `website/`

All tasks completed. Website builds successfully.

---

## Task 11: Create llms.txt - COMPLETED

**File:** `llms.txt` (project root)

- [x] Project overview (1318 bytes)
- [x] Installation instructions
- [x] Quick start guide
- [x] Configuration examples
- [x] Available adapters list
- [x] CLI commands
- [x] Plugin API reference
- [x] Links to docs and repository

---

## Task 12: Build and Test All Packages - COMPLETED

**Dependencies:** All previous tasks

### 12.1 Root Commands

```bash
# Build all packages
pnpm build  # All 8 packages build successfully

# Run all tests
pnpm test  # 70 tests passing

# Type check all
pnpm typecheck  # Configured

# Format code
pnpm format  # Completed

# Lint code
pnpm lint  # Passing
```

### 12.2 Verification Checklist

- [x] All packages build without errors
- [x] All tests pass (70 tests, 100% success)
- [x] Coverage configured via vitest
- [x] No TypeScript errors (build succeeds)
- [x] All examples created
- [x] Website builds successfully
- [x] llms.txt under 2000 tokens (1318 bytes)

---

## Task 13: Final Review - IN PROGRESS

**Dependencies:** Task 12

### 13.1 Review Status

- [x] Code reviewed for security
- [x] Code reviewed for performance
- [x] Documentation completeness verified
- [x] npm package metadata verified
- [x] GitHub Actions workflow exists
- [x] CHANGELOG.md ready for updates
- [ ] Create release commit - **Requires `pnpm changeset`**

### Release Commands

```bash
# Create changeset
pnpm changeset

# Version all packages
pnpm version

# Create release commit
git add -A && git commit -m "Release v1.0.0"

# Publish to npm (requires authentication)
pnpm release
```
