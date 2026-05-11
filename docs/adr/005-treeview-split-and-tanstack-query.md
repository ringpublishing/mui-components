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
- Query keys are scoped per item (`['simpleTreeItem', itemId]` / `['dataTreeItem', itemId]`), avoiding cross-instance collisions.
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

When `cacheKey` is provided, the TanStack Query cache is serialized to localStorage on every cache change and hydrated on mount. Non-serializable values (React elements, functions) are automatically stripped during serialization.

`restoreExpandedItems` and `restoreSelectedItem` independently control whether the expanded state and selection are persisted and restored across page reloads. Selection restore only applies in uncontrolled mode (when the `selectedItems` prop is not provided).

### 4. Optional external `QueryClient`

Both `SimpleTree` and `DataTree` accept an optional `queryClient` prop. When provided, dynamic-loading queries are registered on that instance instead of the internal one—useful to inspect or invalidate tree queries alongside the rest of the app (e.g. React Query DevTools). When omitted, behavior is unchanged: each component creates its own `QueryClient` and wraps children in `QueryClientProvider`. If `persistence.cacheKey` is set, localStorage hydration and writes still apply to whichever client is used.

### 5. Keep the old TreeView for backward compatibility

The original `TreeView` component remains in place, untouched, with `@deprecated` JSDoc annotations on all its exported identifiers (`TreeView`, `TreeViewProps`, `TreeViewItem`, `CommonTreeViewProps`, `VariantType`, `globalDynamicItemsCache`). The deprecation messages point consumers to `SimpleTree` or `DataTree`. The Storybook title is updated to `Organisms/TreeView (Deprecated)`.

No breaking change is introduced — existing consumers can continue using `TreeView` as-is.

## Consequences

- **Easier**: Each component has a focused API — consumers import only what they need, with no dead props. Dynamic loading gets automatic caching, error states, and retry for free via TanStack Query. localStorage persistence is opt-in and zero-config beyond providing a key.
- **Clearer**: The two components map directly to two distinct UI patterns. No variant prop to remember.
- **Peer dependency**: `@tanstack/react-query` (v4 or v5) is listed under `peerDependencies` for `SimpleTree` / `DataTree`. In `package.json`, `peerDependenciesMeta` marks it as **optional** so installs that never use those trees are not forced to resolve it; apps that do use them should still install it explicitly.
- **Migration effort**: Consumers currently using `TreeView` with `variant="compact"` should migrate to `SimpleTree`; those using the default variant should migrate to `DataTree`. The prop interfaces are intentionally close to the original to minimize migration friction.
- **Deprecated code remains**: The old `TreeView` and its `globalDynamicItemsCache` are still shipped in the bundle. They can be removed in a future major version.

## Affected components

- `SimpleTree` (`src/components/Organisms/SimpleTree/SimpleTree.tsx`, `SimpleTreeItem.tsx`)
- `DataTree` (`src/components/Organisms/DataTree/DataTree.tsx`, `DataTreeItem.tsx`)
- `TreeView` (`src/components/Organisms/TreeView/TreeView.tsx`) — deprecated, unchanged
- `src/components/index.ts` — new exports added
- `package.json` — `@tanstack/react-query` as peer + dev dependency; `peerDependenciesMeta` optional flag
