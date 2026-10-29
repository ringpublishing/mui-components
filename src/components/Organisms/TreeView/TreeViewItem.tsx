import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, ChevronDown, ChevronUp, EllipsisVertical, RotateCw, Minus } from 'lucide-react';
import {
    alpha,
    Box,
    Checkbox,
    CircularProgress,
    IconButton,
    PopperProps,
    Theme,
    Tooltip,
    useTheme,
} from '@mui/material';
import { TreeItem } from '@mui/x-tree-view';
import DOMPurify from 'dompurify';

import { WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';
import { resolveItemDataTestId } from '../../../helpers/dataTestId.js';
import { resolveMoreActionsAriaLabel } from '../../../helpers/moreActionsAriaLabel.js';
import { RingLucideIcon } from '../../../helpers/RingLucideIcon.js';
import { Typography } from '../../Atoms/Typography/Typography.js';
import { SortableItem } from '../../internal/SortableItem.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { useNonDraggableRef } from '../SortableList/SortableList.js';
import { Column } from './DefaultTreeView.js';
import { filterItems, TreeViewItem } from './TreeView.js';
import { DECORATIVE_EXPAND_BUTTON_PROPS, getPlainLabel } from '../../internal/tree/treeShared.js';

const TREE_VIEW_ICON_SIZE = 18;

/** The children each dynamic row of one tree has loaded, and which of them are expanded, by the row's `itemId`. */
export type TreeViewDynamicItemsCache = Map<string, { items: TreeViewItem[]; expandedChildren: Set<string> }>;

/** Each tree provides a map of its own, so rows of two trees that share an `itemId` never share children. */
export const TreeViewDynamicItemsCacheContext = createContext<TreeViewDynamicItemsCache>(new Map());

/** The row the user has just expanded — with a click on its icon container or with the keyboard. */
export interface TreeViewExpansionRequest {
    itemId: string;
}

/**
 * Set by the tree from MUI's `onItemExpansionToggle`, which fires for the user's own toggles and never
 * for the rows search expands by itself — so a dynamic row loads when the user opens it, not whenever
 * a query happens to match it.
 */
export const TreeViewExpansionRequestContext = createContext<TreeViewExpansionRequest | null>(null);

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
    rowActionsAriaLabel?: never;
}

interface DefaultTreeViewItemProps extends CommonTreeViewItemProps {
    variant: 'default';
    onDragAndDropEnd?: (sourceAbsoluteId: number[], destinationAbsoluteId: number[]) => void;
    onCheckboxChange?: (itemId: string, checked: boolean) => void;
    columns?: Column[];
    dragAndDropTooltipTitle?: string;
    dragAndDropTooltipPlacement: PopperProps['placement'];
    rowActionsAriaLabel?: string;
}
type LoadItemsFunction = () => Promise<TreeViewItem[]> | TreeViewItem[];
type StaticOrDynamicTreeViewItems = TreeViewItem[] | LoadItemsFunction;

type ChildTreeViewItemProps = TreeViewItemComponentProps & {
    items?: StaticOrDynamicTreeViewItems;
    setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
    /** The `itemId`s of the rows above this one, nearest last. */
    ancestorItemIds?: string[];
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
        rowActionsAriaLabel,
        isDragging,
        dropLineUnderId,
        dropInId,
        element,
        variant = 'default',
        loadItems,
        setExpandedItems,
        searchQuery = '',
        ancestorItemIds = [],
        dataTestIdSuffix,
    } = props;

    const theme = useTheme();
    const expansionRequest = useContext(TreeViewExpansionRequestContext);
    const dynamicItemsCache = useContext(TreeViewDynamicItemsCacheContext);
    // A row that mounts after its own request (search hid it and brought it back) has handled that request already.
    const handledExpansionRequest = useRef<TreeViewExpansionRequest | null>(expansionRequest);

    const dataTestId = resolveItemDataTestId({
        componentName: 'TreeView',
        listSuffix: dataTestIdSuffix,
        itemId,
        item: props,
    });

    const isSearchActive = searchQuery.length > 0;

    const compactThemeColors = {
        backgroundItemActive: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        secondBackgroundActive: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
        fontColorSelected: theme.palette.text.primary,
    };

    const compactExpandedStyles = {
        backgroundColor: compactThemeColors.secondBackgroundActive,
        borderRadius: '8px',
    };

    const isDynamicItem = loadItems !== undefined;
    const cacheKey = itemId;
    const cachedData = dynamicItemsCache.get(cacheKey);

    const [dynamicItems, setDynamicItems] = useState<TreeViewItem[] | undefined>(
        isDynamicItem ? cachedData?.items : items,
    );
    const [hasLoadedItems, setHasLoadedItems] = useState<boolean>(Boolean(cachedData));

    let currentItems = items !== undefined ? items : isDynamicItem ? dynamicItems : undefined;

    if (isSearchActive && searchQuery && currentItems === dynamicItems && dynamicItems) {
        currentItems = filterItems(dynamicItems, searchQuery, dynamicItemsCache);
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
    const isExpanded = expandedItems.includes(itemId);
    const hasChildrenAndIsExpanded = hasChildren && isExpanded;
    const isSelected = itemId === currentSelectedItem;

    const actionBoxRef = useNonDraggableRef();
    const checkboxRef = useNonDraggableRef();
    const expandRef = useNonDraggableRef();
    const collapseRef = useNonDraggableRef();

    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const sanitizedLabel = useMemo(() => DOMPurify.sanitize(label, { ALLOWED_TAGS: ['span'] }), [label]);
    const plainLabel = useMemo(() => getPlainLabel(label), [label]);

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

            const cachedData = dynamicItemsCache.get(cacheKey);
            const previouslyExpandedChildren = cachedData?.expandedChildren || new Set<string>();

            dynamicItemsCache.set(cacheKey, {
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
    }, [expandedItems, isDynamicItem, itemId, loadItems, setExpandedItems, cacheKey, label, props, dynamicItemsCache]);

    const handleSetExpandedItems = useCallback(
        (updater: React.SetStateAction<string[]>): void => {
            setExpandedItems((prev) => {
                const newExpanded = typeof updater === 'function' ? updater(prev) : updater;

                if (isDynamicItem && hasLoadedItems && currentItems) {
                    if (cachedData) {
                        const childIds = currentItems.map((child) => child.itemId);
                        const expandedChildIds = newExpanded.filter((id) => childIds.includes(id));

                        dynamicItemsCache.set(cacheKey, {
                            ...cachedData,
                            expandedChildren: new Set(expandedChildIds),
                        });
                    }
                }

                return newExpanded;
            });
        },
        [setExpandedItems, isDynamicItem, hasLoadedItems, currentItems, cachedData, cacheKey, dynamicItemsCache],
    );

    // A row expands through the tree item — a click on its icon container or the arrow keys — not
    // through the icon button, so every expansion the user makes loads the children again. Each request is
    // handled once: after a failed load the row collapses, and only expanding it again retries.
    useEffect(() => {
        if (expansionRequest?.itemId !== itemId || handledExpansionRequest.current === expansionRequest) {
            return;
        }

        handledExpansionRequest.current = expansionRequest;

        if (isDynamicItem && !isLoading) {
            void handleExpand();
        }
    }, [expansionRequest, itemId, isDynamicItem, isLoading, handleExpand]);

    return (
        <SortableItem
            id={itemId}
            disableDrag={onDragAndDropEnd === undefined || hasChildrenAndIsExpanded}
            disableTransformOfUndraggedItems={true}
        >
            <TreeItem
                key={`${itemId}-loading:${isLoading}-error:${hasError}`}
                itemId={itemId}
                data-testid={dataTestId}
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
                                    : (theme: Theme): string => theme.palette.divider,
                        }),
                        borderRadius: '4px',
                        padding: dropInId === itemId ? '0px' : '1px',
                        paddingY: isCompact ? '0px' : undefined,
                        marginBottom: !isCompact ? '2px' : undefined,
                        zIndex: 0,
                        '&:hover': {
                            backgroundColor: isDragging
                                ? 'inherit'
                                : (theme: Theme): string =>
                                      alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
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
                                color: (theme: Theme) => theme.palette.common.white,
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
                            borderRightColor: (theme: Theme) => theme.palette.divider,
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
                            // In the error state this is the retry control, a real action for every user.
                            {...(hasError ? {} : DECORATIVE_EXPAND_BUTTON_PROPS)}
                            ref={expandRef.setRef}
                            disabled={isLoading}
                            color="inherit"
                            onClick={
                                hasError
                                    ? (e): void => {
                                          e.stopPropagation();
                                          setHasLoadedItems(false);
                                          dynamicItemsCache.delete(cacheKey);
                                          setExpandedItems((prev) => [...prev, itemId]);
                                          handleExpand();
                                      }
                                    : undefined
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
                                <RingLucideIcon icon={RotateCw} color="error" />
                            ) : variant === 'default' ? (
                                <Plus size={TREE_VIEW_ICON_SIZE} style={{ flexShrink: 0 }} />
                            ) : (
                                <ChevronDown size={TREE_VIEW_ICON_SIZE} style={{ flexShrink: 0 }} />
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
                                    dynamicItemsCache.delete(cacheKey);
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
                                <RingLucideIcon icon={RotateCw} color="error" />
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
                                    <Minus size={TREE_VIEW_ICON_SIZE} style={{ flexShrink: 0 }} />
                                ) : (
                                    <ChevronUp size={TREE_VIEW_ICON_SIZE} style={{ flexShrink: 0 }} />
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
                                                        aria-label={resolveMoreActionsAriaLabel(rowActionsAriaLabel)}
                                                        onClick={(e): void => {
                                                            e.stopPropagation();
                                                        }}
                                                        data-testid={`${dataTestId}-actions`}
                                                    >
                                                        <EllipsisVertical
                                                            className={'RingTreeView-itemRowActionButton'}
                                                            size={TREE_VIEW_ICON_SIZE}
                                                        />
                                                        <ActionBox
                                                            actions={rowActions}
                                                            anchorEl={actionBoxRef}
                                                            dataTestId={`${dataTestId}-menu`}
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
                        // MUI passes a ref to this slot (`getCheckboxProps`) to tell checkbox clicks from row clicks,
                        // so any component rendered here has to forward it to the checkbox.
                        const CheckboxComponent = forwardRef((props, ref) =>
                            hasCheckbox ? (
                                <Box ref={checkboxRef.setRef} component="span" sx={{ display: 'inline-flex' }}>
                                    <Checkbox
                                        ref={ref as React.RefObject<HTMLButtonElement>}
                                        checked={checked}
                                        disabled={checkboxDisabled}
                                        // The tree item's own `aria-checked` follows MUI's selection, not `checked`,
                                        // so the checkbox stays exposed and is named after the row.
                                        slotProps={{ input: { 'aria-label': plainLabel } }}
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
                    // MUI shows the expand icon only for an item with children, so a dynamic item gets a hidden
                    // child until its own children load.
                    <div style={{ display: 'none' }} />
                ) : null}
                {currentItems?.map((child, index) => {
                    // A child with the itemId of this row or of a row above it (a loadItems that returned the row
                    // inside itself) would render the same rows inside each other forever, so it is left out.
                    if (child.itemId === itemId || ancestorItemIds.includes(child.itemId)) {
                        return null;
                    }

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
                        ancestorItemIds: [...ancestorItemIds, itemId],
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
                            rowActionsAriaLabel={rowActionsAriaLabel}
                            dataTestIdSuffix={dataTestIdSuffix}
                        />
                    );
                })}
            </TreeItem>
        </SortableItem>
    );
}
