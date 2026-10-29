# ADR-005: TreeView split into SimpleTree / DataTree with TanStack Query

## Status

Accepted (April 2026)

## Context

The `TreeView` component supported two variants via a `variant` prop: `"compact"` and `"default"`. These variants diverged significantly in both styling and feature set:

| | Compact (`SimpleTree`) | Default (`DataTree`) |
|---|---|---|
| Nesting indent | 8px | 32px |
| Icon style | Chevron arrows, 18px | +/- icons, 32px |
| Selection colors | `blue[100]` / `blue[50]` | `info.main` border |
| Checkboxes | No | Yes |
| Columns | No | Yes |
| Drag-and-drop | No | Yes |
| Row actions | No | Yes |

Keeping both variants in a single component led to:
- Growing conditional logic in the rendering code (icon selection, styling, feature gating).
- Prop pollution — consumers of the compact tree were exposed to props like `columns`, `onDragAndDropEnd`, and `onCheckboxChange` that did nothing in their variant.
- Difficulty reasoning about which features applied to which variant.

Additionally, the tree's dynamic child-loading feature relied on a hand-rolled recursive fetch mechanism backed by a global `Map` (`globalDynamicItemsCache`). This cache:
- Was shared across all tree instances (risk of key collisions).
- Had no built-in stale-time, retry, or error-state management.
- Required manual invalidation.

## Decision

### 1. Split into two standalone components

- **`SimpleTree`** — compact styling, single selection, search, custom elements, dynamic loading. No checkboxes, columns, or drag-and-drop.
- **`DataTree`** — full-featured: columns, checkboxes, drag-and-drop with drop-in, row actions, search, dynamic loading.

Each component owns its own types (`SimpleTreeItem` / `DataTreeItem`, `SimpleTreeProps` / `DataTreeProps`), keeping the public API surface clean.

### 2. Replace custom cache with TanStack Query

Both components use `@tanstack/react-query` (v4 or v5) to power the `loadItems` dynamic-loading mechanism:
- Each component creates its own internal `QueryClient` via `useState`, wrapped in a `QueryClientProvider`. Consumers do **not** need to set up a `QueryClientProvider` themselves.
- Query keys are scoped per item (`['simpleTreeItem', instanceId, itemId]` / `['dataTreeItem', instanceId, itemId]`), avoiding cross-instance collisions.
- `staleTime: Infinity` prevents unnecessary refetches; `retry: false` gives consumers explicit control over error handling via the existing retry UI.
- TanStack Query is declared as a peer dependency (`"^4.0.0 || ^5.0.0"`) since the API surface used (`useQuery` with `queryKey` / `queryFn` / `enabled` / `staleTime` / `retry`) is identical across both major versions.

### 3. Add optional localStorage persistence

Both components accept a `persistence` prop:

```typescript
persistence?: {
    cacheKey: string;              // namespaces localStorage keys
    restoreExpandedItems?: boolean; // persist/restore which items are expanded
    restoreSelectedItem?: boolean;  // persist/restore which item is selected
}
```

When `cacheKey` is provided, the tree's queries in the TanStack Query cache are serialized to localStorage on every change to them and hydrated on mount. Non-serializable values (React elements, functions) are automatically stripped during serialization.

`restoreExpandedItems` and `restoreSelectedItem` independently control whether the expanded state and selection are persisted and restored across page reloads. Selection restore only applies in uncontrolled mode (when the `selectedItems` prop is not provided).

### 4. Optional external `QueryClient`

Both `SimpleTree` and `DataTree` accept an optional `queryClient` prop. When provided, dynamic-loading queries are registered on that instance instead of the internal one—useful to inspect or invalidate tree queries alongside the rest of the app (e.g. React Query DevTools). When omitted, behavior is unchanged: each component creates its own `QueryClient` and wraps children in `QueryClientProvider`. If `persistence.cacheKey` is set, localStorage hydration and writes still apply to whichever client is used, and cover only the tree's own queries: the rest of a shared client is neither saved nor restored.

### 5. Keep the old TreeView for backward compatibility

The original `TreeView` component remains in place, unchanged by this decision, with `@deprecated` JSDoc annotations on all its exported identifiers (`TreeView`, `TreeViewProps`, `TreeViewItem`, `CommonTreeViewProps`, `VariantType`, `globalDynamicItemsCache`). The deprecation messages point consumers to `SimpleTree` or `DataTree`. The Storybook title is updated to `Organisms/TreeView (Deprecated)`. It later received accessibility fixes, the `RotateCw` retry glyph and `data-testid` changes.

No breaking change is introduced — existing consumers can continue using `TreeView` as-is.

### 6. Dynamic loading is an opt-in entry point (amended October 2026)

The first version lazy-loaded the TanStack-backed implementation from the main entry (`React.lazy(() => import('./SimpleTreeDynamic.js'))`) and relied on the bundler tolerating a missing optional peer. That did not hold:

- webpack / Rspack / Next.js resolve every module in the graph, lazy chunks included, and fail the build when `@tanstack/react-query` is missing.
- Vite substitutes a stub for a missing optional peer. In Vite 6 the production stub was an empty module; in Vite 8 it throws on evaluation. App `manualChunks` rules that group modules whose id contains `@ringpublishing/mui-components` also capture the stub (its id contains the package name), so the throw ends up in a vendor chunk loaded at startup and the whole app fails to render. Any reference from the main entry, even a guarded `import()`, produces that stub.

The main entry now contains no reference to `@tanstack/react-query`, in code or in types. Dynamic loading is enabled by calling `enableTreeDynamicLoading()` from a second entry, `@ringpublishing/mui-components/tree-dynamic-loading`, which registers the lazy implementations in `treeDynamicRegistry.ts`. Apps that use `loadItems` make that call once; apps that don't never reference the package. It is a function call rather than a bare side-effect import, so tree-shaking and lint rules cannot drop it. A tree with `loadItems` rendered before the call throws during render, an error naming the call, and recovers on its next render once the call has run. The `queryClient` prop is typed by shape (`TreeQueryClient`) so the package root's declarations need no `@tanstack/react-query` either.

Alternatives considered: making `@tanstack/react-query` a regular dependency (non-breaking, but installs it for every app and gives up the shared-instance guarantee a peer gives `queryClient`), and a guarded `import()` inside the library (fixes webpack, not the Vite 8 vendor-chunk case).

## Consequences

- **Easier**: Each component has a focused API — consumers import only what they need, with no dead props. Dynamic loading gets automatic caching, error states, and retry for free via TanStack Query. localStorage persistence is opt-in and zero-config beyond providing a key.
- **Clearer**: The two components map directly to two distinct UI patterns. No variant prop to remember.
- **Peer dependency**: `@tanstack/react-query` (v4 or v5) is listed under `peerDependencies` for `SimpleTree` / `DataTree`. In `package.json`, `peerDependenciesMeta` marks it as **optional** so installs that never use those trees are not forced to resolve it; apps that do use them should still install it explicitly.
- **Opt-in call** (decision 6): apps using `loadItems` must also call `enableTreeDynamicLoading()` from `@ringpublishing/mui-components/tree-dynamic-loading`. This is a breaking change for apps that used `loadItems` before the amendment. `package.json` exposes the entry through `exports`.
- **Migration effort**: Consumers currently using `TreeView` with `variant="compact"` should migrate to `SimpleTree`; those using the default variant should migrate to `DataTree`. The prop interfaces are intentionally close to the original to minimize migration friction.
- **Deprecated code remains**: The old `TreeView` and its `globalDynamicItemsCache` are still shipped in the bundle. They can be removed in a future major version.

## Affected components

- `SimpleTree` (`src/components/Organisms/SimpleTree/SimpleTree.tsx`, `SimpleTreeItem.tsx`)
- `DataTree` (`src/components/Organisms/DataTree/DataTree.tsx`, `DataTreeItem.tsx`)
- `TreeView` (`src/components/Organisms/TreeView/TreeView.tsx`) — deprecated, unchanged by this decision
- `src/components/index.ts` — new exports added
- `src/components/Organisms/treeDynamicRegistry.ts`, `src/treeDynamicLoading.ts` — opt-in dynamic-loading entry (decision 6)
- `package.json` — `@tanstack/react-query` as peer + dev dependency; `peerDependenciesMeta` optional flag
