import { ChevronDown, ChevronUp } from 'lucide-react';
import { alpha, Box, IconButton, Theme, useTheme } from '@mui/material';
import { TreeItem } from '@mui/x-tree-view';
import DOMPurify from 'dompurify';
import React, { useMemo } from 'react';
import { WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';
import { resolveItemDataTestId } from '../../../helpers/dataTestId.js';
import { Typography } from '../../Atoms/Typography/Typography.js';
import type { SimpleTreeItem } from './SimpleTree.js';
import { DECORATIVE_EXPAND_BUTTON_PROPS } from '../../internal/tree/treeShared.js';

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
 * Static SimpleTree item: renders the row and, recursively, `item.items`; `loadItems` is ignored,
 * since `SimpleTree` swaps in `SimpleTreeItemDynamicComponent` when any item exposes it. It ships in
 * the main bundle, so it must not import `@tanstack/react-query`, an optional peer.
 */
export function SimpleTreeItemComponent(props: SimpleTreeItemComponentProps): React.JSX.Element {
    const { item, order, instanceId, expandedItems, currentSelectedItem, searchQuery, dataTestIdSuffix } = props;

    const { itemId, label, items: staticItems, element, alwaysShowTooltip, tooltipTitle } = item;

    const theme = useTheme();
    const dataTestId = resolveItemDataTestId({
        componentName: 'SimpleTree',
        listSuffix: dataTestIdSuffix,
        itemId,
        item,
    });

    const sanitizedLabel = useMemo(() => DOMPurify.sanitize(label, { ALLOWED_TAGS: ['span'] }), [label]);

    const resolvedItems = staticItems;
    const hasChildren = resolvedItems !== undefined && resolvedItems.length > 0;
    const nestLevel = order.length - 1;
    const isSelected = itemId === currentSelectedItem;

    const compactThemeColors = {
        backgroundItemActive: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        secondBackgroundActive: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
        fontColorSelected: theme.palette.text.primary,
    };

    const compactExpandedStyles = {
        backgroundColor: compactThemeColors.secondBackgroundActive,
        borderRadius: SELECTED_BORDER_RADIUS,
    };

    return (
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
                    borderRadius: BORDER_RADIUS,
                    padding: '1px',
                    paddingY: '0px',
                    zIndex: 0,
                    '&:hover': {
                        backgroundColor: (t: Theme): string =>
                            alpha(t.palette.primary.main, t.palette.action.hoverOpacity),
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
                        borderRightColor: (t: Theme) => t.palette.divider,
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
                        {...DECORATIVE_EXPAND_BUTTON_PROPS}
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
                        <ChevronDown size={ICON_SIZE} style={{ flexShrink: 0 }} />
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
                        <ChevronUp size={ICON_SIZE} style={{ flexShrink: 0 }} />
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
