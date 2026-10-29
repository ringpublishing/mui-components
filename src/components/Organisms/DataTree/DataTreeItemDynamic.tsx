import React, { useCallback, useMemo } from 'react';
import { Plus, EllipsisVertical, RotateCw, Minus } from 'lucide-react';
import { alpha, Box, CircularProgress, IconButton, PopperProps, Theme, Tooltip } from '@mui/material';
import { TreeItem } from '@mui/x-tree-view';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';

import { WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';
import { resolveItemDataTestId } from '../../../helpers/dataTestId.js';
import { resolveMoreActionsAriaLabel } from '../../../helpers/moreActionsAriaLabel.js';
import { RingLucideIcon } from '../../../helpers/RingLucideIcon.js';
import { getLucideSizeFromFontSize } from '../../../helpers/lucideSize.js';
import { Typography } from '../../Atoms/Typography/Typography.js';
import { SortableItem } from '../../internal/SortableItem.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { useNonDraggableRef } from '../SortableList/SortableList.js';
import {
    DECORATIVE_EXPAND_BUTTON_PROPS,
    STRIPPED_FN_MARKER,
    filterTreeItems,
    getPlainLabel,
} from '../../internal/tree/treeShared.js';
import { DataTreeCheckboxSlot } from './DataTreeCheckboxSlot.js';
import { DataTreeColumn, DataTreeItem } from './DataTree.js';

function filterDataTreeItems(items: DataTreeItem[], query: string): DataTreeItem[] {
    return filterTreeItems(items, query, 'Ring-DataTree-matchedLabel');
}

interface DataTreeItemProps extends DataTreeItem {
    order: number[];
    instanceId: string;
    expandedItems: string[];
    currentSelectedItem: string | null;
    searchQuery?: string;
    onDragAndDropEnd?: (sourceAbsoluteId: number[], destinationAbsoluteId: number[]) => void;
    onCheckboxChange?: (itemId: string, checked: boolean) => void;
    columns?: DataTreeColumn[];
    dragAndDropTooltipTitle?: string;
    dragAndDropTooltipPlacement?: PopperProps['placement'];
    rowActionsAriaLabel?: string;
    isDragging?: boolean;
    dropLineUnderId?: string | null;
    dropInId?: string | null;
    enableDropIn?: boolean;
}

type DataTreeItemDynamicComponentInternalProps = DataTreeItemProps & {
    items?: DataTreeItem[];
    setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
} & WithDataTestIdSuffix;

const NEST_INDENT = 32;
const ICON_SIZE = 32;
const ICON_CONTAINER_HEIGHT = 40;
const LABEL_COLUMN_BASE_WIDTH = 320;
const CHECKBOX_WIDTH = 30;
const ROW_ACTIONS_WIDTH = 35;
const BORDER_RADIUS = '4px';
const CONTENT_GAP = '8px';
const LABEL_MARGIN_RIGHT = '8px';
const ROW_MARGIN_BOTTOM = '2px';
const BORDER_WIDTH_DEFAULT = '1px';
const BORDER_WIDTH_DROP_TARGET = '2px';
const SPINNER_SIZE = 14;
const SPINNER_THICKNESS = 5;

export function DataTreeItemDynamicComponent(props: DataTreeItemDynamicComponentInternalProps): React.JSX.Element {
    const {
        currentSelectedItem,
        order,
        instanceId,
        label,
        itemId,
        alwaysShowTooltip,
        tooltipTitle,
        items,
        onDragAndDropEnd,
        onCheckboxChange,
        columns,
        rowActions,
        checked = false,
        checkboxDisabled = false,
        withCheckbox = true,
        expandedItems,
        dragAndDropTooltipTitle,
        dragAndDropTooltipPlacement = 'top',
        rowActionsAriaLabel,
        isDragging,
        dropLineUnderId,
        dropInId,
        enableDropIn = false,
        element,
        loadItems,
        setExpandedItems,
        searchQuery = '',
        dataTestIdSuffix,
    } = props;

    const dataTestId = resolveItemDataTestId({
        componentName: 'DataTree',
        listSuffix: dataTestIdSuffix,
        itemId,
        item: props,
    });

    const isSearchActive = searchQuery.length > 0;
    // `loadItems` may be a real function, undefined, or — for cache-rehydrated
    // items — the `STRIPPED_FN_MARKER` sentinel that survives `JSON.stringify`
    // in place of the original function. The sentinel still counts as "dynamic"
    // for chevron rendering, but the query stays disabled until the parent's
    // cascading refetch replaces the item with one carrying a live function.
    const hasLiveLoadItems = typeof loadItems === 'function';
    const isDynamicItem = hasLiveLoadItems || (loadItems as unknown) === STRIPPED_FN_MARKER;
    const isExpanded = expandedItems.includes(itemId);

    const sanitizedLabel = useMemo(() => DOMPurify.sanitize(label, { ALLOWED_TAGS: ['span'] }), [label]);
    const plainLabel = useMemo(() => getPlainLabel(label), [label]);

    // ── TanStack Query for dynamic items ─────────────────────────────────

    const stableLoadItems = useMemo(() => loadItems, [loadItems]);

    const {
        data: dynamicItems,
        isFetching,
        isError: hasError,
        refetch,
    } = useQuery<DataTreeItem[]>({
        queryKey: ['dataTreeItem', instanceId, itemId],
        queryFn: async () => {
            if (!stableLoadItems) {
                return [];
            }

            const currentItem: DataTreeItem = { ...props, itemId, label, loadItems: stableLoadItems };
            const result = await stableLoadItems(currentItem);

            return result;
        },
        enabled: hasLiveLoadItems && isExpanded,
        staleTime: Infinity,
        retry: false,
    });

    // ── Determine children to render ─────────────────────────────────────

    // Fall back to `dynamicItems` (which `useQuery` returns from the cache
    // even when `enabled: false`) regardless of `isDynamicItem`. This makes
    // the FULL hydrated subtree appear instantly on mount, even for items
    // whose `loadItems` function got stripped during JSON serialization —
    // the cascading invalidation refetch then replaces the data with fresh
    // children carrying live `loadItems` silently in the background.
    let currentItems: DataTreeItem[] | undefined = items ?? dynamicItems;

    if (isSearchActive && searchQuery && currentItems === dynamicItems && dynamicItems) {
        currentItems = filterDataTreeItems(dynamicItems, searchQuery);
    }

    const hasChildren = isDynamicItem || (currentItems !== undefined && currentItems.length > 0);

    const hasCheckbox = onCheckboxChange !== undefined && withCheckbox;
    const nestLevel = order.length - 1;

    const nestLevelPadding = nestLevel * NEST_INDENT;
    const hasChildrenPadding = hasChildren ? ICON_SIZE : 0;
    const checkboxPadding = hasCheckbox ? CHECKBOX_WIDTH : 0;

    const leftPadding = hasChildrenPadding + checkboxPadding;
    const labelWidth = `${LABEL_COLUMN_BASE_WIDTH - leftPadding - nestLevelPadding}px`;
    const hasChildrenAndIsExpanded = hasChildren && isExpanded;

    const actionBoxRef = useNonDraggableRef();
    const checkboxRef = useNonDraggableRef();
    const expandRef = useNonDraggableRef();
    const collapseRef = useNonDraggableRef();

    // ── Expand handler (for dynamic items, trigger refetch on error) ─────

    const handleExpand = useCallback((): void => {
        // For dynamic items, expansion is handled by TanStack Query's `enabled` flag.
        // No manual action needed; the query fires when `isExpanded` becomes true.
    }, []);

    const handleRetry = useCallback(
        (e: React.MouseEvent): void => {
            e.stopPropagation();
            refetch();
        },
        [refetch],
    );

    const handleSetExpandedItems = useCallback(
        (updater: React.SetStateAction<string[]>): void => {
            setExpandedItems(updater);
        },
        [setExpandedItems],
    );

    // ── Render ───────────────────────────────────────────────────────────

    return (
        <SortableItem
            id={itemId}
            disableDrag={onDragAndDropEnd === undefined || hasChildrenAndIsExpanded}
            disableTransformOfUndraggedItems={true}
        >
            <TreeItem
                key={itemId}
                itemId={itemId}
                data-testid={dataTestId}
                style={{
                    marginLeft: nestLevel > 0 ? `${NEST_INDENT}px` : '0px',
                }}
                label={<span dangerouslySetInnerHTML={{ __html: sanitizedLabel }} />}
                sx={{
                    '& .MuiTreeItem-content': {
                        gap: CONTENT_GAP,
                        borderStyle: 'solid',
                        borderWidth:
                            enableDropIn && dropInId === itemId ? BORDER_WIDTH_DROP_TARGET : BORDER_WIDTH_DEFAULT,
                        borderColor:
                            enableDropIn && dropInId === itemId
                                ? (t: Theme): string => t.palette.primary.main
                                : (t: Theme): string => t.palette.divider,
                        borderRadius: BORDER_RADIUS,
                        padding: enableDropIn && dropInId === itemId ? '0px' : BORDER_WIDTH_DEFAULT,
                        marginBottom: ROW_MARGIN_BOTTOM,
                        zIndex: 0,
                        transition: 'none',
                        '&:hover': {
                            backgroundColor: isDragging
                                ? 'inherit'
                                : (t: Theme): string => alpha(t.palette.primary.main, t.palette.action.hoverOpacity),
                        },
                        '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused, &.Mui-selected:hover': {
                            zIndex: 0,
                            backgroundColor: (t: Theme) => t.palette.info.main,
                            borderColor: (t: Theme) => t.palette.info.main,
                            '& .MuiTypography-root': {
                                color: (t: Theme) => t.palette.common.white,
                            },
                            '& .RingDataTree-itemRowActionButton': {
                                color: (t: Theme) => t.palette.common.white,
                            },
                            '& .MuiTreeItem-iconContainer': {
                                '&:has(*)': {
                                    borderRightColor: (t: Theme) => t.palette.info.main,
                                },
                            },
                            '& .Ring-DataTree-matchedLabel': {
                                color: (t: Theme) => t.palette.common.white,
                            },
                            '& .MuiCheckbox-root': {
                                color: (t: Theme) => t.palette.common.white,
                            },
                        },
                    },
                    '& .MuiTreeItem-iconContainer': {
                        height: `${ICON_CONTAINER_HEIGHT}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottomLeftRadius: BORDER_RADIUS,
                        borderTopLeftRadius: BORDER_RADIUS,
                        '&:has(*)': {
                            borderRightColor: (t: Theme) => t.palette.divider,
                            borderRightWidth: BORDER_WIDTH_DEFAULT,
                            borderRightStyle: 'solid',
                        },
                    },
                    '& .MuiTreeItem-groupTransition': {
                        padding: '0px',
                    },
                    '& .Ring-DataTree-matchedLabel': {
                        color: (t: Theme) => t.palette.primary.main,
                    },
                }}
                slotProps={{
                    iconContainer: {
                        style: {
                            width: hasChildren ? `${ICON_SIZE}px` : '0px',
                        },
                    },
                    // Custom props passed to DataTreeCheckboxSlot via MUI slot system —
                    // MUI's typings don't surface custom slot prop bags, hence the cast.
                    checkbox: {
                        hasCheckbox,
                        checked,
                        checkboxDisabled,
                        itemId,
                        ariaLabel: plainLabel,
                        onCheckboxChange,
                        checkboxSetRef: checkboxRef.setRef,
                    } as unknown as Record<string, unknown>,
                }}
                slots={{
                    expandIcon: () => (
                        <IconButton
                            // In the error state this is the retry control, a real action for every user.
                            {...(hasError ? {} : DECORATIVE_EXPAND_BUTTON_PROPS)}
                            ref={expandRef.setRef}
                            disabled={isFetching}
                            color="inherit"
                            onClick={hasError ? handleRetry : handleExpand}
                            sx={{
                                width: hasChildren ? `${ICON_SIZE}px` : '0px',
                                height: `${ICON_SIZE}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            data-testid={`${dataTestId}-expand`}
                        >
                            {hasError ? (
                                <RingLucideIcon icon={RotateCw} color="error" />
                            ) : (
                                <Plus size={18} style={{ flexShrink: 0 }} />
                            )}
                        </IconButton>
                    ),
                    collapseIcon: () =>
                        hasError ? (
                            <IconButton
                                ref={collapseRef.setRef}
                                disabled={isFetching}
                                color="inherit"
                                onClick={handleRetry}
                                sx={{
                                    width: hasChildren ? `${ICON_SIZE}px` : '0px',
                                    height: `${ICON_SIZE}px`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                data-testid={`${dataTestId}-refresh`}
                            >
                                <RingLucideIcon icon={RotateCw} color="error" />
                            </IconButton>
                        ) : (
                            <Box
                                sx={{
                                    width: `${ICON_SIZE}px`,
                                    height: `${ICON_SIZE}px`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                data-testid={`${dataTestId}-collapse`}
                            >
                                {isFetching ? (
                                    <CircularProgress
                                        color="secondary"
                                        thickness={SPINNER_THICKNESS}
                                        size={SPINNER_SIZE}
                                    />
                                ) : (
                                    <Minus size={18} style={{ flexShrink: 0 }} />
                                )}
                            </Box>
                        ),
                    label: () => (
                        <>
                            <Tooltip
                                title={
                                    onDragAndDropEnd === undefined
                                        ? ''
                                        : hasChildrenAndIsExpanded
                                          ? dragAndDropTooltipTitle
                                          : ''
                                }
                                placement={dragAndDropTooltipPlacement}
                            >
                                <Box
                                    sx={{
                                        width: `calc(100% - ${leftPadding}px)`,
                                        gap: ROW_MARGIN_BOTTOM,
                                        display: 'flex',
                                        alignItems: 'center',
                                        minWidth: 0,
                                        marginRight: LABEL_MARGIN_RIGHT,
                                    }}
                                >
                                    <Typography
                                        enableOverflow={true}
                                        alwaysShowTooltip={alwaysShowTooltip}
                                        tooltipTitle={tooltipTitle ?? label}
                                        letterSpacing="0px"
                                        variant={'body2'}
                                        dangerouslySetInnerHTML={{ __html: sanitizedLabel }}
                                        sx={{
                                            width: columns?.length ? labelWidth : undefined,
                                            minWidth: 0,
                                            flex: columns?.length ? undefined : '1 1 0',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            width: columns?.length
                                                ? `calc(100% - ${labelWidth})`
                                                : rowActions?.length
                                                  ? `${ROW_ACTIONS_WIDTH}px`
                                                  : '0px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginLeft: 'auto',
                                        }}
                                    >
                                        {columns?.map((column) => (
                                            <Typography key={column.name} width={column.width} variant={'body2'}>
                                                {props[column.name]}
                                            </Typography>
                                        ))}
                                        <Box
                                            sx={{
                                                width: `${ROW_ACTIONS_WIDTH}px`,
                                                marginLeft:
                                                    columns === undefined || columns.length === 0 ? undefined : '0px',
                                            }}
                                        >
                                            {rowActions && (
                                                <IconButton
                                                    ref={actionBoxRef.setRef}
                                                    size={'small'}
                                                    aria-label={resolveMoreActionsAriaLabel(rowActionsAriaLabel)}
                                                    onClick={(e): void => {
                                                        e.stopPropagation();
                                                    }}
                                                    data-testid={`${dataTestId}-actions`}
                                                >
                                                    <EllipsisVertical
                                                        size={getLucideSizeFromFontSize('small')}
                                                        className={'RingDataTree-itemRowActionButton'}
                                                    />
                                                    <ActionBox
                                                        actions={rowActions}
                                                        anchorEl={actionBoxRef}
                                                        dataTestId={`${dataTestId}-menu`}
                                                    />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>
                                    {element && (
                                        <Box
                                            sx={{
                                                height: `${ICON_SIZE}px`,
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {element}
                                        </Box>
                                    )}
                                </Box>
                            </Tooltip>
                            {dropLineUnderId === itemId ? (
                                <span className={'ring-data-tree-item-drop-line-under'} />
                            ) : null}
                        </>
                    ),

                    checkbox: DataTreeCheckboxSlot,
                }}
            >
                {isDynamicItem && !currentItems ? <div style={{ display: 'none' }} /> : null}
                {currentItems?.map((child, index) => {
                    return (
                        <DataTreeItemDynamicComponent
                            key={child.itemId}
                            currentSelectedItem={currentSelectedItem}
                            {...child}
                            instanceId={instanceId}
                            loadItems={child.loadItems}
                            order={[...order, index]}
                            expandedItems={expandedItems}
                            dropLineUnderId={dropLineUnderId}
                            dropInId={dropInId}
                            enableDropIn={enableDropIn}
                            isDragging={isDragging}
                            setExpandedItems={handleSetExpandedItems}
                            items={child.items}
                            searchQuery={searchQuery}
                            columns={columns}
                            onDragAndDropEnd={onDragAndDropEnd}
                            onCheckboxChange={onCheckboxChange}
                            dragAndDropTooltipTitle={dragAndDropTooltipTitle}
                            dragAndDropTooltipPlacement={dragAndDropTooltipPlacement}
                            rowActionsAriaLabel={rowActionsAriaLabel}
                            dataTestIdSuffix={dataTestIdSuffix}
                        />
                    );
                })}
            </TreeItem>
        </SortableItem>
    );
}
