import React, { useState, useCallback, useId, useMemo } from 'react';
import classNames from 'classnames';
import { SimpleTreeView } from '@mui/x-tree-view';
import { QueryClientProvider } from '@tanstack/react-query';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Box, Theme, Typography } from '@mui/material';

import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { SearchBox } from '../../Molecules/SearchBox/SearchBox.js';
import { useTreePersistence } from '../../internal/tree/treeQueryClient.js';
import {
    filterTreeItems,
    getDndAccessibilityContainer,
    readLocalStorage,
    useTreeExpansion,
    useWriteTreeState,
} from '../../internal/tree/treeShared.js';
import type { DataTreeItem, DataTreeProps } from './DataTree.js';
import { DataTreeItemDynamicComponent } from './DataTreeItemDynamic.js';

/**
 * Full DataTree implementation: TanStack Query dynamic loading, `QueryClientProvider`, optional
 * cache persistence and the drag&drop machinery for reorder and drop-in. Registered by
 * `enableTreeDynamicLoading()` and loaded lazily from `DataTree.tsx` when an item exposes `loadItems`.
 */

const DROP_LINE_TOP = '43px';
const DROP_LINE_HEIGHT = '2px';
const DROP_LINE_DOT_SIZE = '8px';
const COLUMN_HEADERS_PADDING_LEFT = '42px';
const LABEL_COLUMN_BASE_WIDTH = 320;
const NEST_INDENT = 32;
const ROW_ACTIONS_WIDTH = '35px';

interface PersistedTreeState {
    selectedItemIds?: string | string[];
    expandedItems?: string[];
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

function filterDataTreeItems(items: DataTreeItem[], query: string): DataTreeItem[] {
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

function DataTreeDynamic(props: DataTreeProps): React.JSX.Element {
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
        queryClient: queryClientFromProps,
        queryKeyPrefix,
        dataTestIdSuffix,
    } = props;

    const dataTestId = useRingDataTestId('DataTree', dataTestIdSuffix);

    const generatedId = useId();
    const instanceId = queryClientFromProps !== undefined ? (queryKeyPrefix ?? generatedId) : '';

    const restoreExpandedItems = persistence?.restoreExpandedItems;
    const restoreSelectedItem = persistence?.restoreSelectedItem;
    const shouldPersistState = restoreExpandedItems || restoreSelectedItem;

    const { queryClient, stateStorageKey } = useTreePersistence({
        cacheKey: persistence?.cacheKey,
        queryClientFromProps,
        queryKeyRoot: 'dataTreeItem',
        instanceId,
    });

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
        <QueryClientProvider client={queryClient}>
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
                                        visibleItems[
                                            visibleItems.findIndex((item) => item.itemId === dropLineUnderId) + 1
                                        ]?.itemId;
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
                            <DataTreeItemDynamicComponent
                                setExpandedItems={setExpandedItems}
                                currentSelectedItem={''}
                                order={[index]}
                                key={item.itemId}
                                {...item}
                                instanceId={instanceId}
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
        </QueryClientProvider>
    );
}

export default DataTreeDynamic;
