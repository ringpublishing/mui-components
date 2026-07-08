import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { Box, Collapse, Typography } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { GridRowId } from '@mui/x-data-grid';

import { MediaGridApi, MediaGridItemProps } from '../../Organisms/MultimediaGrid/gridApi.js';
import { useBottomBarContext, BottomBarContextState } from './BottomBarContext.js';
import BottomBar from './BottomBar.js';

export interface BottomBarSlotProps {
    labels?: {
        show?: string;
        hide?: string;
        selected?: string;
    };
    fieldMap?: {
        id?: string;
        name?: string;
        image?: string;
    };
    showVisibilityToggle?: boolean;
    onClick?: (item: Record<string, unknown>, apiRef: BottomBarContextState['apiRef']) => void;
    /**
     * Returns custom tooltip content shown on hover for a bottom-bar item. May return any
     * ReactNode (e.g. multiline JSX). When omitted, the item's name/label is used.
     */
    getTooltip?: (row: Record<string, unknown>) => React.ReactNode;
    [key: string]: any;
}

interface BottomBarContainerProps {
    bottomBar?: FunctionComponent<BottomBarSlotProps>;
    slotProps?: BottomBarSlotProps;
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

function BottomBarContainer({ bottomBar, slotProps }: BottomBarContainerProps): React.JSX.Element | null {
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
                    borderRight: (theme) => `1px solid ${theme.palette.components.dataview.border}`,
                    borderTop: (theme) => `1px solid ${theme.palette.components.dataview.border}`,
                    backgroundColor: (theme) => theme.palette.background.default,
                    paddingX: 1,
                    paddingY: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: (theme) => theme.palette.secondary.main,
                    textAlign: 'center',
                    boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                }}
                onClick={(): void => setIsHidden(!isHidden)}
                borderRadius={'0 4px 0 0'}
            >
                {label}
                <KeyboardArrowUp
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
                borderTop: (theme) => `1px solid ${theme.palette.components.dataview.border}`,
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
                    <BottomBar slotProps={mergedSlotProps} />
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
