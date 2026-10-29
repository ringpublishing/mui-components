import React, { useCallback, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

/**
 * Escape regex metacharacters in `text` so it can be embedded safely into a
 * `new RegExp(...)` source. Without this, special characters typed into the
 * search box (`(`, `[`, `*`, `+`, `?`, `{`, `\`, …) crash the filter when a
 * label happens to contain that character.
 */
export function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Props that make a tree row's expand icon button a pointer affordance only, since the tree item itself owns
 * expansion (`aria-expanded`, arrow keys, a click on the icon container). Focusable, it would be an unnamed,
 * redundant tab stop on every collapsed row.
 */
export const DECORATIVE_EXPAND_BUTTON_PROPS = { tabIndex: -1, 'aria-hidden': true } as const;

/**
 * The text a tree row's label shows — tags stripped (labels may carry the search highlight spans),
 * entities decoded. Used as the accessible name of the row's checkbox.
 */
export function getPlainLabel(label: string): string {
    return DOMPurify.sanitize(label, { ALLOWED_TAGS: [], RETURN_DOM_FRAGMENT: true }).textContent ?? '';
}

/**
 * Where dnd-kit renders its live region and screen-reader instructions: `document.body`, not inside the
 * `role="tree"` list, where only tree items may live; the draggables' `aria-describedby` still resolves there.
 */
export function getDndAccessibilityContainer(): Element | undefined {
    return typeof document === 'undefined' ? undefined : document.body;
}

interface TreeFilterableItem<T> {
    itemId: string;
    label: string;
    items?: T[];
}

/**
 * Filters a tree by `query`, wrapping the matched substrings of each surviving label in
 * `<span class="${highlightClassName}">`. An item survives when its label matches every
 * whitespace-separated word of the query, or when one of its descendants does.
 */
export function filterTreeItems<T extends TreeFilterableItem<T>>(
    items: T[],
    query: string,
    highlightClassName: string,
): T[] {
    const queryWords = query.toLowerCase().trim().split(/\s+/);
    const escapedWords = queryWords.map(escapeRegExp);

    function walk(nodes: T[]): T[] {
        return nodes
            .map((item) => {
                const lowercaseLabel = item.label.toLowerCase();
                const isMatch = queryWords.every((word) => lowercaseLabel.includes(word));

                let highlightedLabel = item.label;

                if (isMatch) {
                    highlightedLabel = escapedWords.reduce((label, escapedWord) => {
                        return label.replace(
                            new RegExp(escapedWord, 'gi'),
                            (match) => `<span class="${highlightClassName}">${match}</span>`,
                        );
                    }, item.label);
                }

                const filteredChildren = item.items ? walk(item.items) : [];

                if (filteredChildren.length > 0) {
                    return { ...item, label: highlightedLabel, items: filteredChildren };
                }

                if (isMatch) {
                    return { ...item, label: highlightedLabel };
                }

                return null;
            })
            .filter((item): item is T => item !== null);
    }

    return walk(items);
}

/**
 * Configuration for `SimpleTree` / `DataTree` localStorage persistence.
 * Provide a `cacheKey` to namespace persisted entries; the tree state and the
 * tree's own queries, not the rest of a shared `queryClient`, are read on
 * mount and written on every change.
 */
export interface TreePersistenceConfig {
    cacheKey: string;
    restoreExpandedItems?: boolean;
    restoreSelectedItem?: boolean;
}

/**
 * A TanStack Query `QueryClient` (v4 or v5), for the `queryClient` prop of `SimpleTree` / `DataTree`. Declared by
 * shape rather than imported, so the package's types do not need `@tanstack/react-query` installed: an app that
 * renders only static trees may not have it.
 */
export interface TreeQueryClient {
    getQueryCache(): unknown;
    getQueryData(...args: never[]): unknown;
    setQueryData(...args: never[]): unknown;
    invalidateQueries(...args: never[]): unknown;
}

export function readLocalStorage<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);

        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

/**
 * Sentinel that replaces a `loadItems` function in the persisted cache, since functions do not
 * survive `JSON.stringify`. A rehydrated item carrying it renders as dynamic (chevron shown) with
 * its query disabled until the parent's refetch delivers a real function.
 */
export const STRIPPED_FN_MARKER = '__ringTreeStrippedFn__';

function serializableReplacer(key: string, value: unknown): unknown {
    if (typeof value === 'function') return key === 'loadItems' ? STRIPPED_FN_MARKER : undefined;
    if (React.isValidElement(value)) return undefined;

    return value;
}

export function writeLocalStorage(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value, serializableReplacer));
    } catch {
        // quota exceeded or private browsing
    }
}

interface TreeItemLike {
    itemId: string;
    expanded?: boolean;
    items?: TreeItemLike[];
}

/**
 * Walk a tree and collect ids of items whose `expanded` flag is set, plus
 * their expanded descendants. Used to seed `expandedItems` from the source
 * data when no persisted state is available.
 */
export function getExpandedItemIds<T extends TreeItemLike>(items: T[]): string[] {
    const expandedItemIds: string[] = [];

    function traverse(treeItems: T[]): void {
        treeItems.forEach((item) => {
            if (item.expanded) {
                expandedItemIds.push(item.itemId);

                if (item.items) {
                    traverse(item.items as T[]);
                }
            }
        });
    }

    traverse(items);

    return expandedItemIds;
}

/**
 * Flatten a tree to the list of ids that should be expanded so every item is
 * visible — used while a search query is active to surface every match.
 */
export function getAllItemIdsFromFilteredItems<T extends TreeItemLike>(items: T[]): string[] {
    const allIds: string[] = [];

    function traverse(treeItems: T[]): void {
        treeItems.forEach((item) => {
            allIds.push(item.itemId);

            if (item.items && item.items.length > 0) {
                traverse(item.items as T[]);
            }
        });
    }

    traverse(items);

    return allIds;
}

interface UseTreeExpansionArgs<T extends TreeItemLike> {
    items: T[];
    filteredItems: T[];
    search: string;
    restoreExpandedItems: boolean | undefined;
    stateStorageKey: string | null;
    onExpand?: (itemId: string) => void;
}

interface UseTreeExpansionResult {
    expandedItems: string[];
    setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
    itemsExpandedBeforeSearch: string[];
    handleExpandToggle: (itemId: string) => void;
}

/**
 * Owns the `expandedItems` state for a tree: seeded from persisted state (with
 * `restoreExpandedItems`) or the items' `expanded` flags, expanded to every visible item while a
 * search query is active, and restored to the pre-search view when the query is cleared. Rows toggled
 * during a search keep their state until the query is cleared, and are neither kept after it nor persisted.
 */
export function useTreeExpansion<T extends TreeItemLike>(args: UseTreeExpansionArgs<T>): UseTreeExpansionResult {
    const { items, filteredItems, search, restoreExpandedItems, stateStorageKey, onExpand } = args;

    const [expandedItems, setExpandedItems] = useState<string[]>(() => {
        if (restoreExpandedItems && stateStorageKey) {
            const stored = readLocalStorage<{ expandedItems?: string[] }>(stateStorageKey);
            if (stored?.expandedItems) return stored.expandedItems;
        }

        return getExpandedItemIds(items);
    });

    const [itemsExpandedBeforeSearch, setItemsExpandedBeforeSearch] = useState(expandedItems);
    const [itemsCollapsedDuringSearch, setItemsCollapsedDuringSearch] = useState<string[]>([]);

    useEffect(() => {
        if (search !== '') {
            const filteredItemIds = getAllItemIdsFromFilteredItems(filteredItems);
            setExpandedItems((prev) =>
                Array.from(new Set([...prev, ...filteredItemIds])).filter(
                    (id) => !itemsCollapsedDuringSearch.includes(id),
                ),
            );
        } else {
            setExpandedItems(itemsExpandedBeforeSearch);
            setItemsCollapsedDuringSearch((prev) => (prev.length === 0 ? prev : []));
        }
    }, [search, filteredItems, itemsExpandedBeforeSearch, itemsCollapsedDuringSearch]);

    const handleExpandToggle = useCallback(
        (itemId: string): void => {
            const toggle = (prev: string[]): string[] =>
                prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId];
            setExpandedItems(toggle);

            if (search === '') {
                setItemsExpandedBeforeSearch(toggle);
            } else if (expandedItems.includes(itemId)) {
                setItemsCollapsedDuringSearch((prev) => [...prev, itemId]);
            } else {
                setItemsCollapsedDuringSearch((prev) => prev.filter((id) => id !== itemId));
            }

            onExpand?.(itemId);
        },
        [expandedItems, onExpand, search],
    );

    return { expandedItems, setExpandedItems, itemsExpandedBeforeSearch, handleExpandToggle };
}

/**
 * Persists a partial tree state object (selection and expanded ids, in the caller's shape) to
 * localStorage on every change, merging over unrelated keys already stored there. Pass `null` to
 * disable.
 */
export function useWriteTreeState(stateStorageKey: string | null, partial: Record<string, unknown> | null): void {
    const partialJson = partial === null ? null : JSON.stringify(partial);

    useEffect(() => {
        if (!stateStorageKey || partial === null) return;
        const existing = readLocalStorage<Record<string, unknown>>(stateStorageKey) ?? {};
        writeLocalStorage(stateStorageKey, { ...existing, ...partial });
        // `partial` is rebuilt every render; `partialJson` is the stable dep.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateStorageKey, partialJson]);
}
