import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Box, IconButton, Theme, useTheme } from '@mui/material';
import { TreeItem } from '@mui/x-tree-view';
import DOMPurify from 'dompurify';
import React, { useMemo } from 'react';
import { WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { Typography } from '../../Atoms/Typography/Typography.js';
import type { SimpleTreeItem } from './SimpleTree.js';

export interface SimpleTreeItemComponentProps extends WithDataTestIdSuffix {
    item: SimpleTreeItem;
    order: number[];
    instanceId: string;
    expandedItems: string[];
    currentSelectedItem: string | null;
    searchQuery: string;
}

const NEST_INDENT = 8;
const ICON_SIZE = 18;
const BORDER_RADIUS = '4px';
const CONTENT_GAP = '2px';
const LABEL_MARGIN_RIGHT = '4px';
const ROOT_ITEM_PADDING_LEFT = '4px';
const SELECTED_BORDER_RADIUS = '8px';

/**
 * Static-only SimpleTree item. Renders the row + recursively renders
 * `item.items`. `loadItems` is ignored here; the parent `SimpleTree` is
 * responsible for swapping in the dynamic implementation
 * (`SimpleTreeItemDynamicComponent`) when any item exposes `loadItems`.
 *
 * Importantly this file does NOT import `@tanstack/react-query`, so it
 * lives in the main bundle and lets `@tanstack/react-query` stay an
 * optional peer dependency for consumers who never use `loadItems`.
 */
export function SimpleTreeItemComponent(props: SimpleTreeItemComponentProps): React.JSX.Element {
    const { item, order, instanceId, expandedItems, currentSelectedItem, searchQuery, dataTestIdSuffix } = props;

    const { itemId, label, items: staticItems, element, alwaysShowTooltip, tooltipTitle } = item;

    const theme = useTheme();
    const dataTestId = useRingDataTestId(
        'simpletree',
        dataTestIdSuffix ? `${dataTestIdSuffix}-item-${itemId}` : `item-${itemId}`,
    );

    const sanitizedLabel = useMemo(() => DOMPurify.sanitize(label, { ALLOWED_TAGS: ['span'] }), [label]);

    const resolvedItems = staticItems;
    const hasChildren = resolvedItems !== undefined && resolvedItems.length > 0;
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
                        backgroundColor: (t: Theme): string => t.palette.primary.focusVisible,
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
                        borderRightColor: (t: Theme) => t.palette.components.datagrid.border,
                        borderRightWidth: '0px',
                        borderRightStyle: 'solid',
                    },
                },
                '& .MuiTreeItem-groupTransition': {
                    padding: '0px',
                },
                '& .Ring-TreeView-matchedLabel': {
                    color: (t: Theme) => t.palette.primary.main,
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
                        <KeyboardArrowDown />
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
                        <KeyboardArrowUp />
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
                            alwaysShowTooltip={alwaysShowTooltip}
                            tooltipTitle={tooltipTitle ?? label}
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
            {resolvedItems?.map((child, index) => (
                <SimpleTreeItemComponent
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
