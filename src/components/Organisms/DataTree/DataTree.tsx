import React, { Suspense, useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { SimpleTreeView } from '@mui/x-tree-view';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Box, PopperProps, Theme, Typography } from '@mui/material';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { WithItemDataTestId } from '../../../helpers/dataTestId.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { Action } from '../../../types.js';
import { SearchBox } from '../../Molecules/SearchBox/SearchBox.js';
import {
    filterTreeItems,
    getDndAccessibilityContainer,
    readLocalStorage,
    TreePersistenceConfig,
    TreeQueryClient,
    useTreeExpansion,
    useWriteTreeState,
} from '../../internal/tree/treeShared.js';
import { TreeSkeleton } from '../../internal/tree/TreeSkeleton.js';
import { getTreeDynamicComponent } from '../../internal/tree/treeDynamicRegistry.js';
import { DataTreeItemComponent } from './DataTreeItem.js';

const DROP_LINE_TOP = '43px';
const DROP_LINE_HEIGHT = '2px';
const DROP_LINE_DOT_SIZE = '8px';
const COLUMN_HEADERS_PADDING_LEFT = '42px';
const LABEL_COLUMN_BASE_WIDTH = 320;
const NEST_INDENT = 32;
const ROW_ACTIONS_WIDTH = '35px';

export interface DataTreeItem extends WithItemDataTestId {
    itemId: string;
    label: string;
    items?: DataTreeItem[];
    expanded?: boolean;
    rowActions?: Action[];
    withCheckbox?: boolean;
    checked?: boolean;
    checkboxDisabled?: boolean;
    element?: React.JSX.Element;
    /**
     * Loads this item's children the first time it is expanded and caches them; do not combine it with `items`, which
     * take precedence while `loadItems` still runs. Requires `@tanstack/react-query` and one call to
     * `enableTreeDynamicLoading()` from `@ringpublishing/mui-components/tree-dynamic-loading`.
     */
    loadItems?: (item: DataTreeItem) => Promise<DataTreeItem[]> | DataTreeItem[];
    /**
     * Always show the label tooltip on hover, regardless of whether the label overflows.
     * @default false
     */
    alwaysShowTooltip?: boolean;
    /**
     * Custom tooltip content for the label. When omitted, the label text is shown (on overflow).
     */
    tooltipTitle?: React.ReactNode;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [columnName: string]: any;
}

export interface DataTreeColumn {
    name: string;
    width: number;
    header?: string;
}

export interface DataTreeProps extends CommonComponentProps {
    items: DataTreeItem[];
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
    columns?: DataTreeColumn[];
    showColumnHeaders?: boolean;
    itemsLabelColumnHeader?: string;
    onCheckboxChange?: (itemId: string, checked: boolean) => void;
    onDragAndDropEnd?: (sourceAbsolutePosition: number[], destinationAbsolutePosition: number[]) => void;
    onDropIn?: (itemId: string, dropInItemId: string) => void;
    dragAndDropTooltipTitle?: string;
    dragAndDropTooltipPlacement?: PopperProps['placement'];
    /**
     * Accessible name of the icon button that opens an item's `rowActions` menu. A blank value counts as not provided.
     * @default 'More actions'
     */
    rowActionsAriaLabel?: string;
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

interface PersistedTreeState {
    selectedItemIds?: string | string[];
    expandedItems?: string[];
}

function hasAnyDynamicItem(items: DataTreeItem[]): boolean {
    for (const item of items) {
        if (item.loadItems) return true;
        if (item.items && hasAnyDynamicItem(item.items)) return true;
    }

    return false;
}

function getAllItemIds(items: DataTreeItem[]): string[] {
    const allItemIds: string[] = [];

    function traverse(items: DataTreeItem[]): void {
        items.forEach((item) => {
            allItemIds.push(item.itemId);

            if (item.items) {
                traverse(item.items);
            }
        });
    }

    traverse(items);

    return allItemIds;
}

export function filterDataTreeItems(items: DataTreeItem[], query: string): DataTreeItem[] {
    return filterTreeItems(items, query, 'Ring-DataTree-matchedLabel');
}

function getItemIndexById(itemId: string, items: DataTreeItem[]): number[] {
    function findIndexPath(items: DataTreeItem[], targetId: string, path: number[]): number[] | null {
        for (let i = 0; i < items.length; i++) {
            const currentPath = [...path, i];

            if (items[i].itemId === targetId) {
                return currentPath;
            }

            if (items[i].items) {
                const childPath = findIndexPath(items[i].items as DataTreeItem[], targetId, currentPath);

                if (childPath) {
                    return childPath;
                }
            }
        }

        return null;
    }

    const result = findIndexPath(items, itemId, []);

    if (!result) {
        throw new Error(`Item with id "${itemId}" not found.`);
    }

    return result;
}

function getItemParentByItemId(itemId: string, items: DataTreeItem[]): DataTreeItem | null {
    for (const item of items) {
        if (item.items) {
            for (const child of item.items) {
                if (child.itemId === itemId) {
                    return item;
                }

                const foundItem = getItemParentByItemId(itemId, item.items);

                if (foundItem) {
                    return foundItem;
                }
            }
        }
    }

    return null;
}

function getFlatListOfVisibleItems(
    items: DataTreeItem[],
    expandedItems: string[],
): (DataTreeItem & { order: number[] })[] {
    const flatList: (DataTreeItem & { order: number[] })[] = [];

    function traverse(items: DataTreeItem[], order: number[]): void {
        items.forEach((item, index) => {
            const newOrder = [...order, index];

            flatList.push({ ...item, order: newOrder });

            if (item.items && expandedItems.includes(item.itemId)) {
                traverse(item.items, newOrder);
            }
        });
    }

    traverse(items, []);

    return flatList;
}

interface Collision {
    id: string;
    data: {
        value: number;
    };
}

/**
 * Static-only DataTree render path. Same selection / expansion / search /
 * state-persistence / DnD behaviour as the dynamic path, but without
 * `QueryClientProvider` or any per-item `useQuery` — `@tanstack/react-query`
 * is never resolved here.
 */
function DataTreeStatic(props: DataTreeProps): React.JSX.Element {
    const {
        items,
        columns,
        showColumnHeaders = false,
        itemsLabelColumnHeader = '',
        onExpand,
        onClickRow,
        onCheckboxChange,
        onDragAndDropEnd,
        onDropIn,
        dragAndDropTooltipTitle,
        dragAndDropTooltipPlacement = 'top',
        rowActionsAriaLabel,
        withSearch = false,
        searchDebounceTime = 500,
        sx,
        className,
        searchPlaceholder,
        selectedItems,
        onSelectedItemsChange,
        persistence,
        dataTestIdSuffix,
    } = props;

    const dataTestId = useRingDataTestId('DataTree', dataTestIdSuffix);

    const cacheKey = persistence?.cacheKey;
    const restoreExpandedItems = persistence?.restoreExpandedItems;
    const restoreSelectedItem = persistence?.restoreSelectedItem;
    const shouldPersistState = restoreExpandedItems || restoreSelectedItem;
    const stateStorageKey = cacheKey ? `ring-tree-state-${cacheKey}` : null;

    const [query, setQuery] = useState('');

    const filteredItems = useMemo(() => (query !== '' ? filterDataTreeItems(items, query) : items), [items, query]);

    const { expandedItems, setExpandedItems, itemsExpandedBeforeSearch, handleExpandToggle } = useTreeExpansion({
        items,
        filteredItems,
        search: query,
        restoreExpandedItems,
        stateStorageKey,
        onExpand,
    });

    const [internalSelectedItems, setInternalSelectedItems] = useState<string | string[]>(() => {
        if (restoreSelectedItem && stateStorageKey && selectedItems === undefined) {
            const stored = readLocalStorage<PersistedTreeState>(stateStorageKey);

            return stored?.selectedItemIds ?? [];
        }

        return [];
    });

    const isMultiSelect = onCheckboxChange !== undefined;

    const effectiveSelectedItems =
        selectedItems ??
        (isMultiSelect
            ? Array.isArray(internalSelectedItems)
                ? internalSelectedItems
                : []
            : Array.isArray(internalSelectedItems)
              ? internalSelectedItems[0] || null
              : internalSelectedItems);

    const handleSelectionChange = (itemIds: string | string[] | null): void => {
        if (selectedItems === undefined) {
            setInternalSelectedItems(itemIds || []);
        }

        const idsArray = itemIds === null ? [] : Array.isArray(itemIds) ? itemIds : [itemIds];
        onSelectedItemsChange?.(idsArray);
    };

    useWriteTreeState(
        stateStorageKey,
        shouldPersistState
            ? {
                  ...(restoreSelectedItem && { selectedItemIds: internalSelectedItems }),
                  ...(restoreExpandedItems && { expandedItems: itemsExpandedBeforeSearch }),
              }
            : null,
    );

    const itemsIds = getAllItemIds(items);

    const [isDragging, setIsDragging] = useState(false);
    const [dropLineUnderId, setDropLineUnderId] = useState<string | null>(null);
    const [dropInId, setDropInId] = useState<string | null>(null);

    const visibleItems = getFlatListOfVisibleItems(items, expandedItems);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleCollisions = useCallback(
        (itemId: string, collisions: Collision[]): void => {
            setDropInId(null);
            setDropLineUnderId(null);

            if (onDragAndDropEnd === undefined && onDropIn === undefined) return;

            let collisionsWithOtherItems = collisions.filter((c) => c.id !== itemId);

            if (onDropIn) {
                const dropInCandidate =
                    collisionsWithOtherItems.filter(
                        (c) => c.data.value >= 0.5 && !expandedItems.includes(c.id as string),
                    )[0]?.id || null;

                if (dropInCandidate) {
                    setDropInId(dropInCandidate);

                    return;
                }
            }

            if (onDragAndDropEnd === undefined) return;

            if (collisionsWithOtherItems.length > 2) {
                const parentItemsInCollisions = collisionsWithOtherItems.reduce((acc, c) => {
                    const parentItem = getItemParentByItemId(c.id, items);

                    if (parentItem) {
                        acc.push(parentItem.itemId);
                    }

                    return acc;
                }, [] as string[]);

                collisionsWithOtherItems = collisionsWithOtherItems.filter(
                    (c) => !parentItemsInCollisions.includes(c.id),
                );
            }

            if (collisionsWithOtherItems.length === 2) {
                const item1Index = visibleItems.findIndex((i) => i.itemId === collisionsWithOtherItems[0].id);
                const item2Index = visibleItems.findIndex((i) => i.itemId === collisionsWithOtherItems[1].id);

                if (Math.abs(item1Index - item2Index) === 1) {
                    const firstItem = visibleItems[Math.min(item1Index, item2Index)];
                    setDropLineUnderId(firstItem?.itemId || null);
                } else {
                    const previousItemId = visibleItems[Math.max(item1Index, item2Index) - 1]?.itemId;
                    previousItemId && previousItemId !== itemId && setDropLineUnderId(previousItemId);
                }
            } else if (collisionsWithOtherItems.length === 1) {
                const itemIndex = visibleItems.findIndex((i) => i.itemId === collisionsWithOtherItems[0].id);

                switch (itemIndex) {
                    case 0: {
                        setDropLineUnderId('FIRST');
                        break;
                    }
                    case visibleItems.length - 1: {
                        setDropLineUnderId(visibleItems[itemIndex].itemId);
                        break;
                    }
                    default: {
                        const previousItemId = visibleItems[itemIndex - 1]?.itemId;
                        previousItemId && previousItemId !== itemId && setDropLineUnderId(previousItemId);
                        break;
                    }
                }
            }
        },
        [items, visibleItems, expandedItems, onDropIn, onDragAndDropEnd, setDropInId, setDropLineUnderId],
    );

    return (
        <SimpleTreeView
            data-testid={dataTestId}
            expansionTrigger="iconContainer"
            expandedItems={expandedItems}
            checkboxSelection={onCheckboxChange !== undefined}
            multiSelect={onCheckboxChange !== undefined}
            disableSelection={onClickRow === undefined}
            selectedItems={effectiveSelectedItems}
            onSelectedItemsChange={(e, itemIds): void => handleSelectionChange(itemIds)}
            onItemExpansionToggle={(e, itemId): void => handleExpandToggle(itemId)}
            onItemClick={(e, itemId): void => {
                e.preventDefault();
                onClickRow?.(itemId);
            }}
            onItemSelectionToggle={(e, itemId, checked): void => onCheckboxChange?.(itemId, checked)}
            sx={{
                '& .ring-data-tree-item-drop-line-under': {
                    position: 'absolute',
                    top: DROP_LINE_TOP,
                    height: DROP_LINE_HEIGHT,
                    width: '100%',
                    left: '0px',
                    zIndex: 2,
                    backgroundColor: (theme: Theme) => theme.palette.primary.main,
                    '&:before, &:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-3px',
                        width: DROP_LINE_DOT_SIZE,
                        height: DROP_LINE_DOT_SIZE,
                        borderRadius: '50%',
                        border: (theme: Theme) => `${DROP_LINE_HEIGHT} solid ${theme.palette.primary.main}`,
                        zIndex: 2,
                    },
                    '&:before': {
                        left: `-${DROP_LINE_DOT_SIZE}`,
                    },
                    '&:after': {
                        right: `-${DROP_LINE_DOT_SIZE}`,
                    },
                },
                ...sx,
            }}
            className={classNames('ring-data-tree', className)}
        >
            {withSearch && (
                <SearchBox
                    defaultValue={''}
                    searchFunc={(q): void => setQuery(q)}
                    debounceTime={searchDebounceTime}
                    sx={{ marginY: 1 }}
                    labels={{ placeholder: searchPlaceholder }}
                />
            )}
            {showColumnHeaders && (
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: COLUMN_HEADERS_PADDING_LEFT,
                        marginY: 1,
                    }}
                >
                    <Typography variant={'caption'} width={`calc(${LABEL_COLUMN_BASE_WIDTH}px - ${NEST_INDENT}px)`}>
                        {itemsLabelColumnHeader}
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: `calc(100% - ${LABEL_COLUMN_BASE_WIDTH}px + ${NEST_INDENT}px)`,
                        }}
                    >
                        {columns?.map((column) => (
                            <Typography key={column.name} width={column.width} variant={'caption'}>
                                {column.header}
                            </Typography>
                        ))}
                        <Box width={ROW_ACTIONS_WIDTH} />
                    </Box>
                </Box>
            )}
            <DndContext
                accessibility={{ container: getDndAccessibilityContainer() }}
                sensors={onDragAndDropEnd === undefined ? [] : sensors}
                onDragMove={(e): void => {
                    setIsDragging(true);

                    if (e.collisions) {
                        handleCollisions(e.active.id as string, e.collisions as Collision[]);
                    }
                }}
                onDragEnd={(event): void => {
                    const { active } = event;

                    if (dropInId && onDropIn) {
                        onDropIn(active.id as string, dropInId);
                    } else if (dropLineUnderId && onDragAndDropEnd) {
                        const sourceIndex = getItemIndexById(active.id as string, items);
                        const parentItem = getItemParentByItemId(dropLineUnderId, items);

                        switch (dropLineUnderId) {
                            case 'FIRST': {
                                onDragAndDropEnd(sourceIndex, [0]);
                                break;
                            }
                            case visibleItems[visibleItems.length - 1].itemId: {
                                onDragAndDropEnd(sourceIndex, [items.length]);
                                break;
                            }
                            case parentItem?.items?.[parentItem.items.length - 1].itemId: {
                                const destinationIndex = getItemIndexById(dropLineUnderId, items);
                                destinationIndex[destinationIndex.length - 1] += 1;
                                onDragAndDropEnd(sourceIndex, destinationIndex);
                                break;
                            }
                            default: {
                                const nextVisibleItemId =
                                    visibleItems[visibleItems.findIndex((item) => item.itemId === dropLineUnderId) + 1]
                                        ?.itemId;
                                const destinationIndex = nextVisibleItemId
                                    ? getItemIndexById(nextVisibleItemId, items)
                                    : null;
                                destinationIndex && onDragAndDropEnd(sourceIndex, destinationIndex);
                                break;
                            }
                        }
                    }

                    setDropLineUnderId(null);
                    setDropInId(null);
                    setIsDragging(false);
                }}
            >
                <SortableContext items={itemsIds}>
                    {filteredItems.map((item, index) => (
                        <DataTreeItemComponent
                            setExpandedItems={setExpandedItems}
                            currentSelectedItem={''}
                            order={[index]}
                            key={item.itemId}
                            {...item}
                            instanceId={''}
                            expandedItems={expandedItems}
                            onDragAndDropEnd={onDragAndDropEnd}
                            onCheckboxChange={onCheckboxChange}
                            columns={columns}
                            dragAndDropTooltipTitle={dragAndDropTooltipTitle}
                            searchQuery={query}
                            dragAndDropTooltipPlacement={dragAndDropTooltipPlacement}
                            rowActionsAriaLabel={rowActionsAriaLabel}
                            isDragging={isDragging}
                            dropLineUnderId={dropLineUnderId}
                            dropInId={dropInId}
                            enableDropIn={onDropIn !== undefined}
                            dataTestIdSuffix={dataTestIdSuffix}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </SimpleTreeView>
    );
}

export function DataTree(props: DataTreeProps): React.JSX.Element {
    const needsDynamicLoading = useMemo(() => hasAnyDynamicItem(props.items), [props.items]);

    if (!needsDynamicLoading) {
        return <DataTreeStatic {...props} />;
    }

    // TanStack-Query–backed implementation, available once `enableTreeDynamicLoading()` ran and fetched on first use.
    const DataTreeDynamic = getTreeDynamicComponent('dataTree');

    return (
        <Suspense fallback={<TreeSkeleton variant="data" />}>
            <DataTreeDynamic {...props} />
        </Suspense>
    );
}
