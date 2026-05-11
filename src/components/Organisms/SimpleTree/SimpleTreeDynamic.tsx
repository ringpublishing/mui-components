import { SimpleTreeView } from '@mui/x-tree-view';
// Namespace import (`import * as`) so this file compiles against Vite /
// Rollup's optional-peer-dep stub at the consumer's build time when
// `@tanstack/react-query` isn't installed. See `treeQueryClient.ts` for the
// full rationale. Type imports stay separate so we keep proper typing.
import * as ReactQuery from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import React, { useId, useMemo, useState } from 'react';
import { SearchBox } from '../../Molecules/SearchBox/SearchBox.js';
import { useTreePersistence } from '../treeQueryClient.js';
import { filterTreeItems, readLocalStorage, useTreeExpansion, useWriteTreeState } from '../treeShared.js';
import type { SimpleTreeItem, SimpleTreeProps } from './SimpleTree.js';
import { SimpleTreeItemDynamicComponent } from './SimpleTreeItemDynamic.js';

/**
 * Full SimpleTree implementation with TanStack Query–driven dynamic loading.
 * This module is the only file in `SimpleTree/` that imports
 * `@tanstack/react-query`; it is loaded via `React.lazy(...)` from
 * `SimpleTree.tsx` and only when at least one tree item exposes `loadItems`.
 *
 * The component owns its `QueryClientProvider` (or threads through an external
 * one), the per-instance query-key prefixing, the optional localStorage cache
 * persistence, and the per-item `useQuery` rendering via
 * `SimpleTreeItemDynamicComponent`.
 */

function filterItems(items: SimpleTreeItem[], query: string): SimpleTreeItem[] {
    return filterTreeItems(items, query, 'Ring-TreeView-matchedLabel');
}

interface PersistedTreeState {
    selectedItemId?: string | null;
    expandedItems?: string[];
}

const SimpleTreeDynamic = (props: SimpleTreeProps & { queryClient?: QueryClient }): React.JSX.Element => {
    const {
        items,
        withSearch,
        searchDebounceTime,
        searchPlaceholder,
        onExpand,
        onClickRow,
        selectedItems,
        onSelectedItemsChange,
        persistence,
        queryClient: queryClientFromProps,
        queryKeyPrefix,
        sx,
        className,
        dataTestIdSuffix,
    } = props;

    const generatedId = useId();
    const instanceId = queryClientFromProps !== undefined ? (queryKeyPrefix ?? generatedId) : '';

    const restoreExpandedItems = persistence?.restoreExpandedItems;
    const restoreSelectedItem = persistence?.restoreSelectedItem;
    const shouldPersistState = restoreExpandedItems || restoreSelectedItem;

    const { queryClient, stateStorageKey } = useTreePersistence({
        cacheKey: persistence?.cacheKey,
        queryClientFromProps,
    });

    const [search, setSearch] = useState('');

    const [internalSelectedItem, setInternalSelectedItem] = useState<string | null>(() => {
        if (restoreSelectedItem && stateStorageKey && selectedItems === undefined) {
            const stored = readLocalStorage<PersistedTreeState>(stateStorageKey);

            return stored?.selectedItemId ?? null;
        }

        return null;
    });

    const filteredItems = useMemo(() => (search !== '' ? filterItems(items, search) : items), [items, search]);

    const { expandedItems, itemsExpandedBeforeSearch, handleExpandToggle } = useTreeExpansion({
        items,
        filteredItems,
        search,
        restoreExpandedItems,
        stateStorageKey,
        onExpand,
    });

    const effectiveSelectedItem = selectedItems !== undefined ? selectedItems[0] || null : internalSelectedItem;

    const handleSelectionChange = (itemId: string | null): void => {
        if (selectedItems === undefined) {
            setInternalSelectedItem(itemId);
        }

        onSelectedItemsChange?.(itemId ? [itemId] : []);
    };

    useWriteTreeState(
        stateStorageKey,
        shouldPersistState
            ? {
                  ...(restoreSelectedItem && { selectedItemId: effectiveSelectedItem }),
                  ...(restoreExpandedItems && { expandedItems: itemsExpandedBeforeSearch }),
              }
            : null,
    );

    return (
        <ReactQuery.QueryClientProvider client={queryClient}>
            <SimpleTreeView
                expansionTrigger="iconContainer"
                expandedItems={expandedItems}
                selectedItems={effectiveSelectedItem}
                onSelectedItemsChange={(e, itemId): void => handleSelectionChange(itemId as string | null)}
                onItemExpansionToggle={(e, itemId): void => handleExpandToggle(itemId)}
                onItemClick={(e, itemId): void => {
                    e.preventDefault();
                    onClickRow?.(itemId);
                }}
                sx={sx}
                className={className}
            >
                {withSearch && (
                    <SearchBox
                        defaultValue=""
                        searchFunc={setSearch}
                        debounceTime={searchDebounceTime}
                        sx={{
                            height: '40px',
                            borderRadius: '4px',
                            marginY: 1,
                            border: 'none',
                            paddingLeft: '8px',
                        }}
                        labels={{ placeholder: searchPlaceholder }}
                        dataTestIdSuffix={dataTestIdSuffix}
                    />
                )}
                {filteredItems.map((item, index) => (
                    <SimpleTreeItemDynamicComponent
                        key={item.itemId}
                        item={item}
                        order={[index]}
                        instanceId={instanceId}
                        expandedItems={expandedItems}
                        currentSelectedItem={effectiveSelectedItem}
                        searchQuery={search}
                        dataTestIdSuffix={dataTestIdSuffix}
                    />
                ))}
            </SimpleTreeView>
        </ReactQuery.QueryClientProvider>
    );
};

export default SimpleTreeDynamic;
