# TreeView Components Spec

Both tree components are backed by `@tanstack/react-query` for dynamic loading and share a common persistence model. Use `SimpleTree` for compact navigation trees; use `DataTree` for data-heavy tables with nested rows.

---

## When to use which

| Need | Component |
|---|---|
| File/folder navigator, sidebar nav, category picker | `SimpleTree` |
| Data with columns, checkboxes, row actions, drag-and-drop | `DataTree` |
| You need both compact and data features | Use two separate instances |

`TreeView` (the old component) is deprecated. New code should use `SimpleTree` or `DataTree`.

---

## SimpleTree

### Visual style
- Compact rows (~18px icon, 8px nesting indent per level).
- Selection is shown with a blue `blue[100]` background on the selected row.
- Expand/collapse uses chevron arrows (down = collapsed, up = expanded).
- No checkboxes, no columns, no drag-and-drop, no row actions.

### Items (`SimpleTreeItem[]`)

```ts
interface SimpleTreeItem {
    itemId: string;          // unique, stable ID
    label: string;           // displayed text; may contain HTML when search is active
    items?: SimpleTreeItem[]; // static children
    expanded?: boolean;      // initially expanded (only read once on mount)
    element?: React.JSX.Element; // optional badge/chip rendered after the label
    loadItems?: (item: SimpleTreeItem) => Promise<SimpleTreeItem[]> | SimpleTreeItem[];
}
```

- `itemId` must be unique across the entire tree, including dynamic children.
- `expanded: true` pre-expands the node at mount. Changing it after mount has no effect — expansion state is managed internally.
- `element` renders inline at the trailing edge of the label row (useful for counts, status chips).
- `loadItems` makes the node dynamic (see [Dynamic loading](#dynamic-loading)).
- Static `items` and `loadItems` are mutually exclusive per node; providing both is undefined behaviour.

### Selection

Single-select only. Two modes:

**Uncontrolled** — omit `selectedItems` and `onSelectedItemsChange`. The component tracks selection internally. The initially-selected item can be restored from localStorage when `persistence.restoreSelectedItem` is enabled.

**Controlled** — provide both `selectedItems: string[]` and `onSelectedItemsChange: (ids: string[]) => void`. Only `selectedItems[0]` is used (the array form is kept for API symmetry with DataTree). The consumer owns state. `onSelectedItemsChange` is called with a one-element array or an empty array on deselect.

Rules:
- Clicking a row fires `onClickRow(itemId)` then, if the tree is not in checkbox mode, also `onSelectedItemsChange`.
- Clicking an already-selected row deselects it (`onSelectedItemsChange([])`).
- The expand/collapse icon does **not** change selection.

### Expand / Collapse

- Clicking the icon container toggles expansion; clicking the label row does **not** toggle expansion.
- `onExpand(itemId)` is called when a node is expanded (not on collapse).
- Multiple nodes can be expanded simultaneously.
- Expansion state is entirely internal to the component. The `expanded` field on items is the initial value only.
- When search is active, all nodes whose labels (or whose descendants' labels) match are automatically expanded. When search is cleared, the tree reverts to the pre-search expansion state.

### Search

Enabled with `withSearch={true}`.

- Renders a `SearchBox` above the tree.
- Filtering is multi-word: the query is split on whitespace and all words must match (case-insensitive).
- Matching label text is wrapped in `<span class="Ring-TreeView-matchedLabel">` and styled in the theme's primary colour.
- Non-matching leaf nodes are removed from the rendered tree; parent nodes are kept if any descendant matches.
- Dynamic children that have already been loaded are included in the search. Children that have not been loaded yet are not searchable.
- `searchDebounceTime` (default `500`ms) controls how long after the user stops typing before the filter runs.
- `searchPlaceholder` sets the placeholder text.

### Dynamic loading (`loadItems`)

When a node has `loadItems`, it behaves as a lazy branch:

- The query is **not** issued until the user expands the node.
- While loading, the collapse icon is replaced with a spinner.
- On success, the returned `SimpleTreeItem[]` are rendered as children. `staleTime: Infinity` means the result is never re-fetched automatically — it is cached for the life of the `QueryClient`.
- On error, both expand and collapse icons are replaced with a refresh icon (mirrored arrow). Clicking it clears the cached error state and retries the query.
- If `loadItems` returns a synchronous array (not a Promise), it is still treated as a query and cached.

Query key format: `['simpleTreeItem', instanceId, itemId]`

`instanceId` is `''` when using the internal client (making the key stable across remounts for persistence), or `queryKeyPrefix ?? useId()` when an external client is provided (preventing collisions between multiple trees on the same page).

### Persistence (`persistence` prop)

```ts
persistence?: {
    cacheKey: string;
    restoreExpandedItems?: boolean;
    restoreSelectedItem?: boolean;
}
```

- `cacheKey` namespaces two localStorage entries:
  - `ring-tree-cache-{cacheKey}` — serialised TanStack Query cache (dynamic children).
  - `ring-tree-state-{cacheKey}` — `{ expandedItems: string[], selectedItemId: string | null }`.
- `restoreExpandedItems`: on mount, reads `expandedItems` from localStorage and uses it as the initial expanded set. On every expansion toggle, the new state is written back.
- `restoreSelectedItem`: on mount, reads `selectedItemId` and uses it as the initial selection **only in uncontrolled mode** (ignored when `selectedItems` prop is provided). On every selection change, the new value is written back.
- The query cache is serialised on every TanStack Query cache change (via `getQueryCache().subscribe()`). Non-serialisable values (React elements, functions) are stripped automatically.
- When an external `queryClient` is provided, localStorage cache hydration happens in `useLayoutEffect` (before the first paint) to prevent a flash of unloaded state.

### External `QueryClient` (`queryClient` prop)

- By default, the component creates its own internal `QueryClient` (invisible to the rest of the app).
- Pass `queryClient` to share a client across components or to connect React Query DevTools.
- When sharing a client between multiple `SimpleTree` instances, set a unique `queryKeyPrefix` on each to avoid cache collisions. Without it, the component falls back to a `useId()`-generated prefix (stable within a single mount, changes on remount).
- Persistence (localStorage hydration) still works with an external client — the component handles it in a one-time `useLayoutEffect`.

### Props summary

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `SimpleTreeItem[]` | — | Tree data |
| `selectedItems` | `string[]` | — | Controlled selection (use `[0]`) |
| `onSelectedItemsChange` | `(ids: string[]) => void` | — | Selection callback |
| `onExpand` | `(itemId: string) => void` | — | Called on expand (not collapse) |
| `onClickRow` | `(itemId: string) => void` | — | Called on row click |
| `withSearch` | `boolean` | `false` | Show search box |
| `searchDebounceTime` | `number` | `500` | Debounce in ms |
| `searchPlaceholder` | `string` | — | Search input placeholder |
| `persistence` | `TreePersistenceConfig` | — | localStorage persistence |
| `queryClient` | `QueryClient` | — | External TanStack Query client |
| `queryKeyPrefix` | `string` | — | Namespace prefix for query keys (required when sharing a client) |
| `sx` | `SxProps` | — | MUI sx override |
| `className` | `string` | — | Root class name |
| `dataTestIdSuffix` | `string` | — | Appended to data-testid attributes |

---

## DataTree

### Visual style
- Full-featured rows (~40px height, 32px nesting indent per level).
- Selection is shown with an `info.main` background and border.
- Expand/collapse uses `+` / `−` icons in a fixed-width icon column at the left edge.
- Supports columns, checkboxes, row actions, and drag-and-drop.

### Items (`DataTreeItem`)

```ts
interface DataTreeItem {
    itemId: string;
    label: string;
    items?: DataTreeItem[];
    expanded?: boolean;
    rowActions?: Action[];
    withCheckbox?: boolean;      // default true (if checkboxes enabled globally)
    checked?: boolean;           // initial checked state
    checkboxDisabled?: boolean;  // greyed-out, non-interactive checkbox
    element?: React.JSX.Element;
    loadItems?: (item: DataTreeItem) => Promise<DataTreeItem[]> | DataTreeItem[];
    [columnName: string]: any;   // column values by column.name
}
```

- Column values are passed as top-level properties matching the `name` of each `DataTreeColumn` definition.
- `withCheckbox: false` hides the checkbox for that specific row even when `onCheckboxChange` is wired up globally.

### Columns (`columns` prop)

```ts
interface DataTreeColumn {
    name: string;    // matches the property name on DataTreeItem
    width: number;   // pixel width
    header?: string; // shown in column headers row
}
```

- Columns are rendered after the label column.
- `showColumnHeaders={true}` renders a non-scrolling header row above the tree.
- `itemsLabelColumnHeader` sets the header text for the label column when headers are shown.

### Checkboxes

- Enable by providing `onCheckboxChange: (itemId: string, checked: boolean) => void`.
- When enabled, all rows show a checkbox by default. Set `withCheckbox: false` on a specific item to hide its checkbox.
- `checkboxDisabled: true` renders a non-interactive (but visible) checkbox.
- Checkbox clicks do **not** trigger row selection (`onSelectedItemsChange`).
- Multi-select keyboard behaviour (shift-click, ctrl-click) is handled by MUI's `SimpleTreeView` when `onCheckboxChange` is provided.
- Parent/child check synchronisation (cascade check) is the **consumer's responsibility** — the component calls `onCheckboxChange` per item clicked and does not modify sibling or parent state.

### Selection

Multi-select when `onCheckboxChange` is provided; single-select otherwise.

**Uncontrolled** — omit `selectedItems`. Internal state is used. Restored from localStorage when `persistence.restoreSelectedItem` is enabled.

**Controlled** — provide `selectedItems: string[]` and `onSelectedItemsChange: (ids: string[]) => void`. In single-select mode `selectedItems` contains at most one ID.

- Row clicks only fire `onClickRow` when `onClickRow` is provided. Without it, `disableSelection` is set on the underlying `SimpleTreeView` so rows are not visually focusable.

### Row actions

- Each item can have `rowActions: Action[]`. A `MoreVert` icon button appears at the trailing edge of the row when `rowActions` is set.
- `Action` is `{ label: string; icon: React.ReactNode }`.
- Clicking the icon opens an `ActionBox` popover. Clicking the icon does not propagate to the row click handler.

### Search

Same filtering logic as `SimpleTree`. The `SearchBox` is rendered at the top when `withSearch={true}`. Dynamic children already in cache are searchable; unloaded nodes are not.

### Dynamic loading

Same TanStack Query mechanics as `SimpleTree`. Query key: `['dataTreeItem', instanceId, itemId]`.

Error state shows a mirrored-refresh icon on both expand and collapse slots. Clicking either retries the query.

### Persistence

Same as `SimpleTree`. State shape stored in localStorage:
```ts
{ selectedItemIds: string | string[]; expandedItems: string[] }
```

### Drag-and-drop

Drag-and-drop is powered by `@dnd-kit/core` + `@dnd-kit/sortable`.

#### Enabling

- **Reorder only**: provide `onDragAndDropEnd`.
- **Reorder + drop-in**: provide both `onDragAndDropEnd` and `onDropIn`.
- `onDropIn` alone does **not** enable drag — `onDragAndDropEnd` is always required to make items draggable.

#### Which items can be dragged

- Only **collapsed** items can be dragged. Expanded items (those with children that are currently open) are non-draggable — they show a tooltip instead.
- `dragAndDropTooltipTitle` sets the tooltip text shown on non-draggable items. `dragAndDropTooltipPlacement` controls its position (default `'top'`).
- Leaf items (no `items`, no `loadItems`) are always draggable when `onDragAndDropEnd` is provided.

#### Drop indicators

Two mutually exclusive indicators are shown during a drag:

1. **Drop line** — a horizontal blue line between two items, showing where the dragged item will be inserted if dropped. The line appears at the gap closest to the cursor.
2. **Drop-in border** — a blue border around a collapsed item, showing that the dragged item will become its last child if dropped.

Drop-in takes precedence: if the dragged item's center is within a collapsed item's row area (≥ 50% IoU overlap), the drop-in border is shown. Otherwise the drop-line is shown.

#### Reorder callback (`onDragAndDropEnd`)

```ts
onDragAndDropEnd: (
    sourceAbsolutePosition: number[],
    destinationAbsolutePosition: number[]
) => void
```

Both arguments are **index paths** through the tree. Example: `[0, 2]` means `items[0].items[2]`. The destination index is the index **at which the item should be inserted** after the source has been removed — consumer must implement `splice` accordingly (see `WithDragAndDrop` story for a reference implementation).

The consumer owns the `items` state and must update it; the component calls `onDragAndDropEnd` and re-renders with the new `items` prop.

#### Drop-in callback (`onDropIn`)

```ts
onDropIn: (itemId: string, dropInItemId: string) => void
```

Called when a dragged item is dropped onto a collapsed target. The dragged item should become the **last child** of the target. The consumer owns the state mutation (see `WithDropIn` story for a reference `dropInItem` helper).

Only collapsed items are valid drop-in targets — hovering over an expanded node shows the drop-line indicator, not the drop-in border.

#### Drag detection details

- Drag starts after 50ms hold with ≤10px tolerance (prevents accidental drags on clicks).
- Keyboard drag is supported via `KeyboardSensor`.
- Drop indicators update on every `onDragMove` event via `rectIntersection` collision detection.
- Drop-in IoU threshold: **0.5** — the central ~67% of the target row triggers drop-in; the thin edge zones trigger drop-line.
- The dragged item is excluded from its own collision candidates (can't drop onto itself).

### Props summary

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `DataTreeItem[]` | — | Tree data |
| `columns` | `DataTreeColumn[]` | — | Column definitions |
| `showColumnHeaders` | `boolean` | `false` | Render column header row |
| `itemsLabelColumnHeader` | `string` | `''` | Label column header text |
| `selectedItems` | `string[]` | — | Controlled selection |
| `onSelectedItemsChange` | `(ids: string[]) => void` | — | Selection callback |
| `onExpand` | `(itemId: string) => void` | — | Called on expand |
| `onClickRow` | `(itemId: string) => void` | — | Called on row click |
| `onCheckboxChange` | `(itemId: string, checked: boolean) => void` | — | Enables checkboxes |
| `onDragAndDropEnd` | `(src: number[], dst: number[]) => void` | — | Enables drag; reorder callback |
| `onDropIn` | `(itemId: string, targetId: string) => void` | — | Drop-in (nest under target) callback |
| `dragAndDropTooltipTitle` | `string` | — | Tooltip on non-draggable expanded items |
| `dragAndDropTooltipPlacement` | `PopperProps['placement']` | `'top'` | Tooltip placement |
| `withSearch` | `boolean` | `false` | Show search box |
| `searchDebounceTime` | `number` | `500` | Debounce in ms |
| `searchPlaceholder` | `string` | — | Search input placeholder |
| `persistence` | `TreePersistenceConfig` | — | localStorage persistence |
| `queryClient` | `QueryClient` | — | External TanStack Query client |
| `queryKeyPrefix` | `string` | — | Namespace prefix for query keys |
| `sx` | `SxProps` | — | MUI sx override |
| `className` | `string` | — | Root class name |
| `dataTestIdSuffix` | `string` | — | Appended to data-testid attributes |

---

## Shared behaviours

### Query key namespacing

Each tree instance scopes its query keys with an `instanceId`:

- **Internal client** (default): `instanceId = ''`. Keys are `['simpleTreeItem', '', itemId]`. The empty string is intentional — it keeps keys stable across remounts so localStorage-persisted cache survives page reloads.
- **External client**: `instanceId = queryKeyPrefix ?? useId()`. `useId()` is stable within a mount but changes on remount (e.g. tab switching). If stability across remounts matters, provide an explicit `queryKeyPrefix`.

When multiple trees share the same external client and no `queryKeyPrefix` is set, they get different `useId()` values automatically — but those values are not stable across remounts. Provide `queryKeyPrefix` if you need remount-stable cache with a shared client.

### Error handling for dynamic nodes

Both trees implement identical retry behaviour:
1. Expand node → query fires.
2. Query fails → `isError=true` → both expand and collapse icons become a retry icon.
3. User clicks retry icon → `removeQueries` clears the errored cache entry, then `refetch()` retries.
4. On success, children render normally.

### localStorage key scheme

| Key | Contents |
|---|---|
| `ring-tree-cache-{cacheKey}` | `Array<[queryKey, data]>` — serialised TanStack Query cache entries |
| `ring-tree-state-{cacheKey}` | `{ expandedItems: string[], selectedItemId: string \| null }` (SimpleTree) or `{ expandedItems: string[], selectedItemIds: string \| string[] }` (DataTree) |

Both keys are written independently. Clearing one does not affect the other.

---

## Migration from `TreeView`

| `TreeView` prop | `SimpleTree` equivalent | `DataTree` equivalent |
|---|---|---|
| `variant="compact"` | (use `SimpleTree`) | — |
| `variant="default"` | — | (use `DataTree`) |
| `items` | `items` | `items` |
| `withSearch` | `withSearch` | `withSearch` |
| `selectedItems` | `selectedItems` | `selectedItems` |
| `onSelectedItemsChange` | `onSelectedItemsChange` | `onSelectedItemsChange` |
| `onExpand` | `onExpand` | `onExpand` |
| `onClickRow` | `onClickRow` | `onClickRow` |
| `columns` | — | `columns` |
| `showColumnHeaders` | — | `showColumnHeaders` |
| `onCheckboxChange` | — | `onCheckboxChange` |
| `onDragAndDropEnd` | — | `onDragAndDropEnd` |
| `onDropIn` | — | `onDropIn` |
