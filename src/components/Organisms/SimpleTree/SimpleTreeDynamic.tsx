import { SimpleTreeView } from '@mui/x-tree-view';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { useId, useMemo, useState } from 'react';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { SearchBoxField } from '../../Molecules/SearchBox/SearchBox.js';
import { useTreePersistence } from '../../internal/tree/treeQueryClient.js';
import {
    filterTreeItems,
    readLocalStorage,
    useTreeExpansion,
    useWriteTreeState,
} from '../../internal/tree/treeShared.js';
import type { SimpleTreeItem, SimpleTreeProps } from './SimpleTree.js';
import { SimpleTreeItemDynamicComponent } from './SimpleTreeItemDynamic.js';

/**
 * Full SimpleTree implementation with TanStack Query dynamic loading, registered by
 * `enableTreeDynamicLoading()` and loaded lazily from `SimpleTree.tsx` when an item exposes `loadItems`.
 * It owns the `QueryClientProvider`, the query-key prefixing and the optional localStorage cache persistence.
 */

function filterItems(items: SimpleTreeItem[], query: string): SimpleTreeItem[] {
    return filterTreeItems(items, query, 'Ring-TreeView-matchedLabel');
}

interface PersistedTreeState {
    selectedItemId?: string | null;
    expandedItems?: string[];
}

const SimpleTreeDynamic = (props: SimpleTreeProps): React.JSX.Element => {
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

    const dataTestId = useRingDataTestId('SimpleTree', dataTestIdSuffix);

    const generatedId = useId();
    const instanceId = queryClientFromProps !== undefined ? (queryKeyPrefix ?? generatedId) : '';

    const restoreExpandedItems = persistence?.restoreExpandedItems;
    const restoreSelectedItem = persistence?.restoreSelectedItem;
    const shouldPersistState = restoreExpandedItems || restoreSelectedItem;

    const { queryClient, stateStorageKey } = useTreePersistence({
        cacheKey: persistence?.cacheKey,
        queryClientFromProps,
        queryKeyRoot: 'simpleTreeItem',
        instanceId,
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
        <QueryClientProvider client={queryClient}>
            <SimpleTreeView
                data-testid={dataTestId}
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
                    <SearchBoxField
                        defaultValue=""
                        searchFunc={setSearch}
                        debounceTime={searchDebounceTime}
                        isBorderless={true}
                        sx={{
                            marginY: 1,
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
        </QueryClientProvider>
    );
};

export default SimpleTreeDynamic;
