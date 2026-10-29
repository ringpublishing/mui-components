import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { Box, Collapse, Typography } from '@mui/material';
import { ChevronUp } from 'lucide-react';
import { GridRowId } from '@mui/x-data-grid';

import type { MediaGridApi, MediaGridItemProps } from '../gridApi.types.js';
import { RingLucideIcon } from '../../../helpers/RingLucideIcon.js';
import { useBottomBarContext, BottomBarApiRef, BottomBarContextState } from './BottomBarContext.js';
import BottomBar from './BottomBar.js';

/**
 * Props of the `DataView` bottom bar (`slotProps.bottom`), which lists the rows selected in the grid.
 */
export interface BottomBarSlotProps {
    /**
     * Texts of the toggle above the bar: `hide` while the bar is expanded, `show` while it is collapsed. When neither
     * a custom bar nor a custom `show` is given, the toggle reads `<count> <selected>` in both states.
     */
    labels?: {
        show?: string;
        hide?: string;
        selected?: string;
    };
    /**
     * Paths (lodash `get` syntax) in a selected row to the item's label and image. By default the label comes from
     * the first visible column of a `RingDataGrid` and from `title` on a `MultimediaGrid`, the image from `image`.
     */
    fieldMap?: {
        id?: string;
        name?: string;
        image?: string;
    };
    /**
     * Renders the toggle that collapses and expands the bar.
     * @default true
     */
    showVisibilityToggle?: boolean;
    /**
     * Called when an item in the bar is clicked, with the item's row and the API of the grid that owns the
     * selection. Items are clickable only when it is set.
     */
    onClick?: (item: Record<string, unknown>, apiRef: BottomBarApiRef) => void;
    /**
     * Returns the tooltip content shown on hover for a bottom-bar item, as any ReactNode; when
     * omitted, the item's label is used.
     */
    getTooltip?: (row: Record<string, unknown>) => React.ReactNode;
    [key: string]: any;
}

interface BottomBarContainerProps {
    bottomBar?: FunctionComponent<BottomBarSlotProps>;
    slotProps?: BottomBarSlotProps;
    /**
     * Prefix for the test ids inside the default bar, which renders none of its own; each item adds
     * `-item-<rowId>`.
     */
    dataTestId?: string;
}

const defaultSlotProps: BottomBarSlotProps = {
    labels: {
        show: 'Show',
        hide: 'Hide',
        selected: 'selected',
    },
    showVisibilityToggle: true,
    showImagePlaceholder: false,
};

function mergeSlotProps(defaults: BottomBarSlotProps, overrides?: BottomBarSlotProps): BottomBarSlotProps {
    return {
        ...defaults,
        ...overrides,
        labels: {
            ...defaults.labels,
            ...overrides?.labels,
        },
    };
}

function BottomBarContainer({ bottomBar, slotProps, dataTestId }: BottomBarContainerProps): React.JSX.Element | null {
    const [isHidden, setIsHidden] = React.useState(true);
    const { bottomBarState, setBottomBarState } = useBottomBarContext();

    useMediaGridSelectionSync(bottomBarState, setBottomBarState);

    const mergedSlotProps = useMemo(() => mergeSlotProps(defaultSlotProps, slotProps), [defaultSlotProps, slotProps]);

    if (
        !bottomBar &&
        (!bottomBarState.isSelectionModeEnabled ||
            bottomBarState.allSelected ||
            !bottomBarState.rowSelectionModel?.ids?.size)
    ) {
        return null;
    }

    const { labels = {}, showVisibilityToggle } = mergedSlotProps;

    const renderCollapseButton = (): React.JSX.Element => {
        let label = isHidden ? labels.hide : labels.show;

        if (!bottomBar && !slotProps?.labels?.show) {
            label = `${bottomBarState.rowSelectionModel?.ids?.size ?? 0} ${labels.selected}`;
        }

        return (
            <Typography
                variant="caption"
                component="span"
                sx={{
                    position: 'absolute',
                    top: '-25px',
                    height: '25px',
                    zIndex: 100,
                    borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                    borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                    backgroundColor: (theme) => theme.palette.background.default,
                    paddingX: 1,
                    paddingY: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: (theme) => theme.palette.text.secondary,
                    textAlign: 'center',
                    boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                }}
                onClick={(): void => setIsHidden(!isHidden)}
                borderRadius={'0 4px 0 0'}
            >
                {label}
                <RingLucideIcon
                    icon={ChevronUp}
                    sx={{
                        transform: isHidden ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease-in-out',
                    }}
                />
            </Typography>
        );
    };

    return (
        <Box
            sx={{
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) => theme.palette.background.default,
                position: 'relative',
                boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
            }}
        >
            {showVisibilityToggle && renderCollapseButton()}
            <Collapse in={isHidden}>
                {bottomBar ? (
                    React.createElement(bottomBar, mergedSlotProps)
                ) : (
                    <BottomBar slotProps={mergedSlotProps} dataTestId={dataTestId} />
                )}
            </Collapse>
        </Box>
    );
}

/**
 * Custom hook to synchronize MediaGrid selection changes with BottomBar state
 */
function useMediaGridSelectionSync(
    bottomBarState: BottomBarContextState,
    setBottomBarState: (state: Partial<BottomBarContextState>) => void,
): void {
    useEffect(() => {
        const apiRef = bottomBarState?.apiRef as MediaGridApi | undefined;

        if (!bottomBarState.isSelectionModeEnabled) {
            return;
        }

        if (!apiRef?.current || apiRef?.current?.mode !== 'media') {
            return;
        }

        const unsubscribe = apiRef.current.subscribeEvent(
            'selectionChange',
            ({ selectedIds, selectedItems }: { selectedIds: GridRowId[]; selectedItems: MediaGridItemProps[] }) => {
                setBottomBarState({
                    rowSelectionModel: { type: 'include', ids: new Set(selectedIds) },
                    items: selectedItems,
                });
            },
        );

        return (): void => {
            unsubscribe();
        };
    }, [bottomBarState, setBottomBarState]);
}

export default BottomBarContainer;
