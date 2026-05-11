import { KeyboardArrowDown, KeyboardArrowUp, Refresh } from '@mui/icons-material';
import { Box, CircularProgress, IconButton, Theme, useTheme } from '@mui/material';
import { TreeItem } from '@mui/x-tree-view';
// Namespace import (`import * as`) so this file compiles against the
// optional-peer-dep stub at the consumer's build time when
// `@tanstack/react-query` isn't installed. See `treeQueryClient.ts` for
// the full rationale.
import * as ReactQuery from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import React, { useMemo } from 'react';
import { WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { Typography } from '../../Atoms/Typography/Typography.js';
import { STRIPPED_FN_MARKER, filterTreeItems } from '../treeShared.js';
import type { SimpleTreeItem } from './SimpleTree.js';

export interface SimpleTreeItemDynamicComponentProps extends WithDataTestIdSuffix {
    item: SimpleTreeItem;
    order: number[];
    instanceId: string;
    expandedItems: string[];
    currentSelectedItem: string | null;
    searchQuery: string;
}

function filterDynamicItems(items: SimpleTreeItem[], query: string): SimpleTreeItem[] {
    return filterTreeItems(items, query, 'Ring-TreeView-matchedLabel');
}

const NEST_INDENT = 8;
const ICON_SIZE = 18;
const BORDER_RADIUS = '4px';
const CONTENT_GAP = '2px';
const LABEL_MARGIN_RIGHT = '4px';
const ROOT_ITEM_PADDING_LEFT = '4px';
const SELECTED_BORDER_RADIUS = '8px';
const SPINNER_SIZE = 14;
const SPINNER_THICKNESS = 5;

export function SimpleTreeItemDynamicComponent(props: SimpleTreeItemDynamicComponentProps): React.JSX.Element {
    const { item, order, instanceId, expandedItems, currentSelectedItem, searchQuery, dataTestIdSuffix } = props;

    const { itemId, label, items: staticItems, element, loadItems } = item;

    const theme = useTheme();
    const dataTestId = useRingDataTestId(
        'simpletree',
        dataTestIdSuffix ? `${dataTestIdSuffix}-item-${itemId}` : `item-${itemId}`,
    );

    const isSearchActive = searchQuery.length > 0;
    const isExpanded = expandedItems.includes(itemId);
    // `loadItems` may be a real function, undefined, or — for cache-rehydrated
    // items — the `STRIPPED_FN_MARKER` sentinel that survives `JSON.stringify`
    // in place of the original function. The sentinel still counts as "dynamic"
    // for chevron rendering, but the query stays disabled until the parent's
    // cascading refetch replaces the item with one carrying a live function.
    const hasLiveLoadItems = typeof loadItems === 'function';
    const isDynamicItem = hasLiveLoadItems || (loadItems as unknown) === STRIPPED_FN_MARKER;

    const queryClient = ReactQuery.useQueryClient();

    const {
        data: dynamicItems,
        isFetching,
        isError,
        refetch,
    } = ReactQuery.useQuery<SimpleTreeItem[]>({
        queryKey: ['simpleTreeItem', instanceId, itemId],
        queryFn: () => {
            const result = loadItems!(item);

            return Promise.resolve(result);
        },
        enabled: hasLiveLoadItems && isExpanded,
        staleTime: Infinity,
        retry: false,
    });

    const sanitizedLabel = useMemo(() => DOMPurify.sanitize(label, { ALLOWED_TAGS: ['span'] }), [label]);

    const resolvedItems = useMemo((): SimpleTreeItem[] | undefined => {
        // Fall back to `dynamicItems` (which `useQuery` returns from the cache
        // even when `enabled: false`) regardless of `isDynamicItem`. This makes
        // the FULL hydrated subtree appear instantly on mount, even for items
        // whose `loadItems` function got stripped during JSON serialization —
        // the cascading invalidation refetch then replaces the data with fresh
        // children carrying live `loadItems` silently in the background.
        let currentItems: SimpleTreeItem[] | undefined = staticItems ?? dynamicItems;

        if (isSearchActive && searchQuery && currentItems && currentItems === dynamicItems) {
            currentItems = filterDynamicItems(currentItems, searchQuery);
        }

        return currentItems;
    }, [staticItems, dynamicItems, isSearchActive, searchQuery]);

    const hasChildren = isDynamicItem || (resolvedItems !== undefined && resolvedItems.length > 0);
    const nestLevel = order.length - 1;
    const isSelected = itemId === currentSelectedItem;

    const compactThemeColors = {
        backgroundItemActive: theme.colors.blue[100],
        secondBackgroundActive: theme.colors.blue[50],
        fontColorSelected: theme.colors.grey[900],
    };

    const compactExpandedStyles = {
        backgroundColor: compactThemeColors.secondBackgroundActive,
        borderRadius: SELECTED_BORDER_RADIUS,
    };

    const handleRefresh = (e: React.MouseEvent): void => {
        e.stopPropagation();
        queryClient.removeQueries({ queryKey: ['simpleTreeItem', instanceId, itemId] });
        refetch();
    };

    return (
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
                    borderRadius: BORDER_RADIUS,
                    padding: '1px',
                    paddingY: '0px',
                    zIndex: 0,
                    '&:hover': {
                        // @ts-expect-error - mui theme type missing
                        backgroundColor: (theme: Theme): string => theme.palette.primary.focusVisible,
                    },
                    '&.Mui-focused': {
                        zIndex: 0,
                        backgroundColor: compactThemeColors.backgroundItemActive,
                        border: 'none',
                        '& .MuiTypography-root': {
                            color: compactThemeColors.fontColorSelected,
                        },
                        '& .Ring-TreeView-matchedLabel': {
                            color: compactThemeColors.fontColorSelected,
                        },
                    },
                },
                '& .MuiTreeItem-iconContainer': {
                    height: `${ICON_SIZE}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottomLeftRadius: BORDER_RADIUS,
                    borderTopLeftRadius: BORDER_RADIUS,
                    '&:has(*)': {
                        borderRightColor: (theme: Theme) => theme.palette.components.datagrid.border,
                        borderRightWidth: '0px',
                        borderRightStyle: 'solid',
                    },
                },
                '& .MuiTreeItem-groupTransition': {
                    padding: '0px',
                },
                '& .Ring-TreeView-matchedLabel': {
                    color: (theme: Theme) => theme.palette.primary.main,
                },
                ...(isSelected && { ...compactExpandedStyles }),
            }}
            slotProps={{
                iconContainer: {
                    style: {
                        width: hasChildren ? `${ICON_SIZE}px` : '0px',
                    },
                },
            }}
            slots={{
                expandIcon: () => (
                    <IconButton
                        disabled={isFetching}
                        color="inherit"
                        onClick={isError ? handleRefresh : undefined}
                        sx={{
                            width: hasChildren ? `${ICON_SIZE}px` : '0px',
                            height: `${ICON_SIZE}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        data-testid={`${dataTestId}-expand`}
                    >
                        {isError ? <Refresh sx={{ transform: 'scale(-1, 1)' }} color="error" /> : <KeyboardArrowDown />}
                    </IconButton>
                ),
                collapseIcon: () =>
                    isError ? (
                        <IconButton
                            disabled={isFetching}
                            color="inherit"
                            onClick={handleRefresh}
                            sx={{
                                width: hasChildren ? `${ICON_SIZE}px` : '0px',
                                height: `${ICON_SIZE}px`,
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
                                width: `${ICON_SIZE}px`,
                                height: `${ICON_SIZE}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            data-testid={`${dataTestId}-collapse`}
                        >
                            {isFetching ? (
                                <CircularProgress color="secondary" thickness={SPINNER_THICKNESS} size={SPINNER_SIZE} />
                            ) : (
                                <KeyboardArrowUp />
                            )}
                        </Box>
                    ),
                label: () => (
                    <Box
                        sx={{
                            width: 'calc(100%)',
                            gap: CONTENT_GAP,
                            display: 'flex',
                            alignItems: 'center',
                            minWidth: 0,
                            marginRight: LABEL_MARGIN_RIGHT,
                        }}
                    >
                        <Typography
                            enableOverflow={true}
                            letterSpacing="0px"
                            variant="body2"
                            dangerouslySetInnerHTML={{ __html: sanitizedLabel }}
                            sx={{
                                minWidth: 0,
                                flex: '1 1 0',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                            }}
                        />
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginLeft: 'auto',
                                paddingLeft: nestLevel === 0 ? ROOT_ITEM_PADDING_LEFT : '0px',
                            }}
                        >
                            {/* No columns or row actions in SimpleTree */}
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
                ),
            }}
        >
            {isDynamicItem && !resolvedItems ? <div style={{ display: 'none' }} /> : null}
            {resolvedItems?.map((child, index) => (
                <SimpleTreeItemDynamicComponent
                    key={child.itemId}
                    item={child}
                    order={[...order, index]}
                    instanceId={instanceId}
                    expandedItems={expandedItems}
                    currentSelectedItem={currentSelectedItem}
                    searchQuery={searchQuery}
                    dataTestIdSuffix={dataTestIdSuffix}
                />
            ))}
        </TreeItem>
    );
}
