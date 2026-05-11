import React, { useCallback, useEffect, useState } from 'react';

/**
 * Escape regex metacharacters in `text` so it can be embedded safely into a
 * `new RegExp(...)` source. Without this, special characters typed into the
 * search box (`(`, `[`, `*`, `+`, `?`, `{`, `\`, …) crash the filter when a
 * label happens to contain that character.
 */
export function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface TreeFilterableItem<T> {
    itemId: string;
    label: string;
    items?: T[];
}

/**
 * Filter a tree by `query`, returning a new tree where each surviving item's
 * label is wrapped in `<span class="${highlightClassName}">…</span>` around
 * the matched substrings. An item is kept when its label matches every
 * whitespace-separated word in the query (AND logic) OR when at least one of
 * its descendants does.
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
 * Provide a `cacheKey` to namespace persisted entries; the TanStack Query
 * cache and tree state are read on mount and written on every change.
 */
export interface TreePersistenceConfig {
    cacheKey: string;
    restoreExpandedItems?: boolean;
    restoreSelectedItem?: boolean;
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
 * Sentinel used in the persisted cache to mark a stripped `loadItems` function.
 * Functions can't survive `JSON.stringify`, so on rehydration we'd otherwise
 * lose all signal that an item *had* a loader. Replacing the function with
 * this string lets the renderer recognize a cached item as potentially-
 * dynamic (chevron renders, query stays disabled until the parent's cascading
 * refetch delivers a real function).
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
 * Owns the `expandedItems` state for a tree:
 *  - Seeds from persisted state (when `restoreExpandedItems`) or from the
 *    `expanded` flags on the source items.
 *  - Tracks pre-search expansion in a parallel `itemsExpandedBeforeSearch`
 *    slot so clearing the query restores the user's prior view.
 *  - While a search query is active, expands every visible filtered item.
 *  - Exposes a toggle handler that mirrors changes into the pre-search slot.
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

    useEffect(() => {
        if (search !== '') {
            const filteredItemIds = getAllItemIdsFromFilteredItems(filteredItems);
            setExpandedItems((prev) => Array.from(new Set([...prev, ...filteredItemIds])));
        } else {
            setExpandedItems(itemsExpandedBeforeSearch);
        }
    }, [search, filteredItems, itemsExpandedBeforeSearch]);

    const handleExpandToggle = useCallback(
        (itemId: string): void => {
            const toggle = (prev: string[]): string[] =>
                prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId];
            setExpandedItems(toggle);
            setItemsExpandedBeforeSearch(toggle);
            onExpand?.(itemId);
        },
        [onExpand],
    );

    return { expandedItems, setExpandedItems, itemsExpandedBeforeSearch, handleExpandToggle };
}

/**
 * Persist a partial tree state object (selection + expanded ids, in whatever
 * shape the caller chooses) to localStorage on every change. Pass `null` to
 * disable. The merge preserves any unrelated keys already at this storage
 * slot — e.g. a `selectedItemId` that the caller isn't currently restoring.
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
