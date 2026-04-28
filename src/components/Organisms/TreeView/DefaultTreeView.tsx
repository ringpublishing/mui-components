import React, { useState, useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { SimpleTreeView } from '@mui/x-tree-view';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Box, Theme, Typography, PopperProps } from '@mui/material';

import {
    CommonTreeViewProps,
    filterItems,
    TreeViewItem,
    getAllItemIdsFromFilteredItems,
    getAllExpandedItemsFromCache,
    globalDynamicItemsCache,
    getExpandedItemIds,
} from './TreeView.js';
import { TreeViewItemComponent } from './TreeViewItem.js';
import { SearchBox } from '../../Molecules/SearchBox/SearchBox.js';

function getAllItemIds(items: TreeViewItem[]): string[] {
    const allItemIds: string[] = [];

    function traverse(items: TreeViewItem[]): void {
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

function getItemIndexById(itemId: string, items: TreeViewItem[]): number[] {
    function findIndexPath(items: TreeViewItem[], targetId: string, path: number[]): number[] | null {
        for (let i = 0; i < items.length; i++) {
            const currentPath = [...path, i];

            if (items[i].itemId === targetId) {
                return currentPath;
            }

            if (items[i].items) {
                const childPath = findIndexPath(items[i].items as TreeViewItem[], targetId, currentPath);

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

function getItemParentByItemId(itemId: string, items: TreeViewItem[]): TreeViewItem | null {
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

function getFlatListOfVisibleItems(items: TreeViewItem[], expandedItems: string[]): TreeViewItem[] {
    const flatList: TreeViewItem[] = [];

    function traverse(items: TreeViewItem[], order: number[]): void {
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

export interface Column {
    name: string;
    width: number;
    header?: string;
}

export interface DefaultTreeViewProps extends CommonTreeViewProps {
    /**
     * Columns with name, which should match the item attributes, width and header.
     */
    columns?: Column[];
    /**
     * If true, the column headers will be displayed.
     * @default false
     */
    showColumnHeaders?: boolean;
    /**
     * The label for the item label column header. By default, not shown.
     * @default ''
     */
    itemsLabelColumnHeader?: string;
    /**
     * Callback fired when the checkbox is checked or unchecked.
     */
    onCheckboxChange?: (itemId: string, checked: boolean) => void;
    /**
     * Callback fired when the drag and drop is finished. It receives the source and destination absolute positions.
     * If callback is not provided, the drag and drop will not be enabled.
     */
    onDragAndDropEnd?: (sourceAbsolutePosition: number[], destinationAbsolutePosition: number[]) => void;
    /**
     * Callback fired when the item is dropped in another item. It receives the itemId and dropInItemId.
     * If callback is not provided, the drag and drop will not be able to drop in another item and consequently create new nest levels.
     */
    onDropIn?: (itemId: string, dropInItemId: string) => void;
    /**
     * Title for tooltip shown when user hovers item with expanded children and drag and drop is enabled.
     */
    dragAndDropTooltipTitle?: string;
    /**
     * Placement of the tooltip.
     * @default 'top'
     */
    dragAndDropTooltipPlacement?: PopperProps['placement'];

    /**
     * TreeView variant
     * @default 'default'
     */
    variant: 'default';
}

export function DefaultTreeView(props: DefaultTreeViewProps): React.JSX.Element {
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
        withSearch = false,
        searchDebounceTime = 500,
        sx,
        className,
        searchPlaceholder,
        variant = 'default',
        selectedItems,
        onSelectedItemsChange,
        dataTestIdSuffix,
    } = props;

    const [query, setQuery] = useState('');
    const [expandedItems, setExpandedItems] = useState<string[]>(getExpandedItemIds(items));
    const [itemsExpandedBeforeSearch, setItemsExpandedBeforeSearch] = useState(expandedItems);
    const [internalSelectedItems, setInternalSelectedItems] = useState<string | string[]>([]);

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

    const filteredItems = useMemo(
        () => (query !== '' ? filterItems(items, query, globalDynamicItemsCache) : items),
        [items, query],
    );

    useEffect(() => {
        if (query !== '') {
            const filteredItemIds = getAllItemIdsFromFilteredItems(filteredItems, globalDynamicItemsCache);
            const cachedExpandedIds = getAllExpandedItemsFromCache(globalDynamicItemsCache);

            setExpandedItems((prev) => {
                const mergedIds = new Set([...prev, ...filteredItemIds, ...cachedExpandedIds]);

                return Array.from(mergedIds);
            });
        } else {
            setExpandedItems(itemsExpandedBeforeSearch);
        }
    }, [query, filteredItems, itemsExpandedBeforeSearch]);

    const itemsIds = getAllItemIds(items);

    const [isDragging, setIsDragging] = useState(false);
    const [dropLineUnderId, setDropLineUnderId] = useState<string | null>(null);
    const [dropInId, setDropInId] = useState<string | null>(null);

    const visibleItems = getFlatListOfVisibleItems(items, expandedItems);

    const handleExpandToggle = (itemId: string): void => {
        setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
        setItemsExpandedBeforeSearch((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
        );
        onExpand?.(itemId);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 50,
                tolerance: 10,
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

            // if hovers over an own spot, exit early
            if (collisions.map((c) => c.id).includes(itemId)) {
                return;
            }

            let collisionsWithOtherItems = [...collisions];

            // check if there is a collision with an item that has a value >= 0.8, which indicates it should be a drop-in target
            const dropInId = collisionsWithOtherItems.filter((c) => c.data.value >= 0.8)[0]?.id || null;

            if (dropInId && onDropIn) {
                setDropInId(dropInId);

                return;
            }

            // if too many collisions, filter out the parents
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

                // if items are next to each other in visible items, set drop line under the first one
                if (Math.abs(item1Index - item2Index) === 1) {
                    const firstItem = visibleItems[Math.min(item1Index, item2Index)];
                    setDropLineUnderId(firstItem?.itemId || null);
                    // else, line should be under the item before the second one
                } else {
                    const previousItemId = visibleItems[Math.max(item1Index, item2Index) - 1]?.itemId;
                    previousItemId && previousItemId !== itemId && setDropLineUnderId(previousItemId);
                }
            } else if (collisionsWithOtherItems.length === 1) {
                const itemIndex = visibleItems.findIndex((i) => i.itemId === collisionsWithOtherItems[0].id);

                switch (itemIndex) {
                    // first item - no drop line under, but onDragEnd needs to handle this case
                    case 0: {
                        setDropLineUnderId('FIRST');
                        break;
                    }
                    // last item - drop line under the last item
                    case visibleItems.length - 1: {
                        setDropLineUnderId(visibleItems[itemIndex].itemId);
                        break;
                    }
                    // drop line under the previous item - handles first child of parent node
                    default: {
                        const previousItemId = visibleItems[itemIndex - 1]?.itemId;
                        previousItemId && previousItemId !== itemId && setDropLineUnderId(previousItemId);
                        break;
                    }
                }
            }
        },
        [items, visibleItems, onDropIn, setDropInId, setDropLineUnderId],
    );

    return (
        <SimpleTreeView
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
                '& .ring-tree-item-drop-line-under': {
                    position: 'absolute',
                    top: '43px',
                    height: '2px',
                    width: '100%',
                    left: '0px',
                    zIndex: 2,
                    backgroundColor: (theme: Theme) => theme.palette.primary.main,
                    '&:before, &:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-3px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        border: (theme: Theme) => `2px solid ${theme.palette.primary.main}`,
                        zIndex: 2,
                    },
                    '&:before': {
                        left: '-8px',
                    },
                    '&:after': {
                        right: '-8px',
                    },
                },
                ...sx,
            }}
            className={classNames('ring-tree-view', className)}
        >
            {withSearch && (
                <SearchBox
                    defaultValue={''}
                    searchFunc={(q): void => setQuery(q)}
                    debounceTime={searchDebounceTime}
                    sx={{
                        height: '40px',
                        borderRadius: '4px',
                        marginY: 1,
                    }}
                    labels={{ placeholder: searchPlaceholder }}
                />
            )}
            {showColumnHeaders && (
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '42px',
                        marginY: 1,
                    }}
                >
                    <Typography variant={'caption'} width={'calc(320px - 32px)'}>
                        {itemsLabelColumnHeader}
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: 'calc(100% - 320px + 32px)',
                        }}
                    >
                        {columns?.map((column) => (
                            <Typography key={column.name} width={column.width} variant={'caption'}>
                                {column.header}
                            </Typography>
                        ))}
                        <Box width={'35px'} />
                    </Box>
                </Box>
            )}
            <DndContext
                sensors={sensors}
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
                            // first item
                            case 'FIRST': {
                                onDragAndDropEnd(sourceIndex, [0]);
                                break;
                            }
                            // last item
                            case visibleItems[visibleItems.length - 1].itemId: {
                                onDragAndDropEnd(sourceIndex, [items.length]);
                                break;
                            }
                            // drop line under the last item in a parent - append to the end of the parent
                            case parentItem?.items?.[parentItem.items.length - 1].itemId: {
                                const destinationIndex = getItemIndexById(dropLineUnderId, items);
                                destinationIndex[destinationIndex.length - 1] += 1;
                                onDragAndDropEnd(sourceIndex, destinationIndex);
                                break;
                            }
                            // other cases - drop in place of the next item
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
                    {filteredItems.map((item, index) => {
                        return (
                            <TreeViewItemComponent
                                setExpandedItems={setExpandedItems}
                                currentSelectedItem={''}
                                order={[index]}
                                key={item.itemId}
                                {...item}
                                expandedItems={expandedItems}
                                onDragAndDropEnd={onDragAndDropEnd}
                                onCheckboxChange={onCheckboxChange}
                                columns={columns}
                                dragAndDropTooltipTitle={dragAndDropTooltipTitle}
                                isSearchActive={query !== ''}
                                searchQuery={query}
                                dragAndDropTooltipPlacement={dragAndDropTooltipPlacement}
                                isDragging={isDragging}
                                dropLineUnderId={dropLineUnderId}
                                dropInId={dropInId}
                                variant={variant}
                                dataTestIdSuffix={dataTestIdSuffix}
                            />
                        );
                    })}
                </SortableContext>
            </DndContext>
        </SimpleTreeView>
    );
}
