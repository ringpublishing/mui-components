// Non production code

import React, { EffectCallback, useCallback, useEffect, useRef, useState } from 'react';
import {
    GridRowScrollEndParams,
    GridRowSelectionModel,
    GridToolbarProps,
    useGridApiContext,
    useGridEvent,
    useGridRootProps,
} from '@mui/x-data-grid-pro';
import { GridRowId } from '@mui/x-data-grid';
import {
    Close,
    FilterList,
    FilterListOff,
    KeyboardArrowDown,
    Refresh,
    Sort,
    Sync,
    SyncDisabled,
} from '@mui/icons-material';
import {
    IconButton,
    LinearProgress,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { basicGrey100 } from '@ringpublishing/mui-theme';
import { ActionBox } from '../Molecules/ActionBox/ActionBox.js';
import { useDataViewContext } from '../Templates/DataView/DataViewContext.js';

export interface DataToolbarLabels {
    /**
     * The label for the results, example: 'Results: 24'
     */
    results: string;

    /**
     * Label for refresh tooltip
     */
    refresh?: string;

    /**
     * Label for enable auto refresh tooltip
     */
    enableAutoRefresh?: string;

    /**
     * Label for disable auto refresh tooltip
     */
    disableAutoRefresh?: string;

    /**
     * Label for select all button
     */
    selectAll?: string;

    /**
     * Label for deselect all button
     */
    deselectAll?: string;
}

export interface DataToolbarSortableFields {
    key: string;
    name: string;
    onSortingChange?: (sortField: string) => void;
}

// Mock basic theme color - replace with your actual theme

// Types
export interface BulkOperationAction {
    icon: React.ReactNode;
    tooltip: string;
    onClick: (
        data: {
            selectedRows: GridRowId[];
            allSelected: boolean;
            excluded: GridRowId[];
        },
        event: React.MouseEvent<HTMLButtonElement>,
    ) => void;
}

export interface Action {
    label: string;
    onClick: () => void;
}

// Base interface for common props
export interface DataToolbarBaseProps {
    labels?: DataToolbarLabels;
    sortableFields?: DataToolbarSortableFields[];
    totalRowCount?: number;
    loading?: boolean;
    refreshItems?: () => void;

    sortField?: string;
    refreshCallback?: () => void;
    autoRefresh?: boolean;
    refreshRate?: number;
    disableAutoRefreshOnUserInteraction?: boolean;
    userInteractionDebounceDelay?: number;
    initialState?: {
        autoRefreshEnabled?: boolean;
    };
    additionalComponent?: React.ReactNode;
    enableBulkActions?: boolean;
    bulkActions?: BulkOperationAction[];
    onBulkActionsClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    autoRefreshCallback?: (enabled: boolean) => void;
    maxRowsCount?: number;
}

// Props for DataGrid mode
export interface RingDataGridToolbarProps extends GridToolbarProps, DataToolbarBaseProps {
    allSelected: boolean;
    deselectedRowIds: Set<GridRowId>;
    excludedRowIds: Set<GridRowId>;
    rowSelectionModel: GridRowSelectionModel;
}

// Props for standalone mode
export interface StandaloneToolbarProps extends DataToolbarBaseProps {
    mode: 'standalone';

    selectedRows?: GridRowId[];
    onSelectionChange?: (selectedRows: GridRowId[]) => void;
    onScrollEnd?: (params: { visibleRowsCount: number }) => void;
    rowsCount?: number;
    allSelected?: boolean;
    deselectedRowIds?: Set<GridRowId>;
    excludedRowIds?: Set<GridRowId>;
}

// Union type for props
export type DataToolbarProps = RingDataGridToolbarProps | StandaloneToolbarProps;

export type ChangeSortEvent = SelectChangeEvent<string> | { target: { value: string } };

// Type guard to check if we're in standalone mode
function isStandaloneMode(props: DataToolbarProps): props is StandaloneToolbarProps {
    return (props as StandaloneToolbarProps).mode === 'standalone';
}

export const DataToolbar: React.FC<DataToolbarProps> = (props): React.ReactElement => {
    const {
        refreshItems,
        labels,
        sortableFields,
        sortField: sortFieldProps,
        additionalComponent,
        refreshCallback,
        autoRefresh = false,
        refreshRate = 60000,
        disableAutoRefreshOnUserInteraction = true,
        userInteractionDebounceDelay = 250,
        initialState,
        autoRefreshCallback,
        enableBulkActions = false,
        bulkActions = [],
        totalRowCount,
        maxRowsCount = Infinity,
        onBulkActionsClose,
        loading = false,
    } = props;

    const isStandalone = isStandaloneMode(props);
    const { dataViewState } = useDataViewContext();

    // Always call hooks - but handle the context conditionally
    let apiRef: any = null;
    let rootProps: any = null;
    let hasDataGridContext = true;

    try {
        apiRef = useGridApiContext();
        rootProps = useGridRootProps();
    } catch (error) {
        hasDataGridContext = false;
    }

    // Get selection data based on mode
    const allSelected = isStandalone ? props.allSelected || false : props.allSelected;

    const deselectedRowIds = isStandalone ? props.deselectedRowIds || new Set() : props.deselectedRowIds;

    const excludedRowIds = isStandalone ? props.excludedRowIds || new Set() : props.excludedRowIds;

    const [sortField, setSortField] = useState<string | null>(sortableFields?.[0]?.key || null);
    const [selectedRowsCount, setSelectedRowsCount] = useState<number>(0);
    const sortIconRef = useRef<HTMLButtonElement>(null);
    const refreshInterval = useRef<NodeJS.Timeout | null>(null);

    const [autoRefreshActive, setAutoRefreshActive] = useState(autoRefresh);
    const [autoRefreshManualEnabled, setAutoRefreshManualEnabled] = useState(
        initialState?.autoRefreshEnabled !== undefined ? initialState.autoRefreshEnabled : autoRefresh,
    );
    const [autoRefreshAllowedByCardState, setAutoRefreshAllowedByCardState] = useState(autoRefresh);

    const [networkOnline, setNetworkOnline] = useState(true);
    const [documentVisible, setDocumentVisible] = useState(true);

    const getSelectedRows = useCallback(() => {
        if (!isStandalone && hasDataGridContext && apiRef?.current) {
            return apiRef.current.getSelectedRows();
        }

        // Standalone mode
        const standaloneProps = props as StandaloneToolbarProps;

        return new Map((standaloneProps.selectedRows || []).map((id) => [id, {}]));
    }, [isStandalone, hasDataGridContext, apiRef, props]);

    const getRowsCount = useCallback(() => {
        if (!isStandalone && hasDataGridContext && apiRef?.current) {
            return apiRef.current.getRowsCount();
        }

        // Standalone mode
        const standaloneProps = props as StandaloneToolbarProps;

        return standaloneProps.rowsCount || 0;
    }, [isStandalone, hasDataGridContext, apiRef, props]);

    const scrollToTop = useCallback(() => {
        if (!isStandalone && hasDataGridContext && apiRef?.current) {
            apiRef.current.scroll({ top: 0 });
        }
        // In standalone mode, this would be handled by parent component
    }, [isStandalone, hasDataGridContext, apiRef]);

    const resetAutoRefreshInterval = useCallback((): void => {
        if (autoRefreshActive) {
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
            }

            refreshInterval.current = setInterval(() => {
                refreshItems?.();
            }, refreshRate);
        }
    }, [autoRefreshActive, refreshItems, refreshRate]);

    const handleRefreshItems = useCallback((): void => {
        scrollToTop();
        refreshItems?.();
    }, [scrollToTop, refreshItems]);

    useEffect((): ReturnType<EffectCallback> => {
        const handleNetworkChange = (): void => {
            setNetworkOnline(navigator.onLine);
        };

        const handleVisibilityChange = (): void => {
            const documentVisibilityState = document.visibilityState === 'visible';

            if (autoRefreshManualEnabled && autoRefresh && documentVisibilityState) {
                handleRefreshItems();
                resetAutoRefreshInterval();
            }

            setDocumentVisible(documentVisibilityState);
        };

        window.addEventListener('online', handleNetworkChange);
        window.addEventListener('offline', handleNetworkChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('online', handleNetworkChange);
            window.removeEventListener('offline', handleNetworkChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [autoRefreshManualEnabled, autoRefresh, handleRefreshItems, resetAutoRefreshInterval]);

    const [recentUserInteraction, setRecentUserInteraction] = useState(false);

    useEffect((): ReturnType<EffectCallback> => {
        let debounceTimeout: NodeJS.Timeout;

        const handleUserInteraction = (): void => {
            if (disableAutoRefreshOnUserInteraction) {
                setRecentUserInteraction(true);
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => setRecentUserInteraction(false), userInteractionDebounceDelay);
            }
        };

        window.addEventListener('mousemove', handleUserInteraction);
        window.addEventListener('touchmove', handleUserInteraction);
        window.addEventListener('scroll', handleUserInteraction);

        return () => {
            window.removeEventListener('mousemove', handleUserInteraction);
            window.removeEventListener('touchmove', handleUserInteraction);
            window.removeEventListener('scroll', handleUserInteraction);
            clearTimeout(debounceTimeout);
        };
    }, [userInteractionDebounceDelay, disableAutoRefreshOnUserInteraction]);

    useEffect(() => {
        if (autoRefresh && networkOnline && documentVisible && !recentUserInteraction) {
            setAutoRefreshAllowedByCardState(true);
        } else {
            setAutoRefreshAllowedByCardState(false);
        }
    }, [autoRefresh, networkOnline, documentVisible, recentUserInteraction]);

    // Handle DataGrid events only if we're in DataGrid context
    const handleRowsScrollEnd = useCallback(
        (params: GridRowScrollEndParams) => {
            if (rootProps?.onRowsScrollEnd) {
                const allElementsVisible = totalRowCount ? totalRowCount < params.visibleRowsCount : false;

                if (!allElementsVisible) {
                    resetAutoRefreshInterval();
                }
            }
        },
        [rootProps, totalRowCount, resetAutoRefreshInterval],
    );

    const handleRowSelectionChange = useCallback(
        (params: GridRowSelectionModel) => {
            if (allSelected && enableBulkActions) {
                setSelectedRowsCount(maxRowsCount - deselectedRowIds.size);

                return;
            }

            setSelectedRowsCount(params.ids.size);
        },
        [allSelected, enableBulkActions, maxRowsCount, deselectedRowIds],
    );

    // Use DataGrid event handlers only if we have the context
    if (!isStandalone && hasDataGridContext && apiRef) {
        useGridEvent(apiRef, 'rowsScrollEnd', handleRowsScrollEnd);
        useGridEvent(apiRef, 'rowSelectionChange', handleRowSelectionChange);
    }

    // Handle standalone mode selection changes
    useEffect(() => {
        if (isStandalone) {
            const standaloneProps = props as StandaloneToolbarProps;

            if (allSelected && enableBulkActions) {
                setSelectedRowsCount(maxRowsCount - deselectedRowIds.size);
            } else {
                setSelectedRowsCount(standaloneProps.selectedRows?.length || 0);
            }
        }
    }, [isStandalone, props, allSelected, enableBulkActions, maxRowsCount, deselectedRowIds]);

    const handleClickRefresh = (): void => {
        resetAutoRefreshInterval();
        handleRefreshItems();
        refreshCallback?.();
    };

    useEffect(() => {
        setAutoRefreshActive(
            autoRefresh && Boolean(refreshItems) && autoRefreshManualEnabled && autoRefreshAllowedByCardState,
        );
    }, [autoRefresh, refreshItems, autoRefreshManualEnabled, autoRefreshAllowedByCardState]);

    useEffect((): ReturnType<EffectCallback> => {
        if (autoRefreshActive) {
            refreshInterval.current = setInterval(() => {
                handleRefreshItems();
            }, refreshRate);
        }

        return () => {
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
                refreshInterval.current = null;
            }
        };
    }, [autoRefreshActive, handleRefreshItems, refreshRate]);

    const handleChangeSort = (event: ChangeSortEvent): void => {
        setSortField(event.target.value);
        const callback = sortableFields?.find((field) => field.key === event.target.value)?.onSortingChange;

        if (callback) {
            callback(event.target.value);
        }
    };

    useEffect(() => {
        if (sortFieldProps) {
            setSortField(sortFieldProps);
        }
    }, [sortFieldProps]);

    const handleActionClick = (action: BulkOperationAction, event: React.MouseEvent<HTMLButtonElement>): void => {
        const selectedRowEntries = Array.from(getSelectedRows());
        const selectedRows: GridRowId[] = [];
        selectedRowEntries.forEach((entry) => {
            if (Array.isArray(entry) && entry.length > 0) {
                selectedRows.push(entry[0] as GridRowId);
            }
        });
        const excluded = Array.from(excludedRowIds).map((key) => key as GridRowId);

        action.onClick(
            {
                selectedRows,
                allSelected,
                excluded,
            },
            event,
        );
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const renderBulkActions = (): React.JSX.Element => {
        return (
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} flexGrow={1}>
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                    {bulkActions.map((action, i) => (
                        <Tooltip
                            title={action.tooltip}
                            key={`${action.tooltip}-${i}`}
                            arrow={true}
                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: 'offset',
                                            options: {
                                                offset: [0, -12],
                                            },
                                        },
                                    ],
                                },
                            }}
                        >
                            <IconButton
                                onClick={(event): void => handleActionClick(action, event)}
                                style={{ cursor: 'pointer' }}
                                disabled={!getSelectedRows().size || selectedRowsCount > maxRowsCount}
                                sx={{
                                    marginLeft: '-2px',
                                }}
                            >
                                {action.icon}
                            </IconButton>
                        </Tooltip>
                    ))}
                </Stack>
                <Stack direction={'row'} alignItems={'baseline'} gap={3}>
                    <Stack direction={'row'} alignItems={'center'} gap={2}>
                        <RowSelectionSummary
                            selectedRowsCount={selectedRowsCount}
                            totalRowCount={totalRowCount}
                            maxRowsCount={maxRowsCount}
                        />
                        <IconButton onClick={(e): void => onBulkActionsClose?.(e)}>
                            <Close />
                        </IconButton>
                    </Stack>
                </Stack>
            </Stack>
        );
    };

    const renderSortableFields = (): React.JSX.Element => {
        if (isMobile) {
            return (
                <>
                    <IconButton ref={sortIconRef} sx={{ marginLeft: 'auto' }}>
                        <Sort />
                    </IconButton>
                    <ActionBox
                        actions={
                            sortableFields?.map(
                                (field: DataToolbarSortableFields) =>
                                    ({
                                        label: field.name,
                                        onClick: () => {
                                            handleChangeSort({ target: { value: field.key } } as ChangeSortEvent);
                                        },
                                    }) as Action,
                            ) || []
                        }
                        anchorEl={sortIconRef}
                        placement="bottom-end"
                        tooltipPlacement="right"
                    />
                </>
            );
        } else {
            return (
                <Select
                    sx={{
                        '&::before': {
                            display: 'none',
                        },
                        '&::after': {
                            display: 'none',
                        },
                        '& > .MuiSelect-select': {
                            padding: 0,
                        },
                        fieldset: {
                            border: 'none',
                        },
                        fontSize: theme.typography.caption.fontSize,
                    }}
                    value={sortField || ''}
                    onChange={handleChangeSort}
                    size={'small'}
                    IconComponent={KeyboardArrowDown}
                >
                    {sortableFields?.map((field) => (
                        <MenuItem key={field.key} value={field.key}>
                            {field.name}
                        </MenuItem>
                    ))}
                </Select>
            );
        }
    };

    const handleAutoRefreshIconClick = (enabled: boolean): void => {
        setAutoRefreshManualEnabled(enabled);
        autoRefreshCallback?.(enabled);
    };

    const renderToolbar = (): React.JSX.Element => {
        const autoRefreshIcon = autoRefreshManualEnabled ? (
            <IconButton title={labels?.disableAutoRefresh} onClick={(): void => handleAutoRefreshIconClick(false)}>
                <Sync />
            </IconButton>
        ) : (
            <IconButton title={labels?.enableAutoRefresh} onClick={(): void => handleAutoRefreshIconClick(true)}>
                <SyncDisabled />
            </IconButton>
        );

        return (
            <Stack
                direction={'row'}
                justifyContent={'space-between'}
                alignItems={'center'}
                flexGrow={1}
                sx={{ height: '40px' }}
            >
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                    {!dataViewState.isMobile && dataViewState.hasLeftSlot && (
                        <IconButton
                            data-testid="toggle-left-slot-button"
                            onClick={(): void => dataViewState.setLeftSlotOpen?.(!dataViewState.isLeftSlotOpen)}
                        >
                            {dataViewState.isLeftSlotOpen ? <FilterListOff /> : <FilterList />}
                        </IconButton>
                    )}
                    <Typography variant={'caption'}>
                        {labels?.results}: {totalRowCount || getRowsCount()}
                    </Typography>
                </Stack>
                {sortableFields?.length && renderSortableFields()}
                <Stack direction={'row'} gap={1}>
                    {autoRefresh && autoRefreshIcon}
                    {refreshItems && (
                        <IconButton title={labels?.refresh} onClick={handleClickRefresh} disabled={loading}>
                            <Refresh />
                        </IconButton>
                    )}
                    {additionalComponent}
                </Stack>
            </Stack>
        );
    };

    return (
        <div
            style={{
                borderBottom: `1px solid ${basicGrey100}`,
                display: 'flex',
                flexWrap: 'nowrap',
                alignContent: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                height: '40px',
                // ...standaloneStyle,
                padding: theme.spacing(0, 1, 0, 1),
                position: 'relative',
                ...(enableBulkActions
                    ? {
                          backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
                      }
                    : {}),
            }}
        >
            {enableBulkActions ? renderBulkActions() : renderToolbar()}
            {isStandalone && loading && (
                <LinearProgress
                    style={{
                        position: 'absolute',
                        bottom: -5, // Adjusted to fit the toolbar height
                        zIndex: 1000, // Ensure it appears above other content
                        left: 0,
                        right: 0,
                    }}
                />
            )}
        </div>
    );
};

interface RowSelectionSummaryProps {
    selectedRowsCount: number;
    totalRowCount?: number;
    maxRowsCount: number;
}

const RowSelectionSummary: React.FC<RowSelectionSummaryProps> = ({
    selectedRowsCount,
    maxRowsCount,
    totalRowCount,
}) => {
    const counter =
        selectedRowsCount <= maxRowsCount ? (
            selectedRowsCount
        ) : (
            <Tooltip title="Too many selected elements">
                <Typography component="span" variant={'caption'} color="error" sx={{ fontWeight: 'bold' }}>
                    {selectedRowsCount}
                </Typography>
            </Tooltip>
        );
    const denominator = totalRowCount ? (maxRowsCount < totalRowCount ? maxRowsCount : totalRowCount) : '-';

    return (
        <Typography variant={'caption'}>
            {counter}/{denominator}
        </Typography>
    );
};

// Export both the universal component and the original for backward compatibility
export const RingDataGridToolbar = DataToolbar;
