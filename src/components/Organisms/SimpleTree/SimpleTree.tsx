import { SimpleTreeView } from '@mui/x-tree-view';
import React, { Suspense, lazy, useMemo, useState } from 'react';
// `import type { … }` is required (over `type X = import(...).Y`) so esbuild's
// TS transform reliably erases the import — otherwise Vite's optional-peer-dep
// plugin replaces `@tanstack/react-query` with a stub at module load time and
// the static path crashes when the package is not installed.
import type { QueryClient } from '@tanstack/react-query';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { SearchBox } from '../../Molecules/SearchBox/SearchBox.js';
import {
    filterTreeItems,
    readLocalStorage,
    TreePersistenceConfig,
    useTreeExpansion,
    useWriteTreeState,
} from '../treeShared.js';
import { TreeSkeleton } from '../TreeSkeleton.js';
import { SimpleTreeItemComponent } from './SimpleTreeItem.js';

export type { TreePersistenceConfig };

export interface SimpleTreeItem {
    itemId: string;
    label: string;
    items?: SimpleTreeItem[];
    expanded?: boolean;
    element?: React.JSX.Element;
    loadItems?: (item: SimpleTreeItem) => Promise<SimpleTreeItem[]> | SimpleTreeItem[];
}

export interface SimpleTreeProps extends CommonComponentProps {
    items: SimpleTreeItem[];
    onExpand?: (itemId: string) => void;
    onClickRow?: (itemId: string) => void;
    withSearch?: boolean;
    searchDebounceTime?: number;
    searchPlaceholder?: string;
    selectedItems?: string[];
    onSelectedItemsChange?: (itemIds: string[]) => void;
    persistence?: TreePersistenceConfig;
    /**
     * Optional external `QueryClient` for dynamic-loading (`loadItems`).
     * Only consulted when at least one item exposes `loadItems`; passing this
     * implicitly opts the tree into the dynamic code path.
     */
    queryClient?: QueryClient;
    /**
     * Namespaces query keys for this tree instance. Required when multiple trees of the same
     * type share an external `queryClient` (e.g. two `SimpleTree`s on the same page) or when
     * the tree is mounted inside a tab that can unmount/remount — otherwise two instances may
     * collide on the same cache entry. When omitted, a stable per-mount ID is used
     * (safe for the default internal-client case).
     */
    queryKeyPrefix?: string;
}

/**
 * Lazily-loaded TanStack-Query–backed implementation. The dynamic chunk owns
 * the `QueryClientProvider`, the `useQuery`-driven items, and the optional
 * cache hydration / persistence. Bundlers split it into a separate file that
 * is fetched only when a tree contains at least one item with `loadItems`.
 */
const SimpleTreeDynamicLazy = lazy(() => import('./SimpleTreeDynamic.js'));

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

    return (
        <Suspense fallback={<TreeSkeleton variant="simple" />}>
            <SimpleTreeDynamicLazy {...props} />
        </Suspense>
    );
};
