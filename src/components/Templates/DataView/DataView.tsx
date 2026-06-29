import React, { useState, useRef, useEffect, useCallback, FunctionComponent } from 'react';
import classNames from 'classnames';

import { AppBar, Box, Drawer, DrawerProps, IconButton, Stack, useTheme, useMediaQuery } from '@mui/material';
import { CloseOutlined, FilterList, InfoOutlined, MoreVert } from '@mui/icons-material';

import { Action } from '../../../types.js';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { SearchBar, SearchBarProps } from '../../Molecules/SearchBar/SearchBar.js';
import { ControlledSearchBoxProps } from '../../Molecules/SearchBox/SearchBox.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { DETAIL_WIDTH } from '../../Organisms/Detail/Detail.js';
import { DataViewProvider, useDataViewContext } from './DataViewContext.js';
import { BottomBarProvider } from '../../internal/BottomBar/BottomBarContext.js';
import BottomBarContainer, { BottomBarSlotProps } from '../../internal/BottomBar/BottomBarContainer.js';

const LOCAL_STORAGE_LEFT_SLOT_WIDTH_KEY = 'ring-dataview-left-slot-width';

function clampSlotWidth(width: number, minWidth: number, maxWidth: number): number {
    return Math.min(maxWidth, Math.max(minWidth, width));
}

function readStoredLeftSlotWidth(): number {
    try {
        return Number.parseInt(localStorage.getItem(LOCAL_STORAGE_LEFT_SLOT_WIDTH_KEY) || '', 10);
    } catch {
        return NaN;
    }
}

export type TopSlotProps = SearchBarProps & {
    /**
     * Additional actions for MoreVert IconButton in TopSlot
     */
    menuActions?: Action[];

    /**
     * Labels for open slots on mobile actions in MoreVert IconButton in TopSlot
     */
    openSlotsOnMobileLabels?: {
        leftSlot?: string;
        rightSlot?: string;
    };
};

export interface DataViewProps extends CommonComponentProps {
    /**
     * Overridable component slots.
     */
    slots: {
        /**
         * Main component to be rendered in the center of DataView layout
         */
        main: React.JSX.Element;

        /**
         * Top component
         */
        top?: FunctionComponent<TopSlotProps>;

        /**
         * Left component
         */
        left?: React.JSX.Element;

        /**
         * Right component
         */
        right?: React.JSX.Element;

        /**
         * Bottom component
         */
        bottom?: FunctionComponent<BottomBarSlotProps>;
    };

    /**
     * The props used for each slot inside the component.
     */
    slotProps?: {
        /**
         * Props for the topSlot component (defaultValue and searchFunc for uncontrolled or value and onChange for controlled)
         */
        top?: TopSlotProps;

        /**
         * Props for the bottomSlot component
         */
        bottom?: BottomBarSlotProps;
    };

    /**
     * State indicating whether the rightSlot component is open
     */
    rightSlotOpen?: boolean;

    /**
     * Callback function to set the rightSlotOpen state
     */
    setRightSlotOpen?: (n: boolean) => void;

    /**
     * State indicating whether the leftSlot component is open
     * @default true
     */
    leftSlotOpen?: boolean;

    /**
     * Callback function to set the leftSlotOpen state
     */
    setLeftSlotOpen?: (n: boolean) => void;

    /**
     * Width of the leftSlot component, if leftSlot dynamic width is enabled, it will be read from localStorage
     * @default 220
     */
    leftSlotWidth?: number;

    /**
     * Configurations for dynamic leftSlot width, by default it is disabled
     */
    leftSlotDynamicWidth?: {
        enabled?: boolean;
        minWidth?: number;
        maxWidth?: number;
        onChange?: (width: number) => void;
    };

    /**
     * Minimum width of the grid container
     * @default 500
     */
    mainSlotMinWidth?: number;

    /**
     * Callback function to be called when the screen size changes
     * @param isMobile
     */
    onScreenSizeChange?: (isMobile: boolean) => void;

    /**
     * Whether the mobile left slot drawer is open. Optional - if not provided, the state is managed internally.
     */
    isMobileLeftSlotOpen?: boolean;
    /**
     * Callback when mobile left slot drawer open state changes. Use with isMobileLeftSlotOpen for controlled mode.
     */
    onMobileLeftSlotOpen?: (open: boolean) => void;
    /**
     * Whether the mobile detail drawer is open. Optional - if not provided, the state is managed internally.
     */
    isMobileRightSlotOpen?: boolean;
    /**
     * Callback when the mobile detail drawer opens state changes. Use with isMobileRightSlotOpen for controlled mode.
     */
    onMobileRightSlotOpen?: (open: boolean) => void;

    /**
     * Whether to show the left slot toggle button in toolbars (e.g., RingDataGridToolbar).
     * When false, the left slot toggle button will not be rendered even if the left slot is present.
     * @default true
     */
    showLeftSlotToggleButton?: boolean;
}

export function DataViewComponent(props: DataViewProps): React.JSX.Element {
    const {
        slots,
        slotProps,
        rightSlotOpen,
        setRightSlotOpen,
        leftSlotOpen = true,
        setLeftSlotOpen,
        leftSlotWidth = 220,
        mainSlotMinWidth = 500,
        onScreenSizeChange,
        className,
        sx,
        isMobileLeftSlotOpen: controlledMobileLeftSlotOpen,
        onMobileLeftSlotOpen,
        isMobileRightSlotOpen: controlledMobileRightSlotOpen,
        onMobileRightSlotOpen,
        showLeftSlotToggleButton = true,
    } = props;

    const leftSlotDynamicWidthEnabled = props.leftSlotDynamicWidth?.enabled || false;
    const leftSlotDynamicWidthMinWidth = props.leftSlotDynamicWidth?.minWidth || 220;
    const leftSlotDynamicWidthMaxWidth = props.leftSlotDynamicWidth?.maxWidth || 444;
    const leftSlotDynamicWidthOnChange = props.leftSlotDynamicWidth?.onChange;

    const [leftSlotResizedWidth, setLeftSlotResizedWidth] = useState(() => {
        const storedLeftSlotWidth = leftSlotDynamicWidthEnabled ? readStoredLeftSlotWidth() : NaN;
        const initialLeftSlotWidth = Number.isNaN(storedLeftSlotWidth) ? leftSlotWidth : storedLeftSlotWidth;

        return clampSlotWidth(initialLeftSlotWidth, leftSlotDynamicWidthMinWidth, leftSlotDynamicWidthMaxWidth);
    });
    const leftSlotRef = useRef<HTMLDivElement>(null);
    const mainSlotContainerRef = useRef<HTMLDivElement>(null);
    const moreActionsButtonRef = useRef<HTMLButtonElement>(null);

    const handleSetRightSlotOpen = useCallback(
        (n: boolean): void => {
            if (setRightSlotOpen) {
                setRightSlotOpen(n);
            }
        },
        [setRightSlotOpen],
    );

    const handleLeftSlotDynamicWidthChange = useCallback(
        (width: number): void => {
            setLeftSlotResizedWidth(width);

            if (leftSlotDynamicWidthEnabled) {
                try {
                    localStorage.setItem(LOCAL_STORAGE_LEFT_SLOT_WIDTH_KEY, width.toString());
                } catch {
                    // Ignore unavailable storage; resizing should still work.
                }
            }

            if (leftSlotDynamicWidthOnChange) {
                leftSlotDynamicWidthOnChange(width);
            }
        },
        [leftSlotDynamicWidthEnabled, leftSlotDynamicWidthOnChange],
    );

    useEffect(() => {
        const storedLeftSlotWidth = leftSlotDynamicWidthEnabled ? readStoredLeftSlotWidth() : NaN;
        const nextLeftSlotWidth = Number.isNaN(storedLeftSlotWidth) ? leftSlotWidth : storedLeftSlotWidth;

        setLeftSlotResizedWidth(
            clampSlotWidth(nextLeftSlotWidth, leftSlotDynamicWidthMinWidth, leftSlotDynamicWidthMaxWidth),
        );
    }, [leftSlotWidth, leftSlotDynamicWidthEnabled, leftSlotDynamicWidthMinWidth, leftSlotDynamicWidthMaxWidth]);

    const handleLeftSlotResize = useCallback((): void => {
        document.body.style.userSelect = 'none'; // prevent text selection while resizing

        const onMouseMove = (e: MouseEvent): void => {
            if (leftSlotRef.current && mainSlotContainerRef.current) {
                const newWidth = e.clientX - leftSlotRef.current.getBoundingClientRect().left;

                const widthDiff = newWidth - leftSlotResizedWidth;
                const newGridWidth = mainSlotContainerRef.current.getBoundingClientRect().width - widthDiff;

                if (
                    newWidth >= leftSlotDynamicWidthMinWidth &&
                    newWidth <= leftSlotDynamicWidthMaxWidth &&
                    newGridWidth >= mainSlotMinWidth
                ) {
                    handleLeftSlotDynamicWidthChange(newWidth);
                }
            }

            e.preventDefault();
        };

        const onMouseUp = (): void => {
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [
        handleLeftSlotDynamicWidthChange,
        leftSlotDynamicWidthMaxWidth,
        leftSlotDynamicWidthMinWidth,
        leftSlotResizedWidth,
        mainSlotMinWidth,
    ]);

    const { dataViewState, setDataViewState } = useDataViewContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [uncontrolledMobileLeftSlotOpen, setUncontrolledMobileLeftSlotOpen] = useState(false);
    const [uncontrolledMobileRightSlotOpen, setUncontrolledMobileRightSlotOpen] = useState(false);

    const isMobileLeftSlotOpen =
        controlledMobileLeftSlotOpen !== undefined ? controlledMobileLeftSlotOpen : uncontrolledMobileLeftSlotOpen;
    const isMobileRightSlotOpen =
        controlledMobileRightSlotOpen !== undefined ? controlledMobileRightSlotOpen : uncontrolledMobileRightSlotOpen;

    const setMobileLeftSlotOpen = useCallback(
        (open: boolean) => {
            if (onMobileLeftSlotOpen) {
                onMobileLeftSlotOpen(open);
            } else {
                setUncontrolledMobileLeftSlotOpen(open);
            }
        },
        [onMobileLeftSlotOpen],
    );

    const setMobileRightSlotOpen = useCallback(
        (open: boolean) => {
            if (onMobileRightSlotOpen) {
                onMobileRightSlotOpen(open);
            } else {
                setUncontrolledMobileRightSlotOpen(open);
            }
        },
        [onMobileRightSlotOpen],
    );

    useEffect(() => {
        setDataViewState((prevState) => ({
            ...prevState,
            hasLeftSlot: Boolean(slots.left),
            isLeftSlotOpen: leftSlotOpen,
            setLeftSlotOpen:
                setLeftSlotOpen !== undefined
                    ? setLeftSlotOpen
                    : (n: boolean): void => setDataViewState((prev) => ({ ...prev, isLeftSlotOpen: n })),
            showLeftSlotToggleButton,
        }));
    }, [slots.left, leftSlotOpen, setDataViewState, setLeftSlotOpen, showLeftSlotToggleButton]);

    useEffect(() => {
        setDataViewState((prevState) => ({ ...prevState, isMobile }));

        if (onScreenSizeChange) {
            onScreenSizeChange(isMobile);
        }
    }, [isMobile, onScreenSizeChange, setDataViewState]);

    useEffect(() => {
        const handleResize = (): void => {
            if (leftSlotRef.current && mainSlotContainerRef.current) {
                const leftSlotWidth = leftSlotRef.current.getBoundingClientRect().width;
                const gridWidth = mainSlotContainerRef.current.getBoundingClientRect().width;
                const diffToMinimumGridWidth = mainSlotMinWidth - gridWidth;

                // If the grid width is less than the minimum, adjust the left slot width
                if (diffToMinimumGridWidth > 0) {
                    const newLeftSlotWidth = Math.max(
                        leftSlotDynamicWidthMinWidth,
                        leftSlotWidth - diffToMinimumGridWidth,
                    );
                    handleLeftSlotDynamicWidthChange(newLeftSlotWidth);
                }
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [handleLeftSlotDynamicWidthChange, mainSlotMinWidth, leftSlotDynamicWidthMinWidth]);

    const openRightSlotAction: Action = {
        label: slotProps?.top?.openSlotsOnMobileLabels?.rightSlot || '',
        icon: <InfoOutlined />,
        onClick: () => setMobileRightSlotOpen(!isMobileRightSlotOpen),
    };

    const openLeftSlotAction: Action = {
        label: slotProps?.top?.openSlotsOnMobileLabels?.leftSlot || '',
        icon: <FilterList />,
        onClick: () => setMobileLeftSlotOpen(!isMobileLeftSlotOpen),
    };

    const menuActionsOnMobile: Action[] = [
        ...(slots.right ? [openRightSlotAction] : []),
        ...(slots.left ? [openLeftSlotAction] : []),
    ];

    const menuActions: Action[] = [
        ...(dataViewState.isMobile ? menuActionsOnMobile : []),
        ...(slotProps?.top?.menuActions || []),
    ];

    const searchBarChildren = [
        ...React.Children.toArray(slotProps?.top?.children),
        ...(menuActions.length > 0
            ? [
                  <IconButton key={'menu-actions'} ref={moreActionsButtonRef} aria-label="More actions">
                      <MoreVert />
                      <ActionBox actions={menuActions} anchorEl={moreActionsButtonRef} />
                  </IconButton>,
              ]
            : []),
        ...(!isMobile && slots.right
            ? [
                  <IconButton
                      key={'right-slot-open'}
                      onClick={(): void => handleSetRightSlotOpen(!rightSlotOpen)}
                      aria-label={rightSlotOpen ? 'Close details' : 'Open details'}
                      aria-pressed={rightSlotOpen}
                  >
                      <InfoOutlined />
                  </IconButton>,
              ]
            : []),
    ];

    return (
        <Stack
            direction="row"
            sx={{ width: '100%', height: '100%', ...sx }}
            className={classNames('ring-dataview', className)}
        >
            <Stack
                direction="row"
                sx={{
                    width: !isMobile && slots.right && rightSlotOpen ? `calc(100% - ${DETAIL_WIDTH}px)` : '100%',
                    height: '100%',
                }}
            >
                {slots.left &&
                    (dataViewState.isMobile ? (
                        <RingDrawer
                            onClose={(): void => setMobileLeftSlotOpen(false)}
                            open={isMobileLeftSlotOpen}
                            PaperProps={{ sx: { width: `${leftSlotWidth}px` } }}
                        >
                            {slots.left}
                        </RingDrawer>
                    ) : (
                        dataViewState.isLeftSlotOpen && (
                            <Stack
                                direction={'row'}
                                sx={{
                                    borderRightStyle: 'solid',
                                    borderWidth: '1px',
                                    borderColor: (theme) => theme.palette.components.dataview.border,
                                }}
                            >
                                <Box width={leftSlotResizedWidth} ref={leftSlotRef} sx={{ position: 'relative' }}>
                                    {slots.left}
                                    {leftSlotDynamicWidthEnabled && (
                                        <Box
                                            id={'resize'}
                                            onMouseDown={handleLeftSlotResize}
                                            sx={{
                                                position: 'absolute',
                                                width: '7px',
                                                right: -4,
                                                top: 0,
                                                height: '100%',
                                                cursor: 'col-resize',
                                                zIndex: 10,
                                            }}
                                        />
                                    )}
                                </Box>
                            </Stack>
                        )
                    ))}
                <Stack
                    direction={'column'}
                    ref={mainSlotContainerRef}
                    sx={{
                        width: !isMobile
                            ? `calc(100% - ${slots.left && dataViewState.isLeftSlotOpen ? leftSlotResizedWidth + 1 : 0}px)`
                            : '100%',
                        position: 'relative',
                        height: '100%',
                    }}
                >
                    {slotProps?.top &&
                        (slots.top ? (
                            React.createElement(slots.top, { ...slotProps.top }, ...searchBarChildren)
                        ) : (
                            <SearchBar {...(slotProps?.top as ControlledSearchBoxProps)}>{searchBarChildren}</SearchBar>
                        ))}
                    <Box sx={{ flex: '1 1 auto', overflow: 'auto' }}>{slots.main}</Box>
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white' }}>
                        <BottomBarContainer bottomBar={props.slots?.bottom} slotProps={props.slotProps?.bottom} />
                    </Box>
                </Stack>
            </Stack>

            {slots.right &&
                (dataViewState.isMobile ? (
                    <RingDrawer
                        anchor={'right'}
                        open={isMobileRightSlotOpen}
                        onClose={(): void => {
                            setMobileRightSlotOpen(false);
                        }}
                    >
                        {slots.right}
                    </RingDrawer>
                ) : (
                    <Box
                        sx={{
                            width: rightSlotOpen ? `${DETAIL_WIDTH}px` : '0px',
                            borderLeftStyle: 'solid',
                            borderWidth: '1px',
                            borderColor: (theme) => theme.palette.components.dataview.border,
                            overflow: 'hidden',
                        }}
                    >
                        {slots.right}
                    </Box>
                ))}
        </Stack>
    );
}

export function DataView(props: DataViewProps): React.JSX.Element {
    return (
        <DataViewProvider>
            <BottomBarProvider>
                <DataViewComponent {...props} />
            </BottomBarProvider>
        </DataViewProvider>
    );
}

interface RingDrawerProps extends DrawerProps, CommonComponentProps {
    onClose: () => void;
}

export function RingDrawer(props: RingDrawerProps): React.JSX.Element {
    const { onClose, children, ...otherProps } = props;

    return (
        <Drawer className="ring-drawer" transitionDuration={500} {...otherProps} onClose={onClose}>
            <AppBar sx={{ alignItems: 'flex-start', position: 'static' }}>
                <IconButton onClick={onClose} aria-label="Close">
                    <CloseOutlined />
                </IconButton>
            </AppBar>
            {children}
        </Drawer>
    );
}
