import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
    AddOutlined,
    KeyboardArrowDown,
    KeyboardArrowUp,
    MoreVert,
    Refresh,
    RemoveOutlined,
} from '@mui/icons-material';
import { Box, Checkbox, CircularProgress, IconButton, PopperProps, Theme, Tooltip, useTheme } from '@mui/material';
import { TreeItem } from '@mui/x-tree-view';
import DOMPurify from 'dompurify';

import { WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { Typography } from '../../Atoms/Typography/Typography.js';
import { SortableItem } from '../../internal/SortableItem.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { useNonDraggableRef } from '../SortableList/SortableList.js';
import { Column } from './DefaultTreeView.js';
import { filterItems, TreeViewItem } from './TreeView.js';

export const globalDynamicItemsCache = new Map<string, { items: TreeViewItem[]; expandedChildren: Set<string> }>();

interface CommonTreeViewItemProps extends TreeViewItem {
    order: number[];
    expandedItems: string[];
    currentSelectedItem: string | null;
    searchQuery?: string;
}

export type TreeViewItemComponentProps = CompactTreeViewItemProps | DefaultTreeViewItemProps;

interface CompactTreeViewItemProps extends CommonTreeViewItemProps {
    variant: 'compact';
    onDragAndDropEnd?: never;
    onCheckboxChange?: never;
    columns?: never;
    dragAndDropTooltipTitle?: never;
    dragAndDropTooltipPlacement?: never;
}

interface DefaultTreeViewItemProps extends CommonTreeViewItemProps {
    variant: 'default';
    onDragAndDropEnd?: (sourceAbsoluteId: number[], destinationAbsoluteId: number[]) => void;
    onCheckboxChange?: (itemId: string, checked: boolean) => void;
    columns?: Column[];
    dragAndDropTooltipTitle?: string;
    dragAndDropTooltipPlacement: PopperProps['placement'];
}
type LoadItemsFunction = () => Promise<TreeViewItem[]> | TreeViewItem[];
type StaticOrDynamicTreeViewItems = TreeViewItem[] | LoadItemsFunction;

type ChildTreeViewItemProps = TreeViewItemComponentProps & {
    items?: StaticOrDynamicTreeViewItems;
    setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
} & WithDataTestIdSuffix;

export function TreeViewItemComponent(props: ChildTreeViewItemProps): React.JSX.Element {
    const {
        currentSelectedItem,
        order,
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
        dragAndDropTooltipPlacement,
        isDragging,
        dropLineUnderId,
        dropInId,
        element,
        variant = 'default',
        loadItems,
        setExpandedItems,
        searchQuery = '',
        dataTestIdSuffix,
    } = props;

    const theme = useTheme();

    const dataTestId = useRingDataTestId('treeview', `${dataTestIdSuffix}-item-${itemId}`);

    const isSearchActive = searchQuery.length > 0;

    const compactThemeColors = {
        backgroundItemActive: theme.colors.blue[100],
        secondBackgroundActive: theme.colors.blue[50],
        fontColorSelected: theme.colors.grey[900],
    };

    const compactExpandedStyles = {
        backgroundColor: compactThemeColors.secondBackgroundActive,
        borderRadius: '8px',
    };

    const isDynamicItem = loadItems !== undefined;
    const cacheKey = itemId;
    const cachedData = globalDynamicItemsCache.get(cacheKey);

    const [dynamicItems, setDynamicItems] = useState<TreeViewItem[] | undefined>(
        isDynamicItem ? cachedData?.items : items,
    );
    const [hasLoadedItems, setHasLoadedItems] = useState<boolean>(Boolean(cachedData));

    let currentItems = items !== undefined ? items : isDynamicItem ? dynamicItems : undefined;

    if (isSearchActive && searchQuery && currentItems === dynamicItems && dynamicItems) {
        currentItems = filterItems(dynamicItems, searchQuery, globalDynamicItemsCache);
    }

    const hasChildren = isDynamicItem || (currentItems !== undefined && currentItems.length > 0);

    const hasCheckbox = onCheckboxChange !== undefined && withCheckbox;
    const isCompact = variant === 'compact';
    const nestLevel = order.length - 1;

    const nestLevelPadding = nestLevel * (isCompact ? 0 : 32);
    const hasChildrenPadding = hasChildren ? (isCompact ? 18 : 32) : 0;
    const checkboxPadding = hasCheckbox ? 30 : 0;

    const leftPadding = hasChildrenPadding + checkboxPadding;
    const labelWidth = isCompact ? 'auto' : `${320 - leftPadding - nestLevelPadding}px`;
    const hasChildrenAndIsExpanded = hasChildren && expandedItems.includes(itemId);
    const isSelected = itemId === currentSelectedItem;

    const actionBoxRef = useNonDraggableRef();
    const checkboxRef = useNonDraggableRef();
    const expandRef = useNonDraggableRef();
    const collapseRef = useNonDraggableRef();

    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const sanitizedLabel = useMemo(() => DOMPurify.sanitize(label, { ALLOWED_TAGS: ['span'] }), [label]);

    const handleExpand = useCallback(async (): Promise<void> => {
        if (!isDynamicItem || !loadItems) {
            return;
        }

        setHasError(false);
        setIsLoading(true);

        try {
            const currentItem = { ...props, itemId, label, loadItems };
            const loadedItems = await loadItems(currentItem);
            setDynamicItems(loadedItems);
            setHasLoadedItems(true);

            const cachedData = globalDynamicItemsCache.get(cacheKey);
            const previouslyExpandedChildren = cachedData?.expandedChildren || new Set<string>();

            globalDynamicItemsCache.set(cacheKey, {
                items: loadedItems,
                expandedChildren: previouslyExpandedChildren,
            });

            if (previouslyExpandedChildren.size > 0) {
                const loadedItemIds = new Set(loadedItems.map((item) => item.itemId));
                const validExpandedChildren = Array.from(previouslyExpandedChildren).filter((id) =>
                    loadedItemIds.has(id),
                );

                if (validExpandedChildren.length > 0) {
                    setExpandedItems((prev) => {
                        const newExpanded = new Set([...prev, ...validExpandedChildren]);

                        return Array.from(newExpanded);
                    });
                }
            }
        } catch (error) {
            setHasError(true);
            setExpandedItems(expandedItems.filter((id) => id !== itemId));
        } finally {
            setIsLoading(false);
        }
    }, [expandedItems, isDynamicItem, itemId, loadItems, setExpandedItems, cacheKey, label, props]);

    const handleSetExpandedItems = useCallback(
        (updater: React.SetStateAction<string[]>): void => {
            setExpandedItems((prev) => {
                const newExpanded = typeof updater === 'function' ? updater(prev) : updater;

                if (isDynamicItem && hasLoadedItems && currentItems) {
                    if (cachedData) {
                        const childIds = currentItems.map((child) => child.itemId);
                        const expandedChildIds = newExpanded.filter((id) => childIds.includes(id));

                        globalDynamicItemsCache.set(cacheKey, {
                            ...cachedData,
                            expandedChildren: new Set(expandedChildIds),
                        });
                    }
                }

                return newExpanded;
            });
        },
        [setExpandedItems, isDynamicItem, hasLoadedItems, currentItems, cachedData, cacheKey],
    );

    return (
        <SortableItem
            id={itemId}
            disableDrag={onDragAndDropEnd === undefined || hasChildrenAndIsExpanded}
            disableTransformOfUndraggedItems={true}
        >
            <TreeItem
                key={`${itemId}-loading:${isLoading}-error:${hasError}`}
                itemId={itemId}
                style={{
                    marginLeft: nestLevel > 0 ? (isCompact ? '8px' : '32px') : '0px',
                }}
                label={<span dangerouslySetInnerHTML={{ __html: sanitizedLabel }} />}
                sx={{
                    '& .MuiTreeItem-content': {
                        gap: isCompact ? '2px' : '8px',
                        ...(variant === 'default' && {
                            borderStyle: 'solid',
                            borderWidth: dropInId === itemId ? '2px' : '1px',
                            borderColor:
                                dropInId === itemId
                                    ? (theme: Theme): string => theme.palette.primary.main
                                    : (theme: Theme): string => theme.palette.components.datagrid.border,
                        }),
                        borderRadius: '4px',
                        padding: dropInId === itemId ? '0px' : '1px',
                        paddingY: isCompact ? '0px' : undefined,
                        marginBottom: !isCompact ? '2px' : undefined,
                        zIndex: 0,
                        '&:hover': {
                            backgroundColor: isDragging
                                ? 'inherit'
                                : // @ts-expect-error - mui theme type missing
                                  (theme: Theme): string => theme.palette.primary.focusVisible,
                        },
                        '&.Mui-focused': {
                            zIndex: 0,
                            backgroundColor: (theme: Theme) =>
                                variant === 'default'
                                    ? theme.palette.info.main
                                    : compactThemeColors.backgroundItemActive,
                            ...(variant === 'default'
                                ? { borderColor: (theme: Theme) => theme.palette.info.main }
                                : { border: 'none' }),
                            '& .MuiTypography-root': {
                                color: (theme: Theme) =>
                                    variant === 'default'
                                        ? theme.palette.common.white
                                        : compactThemeColors.fontColorSelected,
                            },
                            '& .RingTreeView-itemRowActionButton': {
                                fill: (theme: Theme) => theme.palette.common.white,
                            },
                            '& .MuiTreeItem-iconContainer': {
                                '&:has(*)': {
                                    borderRightColor: (theme: Theme) => theme.palette.info.main,
                                },
                            },
                            '& .Ring-TreeView-matchedLabel': {
                                color: (theme: Theme) =>
                                    variant === 'default'
                                        ? theme.palette.common.white
                                        : compactThemeColors.fontColorSelected,
                            },
                            '& .MuiCheckbox-root': {
                                color: (theme: Theme) =>
                                    variant === 'default'
                                        ? theme.palette.common.white
                                        : compactThemeColors.fontColorSelected,
                            },
                        },
                    },
                    '& .MuiTreeItem-iconContainer': {
                        height: isCompact ? '18px' : '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottomLeftRadius: '4px',
                        borderTopLeftRadius: '4px',
                        '&:has(*)': {
                            borderRightColor: (theme: Theme) => theme.palette.components.datagrid.border,
                            borderRightWidth: variant === 'default' ? '1px' : '0px',
                            borderRightStyle: 'solid',
                        },
                    },
                    '& .MuiTreeItem-groupTransition': {
                        padding: '0px',
                    },
                    '& .Ring-TreeView-matchedLabel': {
                        color: (theme: Theme) => theme.palette.primary.main,
                    },
                    ...(variant === 'compact' && isSelected && { ...compactExpandedStyles }),
                }}
                slotProps={{
                    iconContainer: {
                        style: {
                            width: hasChildren ? (isCompact ? '18px' : '32px') : '0px',
                        },
                    },
                }}
                slots={{
                    expandIcon: () => (
                        <IconButton
                            ref={expandRef.setRef}
                            disabled={isLoading}
                            color="inherit"
                            onClick={
                                hasError
                                    ? (e): void => {
                                          e.stopPropagation();
                                          setHasLoadedItems(false);
                                          globalDynamicItemsCache.delete(cacheKey);
                                          setExpandedItems((prev) => [...prev, itemId]);
                                          handleExpand();
                                      }
                                    : handleExpand
                            }
                            sx={{
                                width: hasChildren ? (isCompact ? '18px' : '32px') : '0px',
                                height: isCompact ? '18px' : '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            data-testid={`${dataTestId}-expand`}
                        >
                            {hasError ? (
                                <Refresh sx={{ transform: 'scale(-1, 1)' }} color="error" />
                            ) : variant === 'default' ? (
                                <AddOutlined />
                            ) : (
                                <KeyboardArrowDown />
                            )}
                        </IconButton>
                    ),
                    collapseIcon: () =>
                        hasError ? (
                            <IconButton
                                ref={collapseRef.setRef}
                                disabled={isLoading}
                                color="inherit"
                                onClick={(e): void => {
                                    e.stopPropagation();
                                    setHasLoadedItems(false);
                                    globalDynamicItemsCache.delete(cacheKey);
                                    setExpandedItems((prev) => [...prev, itemId]);
                                    handleExpand();
                                }}
                                sx={{
                                    width: hasChildren ? (isCompact ? '18px' : '32px') : '0px',
                                    height: isCompact ? '18px' : '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                data-testid={`${dataTestId}-refresh`}
                            >
                                <Refresh sx={{ transform: 'scale(-1, 1)' }} color="error" />
                            </IconButton>
                        ) : (
                            <Box
                                sx={{
                                    width: isCompact ? '18px' : '32px',
                                    height: isCompact ? '18px' : '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                data-testid={`${dataTestId}-collapse`}
                            >
                                {isLoading ? (
                                    <CircularProgress color="secondary" thickness={5} size={14} />
                                ) : variant === 'default' ? (
                                    <RemoveOutlined />
                                ) : (
                                    <KeyboardArrowUp />
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
                                        gap: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        minWidth: 0,
                                        marginRight: isCompact ? '4px' : '8px',
                                    }}
                                >
                                    <Typography
                                        enableOverflow={true}
                                        alwaysShowTooltip={alwaysShowTooltip}
                                        tooltipTitle={tooltipTitle ?? label}
                                        letterSpacing="0px"
                                        variant={'body2'}
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizedLabel,
                                        }}
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
                                            width: isCompact
                                                ? undefined
                                                : columns?.length
                                                  ? `calc(100% - ${labelWidth})`
                                                  : rowActions?.length
                                                    ? '35px'
                                                    : '0px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginLeft: 'auto',
                                            paddingLeft: nestLevel === 0 && isCompact ? '4px' : '0px',
                                        }}
                                    >
                                        {!isCompact &&
                                            columns?.map((column) => (
                                                <Typography key={column.name} width={column.width} variant={'body2'}>
                                                    {props[column.name]}
                                                </Typography>
                                            ))}
                                        {!isCompact && (
                                            <Box
                                                sx={{
                                                    width: '35px',
                                                    marginLeft:
                                                        columns === undefined || columns.length === 0
                                                            ? undefined
                                                            : '0px',
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
                                                        <MoreVert className={'RingTreeView-itemRowActionButton'} />
                                                        <ActionBox
                                                            actions={rowActions}
                                                            anchorEl={actionBoxRef}
                                                            dataTestIdSuffix={dataTestIdSuffix}
                                                        />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                    {element && (
                                        <Box
                                            sx={{
                                                height: isCompact ? '18px' : '32px',
                                                //marginLeft: 'auto',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {element}
                                        </Box>
                                    )}
                                </Box>
                            </Tooltip>
                            {dropLineUnderId === itemId ? <span className={'ring-tree-item-drop-line-under'} /> : null}
                        </>
                    ),

                    checkbox: ((): React.FC => {
                        //  Tutaj zawsze musi być forward ref bo treeview podaje ref do tego slota.
                        //  Nawet jeżeli zrobimy na to odzielny komponent w tym slocie musie być forward ref albo będą errory w konsoli
                        const CheckboxComponent = forwardRef((props, ref) =>
                            hasCheckbox ? (
                                <Box ref={checkboxRef.setRef} component="span" sx={{ display: 'inline-flex' }}>
                                    <Checkbox
                                        ref={ref as React.RefObject<HTMLButtonElement>}
                                        checked={checked}
                                        disabled={checkboxDisabled}
                                        sx={{ padding: '0px' }}
                                        onChange={(): void => onCheckboxChange(itemId, !checked)}
                                        onClick={(e): void => {
                                            e.stopPropagation();
                                        }}
                                    />
                                </Box>
                            ) : null,
                        );
                        CheckboxComponent.displayName = 'TreeItemCheckbox';

                        return CheckboxComponent;
                    })(),
                }}
            >
                {isDynamicItem && !currentItems ? (
                    // to jest placeholder aby pokazać przycisk ładowania dla dynamicznych elementów
                    <div style={{ display: 'none' }} />
                ) : null}
                {currentItems?.map((child, index) => {
                    const commonProps = {
                        currentSelectedItem,
                        ...child,
                        loadItems: child.loadItems ?? loadItems,
                        order: [...order, index],
                        expandedItems,
                        dropLineUnderId,
                        dropInId,
                        setExpandedItems: handleSetExpandedItems,
                        items: child.items,
                        searchQuery,
                    };

                    return variant === 'compact' ? (
                        <TreeViewItemComponent
                            key={child.itemId}
                            {...commonProps}
                            variant="compact"
                            dataTestIdSuffix={dataTestIdSuffix}
                        />
                    ) : (
                        <TreeViewItemComponent
                            key={child.itemId}
                            {...commonProps}
                            variant="default"
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
