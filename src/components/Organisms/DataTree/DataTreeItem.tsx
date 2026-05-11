import React, { useCallback, useMemo } from 'react';
import { AddOutlined, MoreVert, RemoveOutlined } from '@mui/icons-material';
import { Box, IconButton, PopperProps, Theme, Tooltip } from '@mui/material';
import { TreeItem } from '@mui/x-tree-view';
import DOMPurify from 'dompurify';

import { WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { Typography } from '../../Atoms/Typography/Typography.js';
import { SortableItem } from '../../internal/SortableItem.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { useNonDraggableRef } from '../SortableList/SortableList.js';
import { DataTreeCheckboxSlot } from './DataTreeCheckboxSlot.js';
import { DataTreeColumn, DataTreeItem } from './DataTree.js';

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
    isDragging?: boolean;
    dropLineUnderId?: string | null;
    dropInId?: string | null;
    enableDropIn?: boolean;
}

type DataTreeItemComponentProps = DataTreeItemProps & {
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

/**
 * Static-only DataTree item. Renders the row + recursively renders
 * `item.items`. `loadItems` is ignored; the parent `DataTree` is responsible
 * for swapping in the dynamic implementation (`DataTreeItemDynamicComponent`)
 * when any item exposes `loadItems`.
 *
 * This file does NOT import `@tanstack/react-query`, so it lives in the main
 * bundle and lets the peer dependency stay optional for static-only consumers.
 */
export function DataTreeItemComponent(props: DataTreeItemComponentProps): React.JSX.Element {
    const {
        currentSelectedItem,
        order,
        instanceId,
        label,
        itemId,
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
        isDragging,
        dropLineUnderId,
        dropInId,
        enableDropIn = false,
        element,
        setExpandedItems,
        searchQuery = '',
        dataTestIdSuffix,
    } = props;

    const dataTestId = useRingDataTestId(
        'datatree',
        dataTestIdSuffix ? `${dataTestIdSuffix}-item-${itemId}` : `item-${itemId}`,
    );

    const isExpanded = expandedItems.includes(itemId);

    const sanitizedLabel = useMemo(() => DOMPurify.sanitize(label, { ALLOWED_TAGS: ['span'] }), [label]);

    // ── Determine children to render (static path: only `items` is consulted) ─

    const currentItems: DataTreeItem[] | undefined = items;

    const hasChildren = currentItems !== undefined && currentItems.length > 0;
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
                                : (t: Theme): string => t.palette.components.datagrid.border,
                        borderRadius: BORDER_RADIUS,
                        padding: enableDropIn && dropInId === itemId ? '0px' : BORDER_WIDTH_DEFAULT,
                        marginBottom: ROW_MARGIN_BOTTOM,
                        zIndex: 0,
                        transition: 'none',
                        '&:hover': {
                            backgroundColor: isDragging
                                ? 'inherit'
                                : // @ts-expect-error - augmented theme palette key
                                  (t: Theme): string => t.palette.primary.focusVisible,
                        },
                        '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused, &.Mui-selected:hover': {
                            zIndex: 0,
                            backgroundColor: (t: Theme) => t.palette.info.main,
                            borderColor: (t: Theme) => t.palette.info.main,
                            '& .MuiTypography-root': {
                                color: (t: Theme) => t.palette.common.white,
                            },
                            '& .RingDataTree-itemRowActionButton': {
                                fill: (t: Theme) => t.palette.common.white,
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
                            borderRightColor: (t: Theme) => t.palette.components.datagrid.border,
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
                        onCheckboxChange,
                        checkboxSetRef: checkboxRef.setRef,
                    } as unknown as Record<string, unknown>,
                }}
                slots={{
                    expandIcon: () => (
                        <IconButton
                            ref={expandRef.setRef}
                            color="inherit"
                            sx={{
                                width: hasChildren ? `${ICON_SIZE}px` : '0px',
                                height: `${ICON_SIZE}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            data-testid={`${dataTestId}-expand`}
                        >
                            <AddOutlined />
                        </IconButton>
                    ),
                    collapseIcon: () => (
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
                            <RemoveOutlined />
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
                                                    onClick={(e): void => {
                                                        e.stopPropagation();
                                                    }}
                                                    data-testid={`${dataTestId}-actions`}
                                                >
                                                    <MoreVert className={'RingDataTree-itemRowActionButton'} />
                                                    <ActionBox
                                                        actions={rowActions}
                                                        anchorEl={actionBoxRef}
                                                        dataTestIdSuffix={dataTestIdSuffix}
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
                {currentItems?.map((child, index) => {
                    return (
                        <DataTreeItemComponent
                            key={child.itemId}
                            currentSelectedItem={currentSelectedItem}
                            {...child}
                            instanceId={instanceId}
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
                            dataTestIdSuffix={dataTestIdSuffix}
                        />
                    );
                })}
            </TreeItem>
        </SortableItem>
    );
}
