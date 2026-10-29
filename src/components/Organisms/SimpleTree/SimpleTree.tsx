import { SimpleTreeView } from '@mui/x-tree-view';
import React, { Suspense, useMemo, useState } from 'react';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { WithItemDataTestId } from '../../../helpers/dataTestId.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { SearchBoxField } from '../../Molecules/SearchBox/SearchBox.js';
import {
    filterTreeItems,
    readLocalStorage,
    TreePersistenceConfig,
    TreeQueryClient,
    useTreeExpansion,
    useWriteTreeState,
} from '../../internal/tree/treeShared.js';
import { TreeSkeleton } from '../../internal/tree/TreeSkeleton.js';
import { getTreeDynamicComponent } from '../../internal/tree/treeDynamicRegistry.js';
import { SimpleTreeItemComponent } from './SimpleTreeItem.js';

export type { TreePersistenceConfig, TreeQueryClient };

export interface SimpleTreeItem extends WithItemDataTestId {
    itemId: string;
    label: string;
    items?: SimpleTreeItem[];
    expanded?: boolean;
    element?: React.JSX.Element;
    /**
     * Loads this item's children the first time it is expanded and caches them; do not combine it with `items`, which
     * take precedence while `loadItems` still runs. Requires `@tanstack/react-query` and one call to
     * `enableTreeDynamicLoading()` from `@ringpublishing/mui-components/tree-dynamic-loading`.
     */
    loadItems?: (item: SimpleTreeItem) => Promise<SimpleTreeItem[]> | SimpleTreeItem[];
    /**
     * Always show the label tooltip on hover, regardless of whether the label overflows.
     * @default false
     */
    alwaysShowTooltip?: boolean;
    /**
     * Custom tooltip content for the label. When omitted, the label text is shown (on overflow).
     */
    tooltipTitle?: React.ReactNode;
}

export interface SimpleTreeProps extends CommonComponentProps {
    items: SimpleTreeItem[];
    onExpand?: (itemId: string) => void;
    onClickRow?: (itemId: string) => void;
    /**
     * Shows a search box that filters the rows by label and expands them so every match is visible. A row toggled
     * during a search keeps its state until the query is cleared, which restores the rows expanded before the search.
     * @default false
     */
    withSearch?: boolean;
    searchDebounceTime?: number;
    searchPlaceholder?: string;
    selectedItems?: string[];
    onSelectedItemsChange?: (itemIds: string[]) => void;
    persistence?: TreePersistenceConfig;
    /**
     * Optional external `QueryClient` for dynamic loading (`loadItems`). Only used when at least
     * one item has `loadItems`; ignored for fully static trees.
     */
    queryClient?: TreeQueryClient;
    /**
     * Namespaces this tree's query keys in an external `queryClient`; ignored without one. Defaults to an id that
     * changes on every mount, so pass a value unique among the trees sharing the client when a remounted tree (e.g.
     * inside a tab) should reuse its cached children.
     */
    queryKeyPrefix?: string;
}

function hasAnyDynamicItem(items: SimpleTreeItem[]): boolean {
    for (const item of items) {
        if (item.loadItems) return true;
        if (item.items && hasAnyDynamicItem(item.items)) return true;
    }

    return false;
}

function filterItems(items: SimpleTreeItem[], query: string): SimpleTreeItem[] {
    return filterTreeItems(items, query, 'Ring-TreeView-matchedLabel');
}

interface PersistedTreeState {
    selectedItemId?: string | null;
    expandedItems?: string[];
}

/**
 * Static-only render path: same selection / expansion / search / state-
 * persistence behaviour as the dynamic path, but without `QueryClientProvider`
 * or any per-item `useQuery`. `@tanstack/react-query` is never resolved here.
 */
function SimpleTreeStatic(props: SimpleTreeProps): React.JSX.Element {
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
        sx,
        className,
        dataTestIdSuffix,
    } = props;

    const dataTestId = useRingDataTestId('SimpleTree', dataTestIdSuffix);

    const cacheKey = persistence?.cacheKey;
    const restoreExpandedItems = persistence?.restoreExpandedItems;
    const restoreSelectedItem = persistence?.restoreSelectedItem;
    const shouldPersistState = restoreExpandedItems || restoreSelectedItem;
    const stateStorageKey = cacheKey ? `ring-tree-state-${cacheKey}` : null;

    const [search, setSearch] = useState('');

    const filteredItems = useMemo(() => (search !== '' ? filterItems(items, search) : items), [items, search]);

    const { expandedItems, itemsExpandedBeforeSearch, handleExpandToggle } = useTreeExpansion({
        items,
        filteredItems,
        search,
        restoreExpandedItems,
        stateStorageKey,
        onExpand,
    });

    const [internalSelectedItem, setInternalSelectedItem] = useState<string | null>(() => {
        if (restoreSelectedItem && stateStorageKey && selectedItems === undefined) {
            const stored = readLocalStorage<PersistedTreeState>(stateStorageKey);

            return stored?.selectedItemId ?? null;
        }

        return null;
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
                <SimpleTreeItemComponent
                    key={item.itemId}
                    item={item}
                    order={[index]}
                    instanceId=""
                    expandedItems={expandedItems}
                    currentSelectedItem={effectiveSelectedItem}
                    searchQuery={search}
                    dataTestIdSuffix={dataTestIdSuffix}
                />
            ))}
        </SimpleTreeView>
    );
}

export const SimpleTree = (props: SimpleTreeProps): React.JSX.Element => {
    const needsDynamicLoading = useMemo(() => hasAnyDynamicItem(props.items), [props.items]);

    if (!needsDynamicLoading) {
        return <SimpleTreeStatic {...props} />;
    }

    // TanStack-Query–backed implementation, available once `enableTreeDynamicLoading()` ran and fetched on first use.
    const SimpleTreeDynamic = getTreeDynamicComponent('simpleTree');

    return (
        <Suspense fallback={<TreeSkeleton variant="simple" />}>
            <SimpleTreeDynamic {...props} />
        </Suspense>
    );
};
