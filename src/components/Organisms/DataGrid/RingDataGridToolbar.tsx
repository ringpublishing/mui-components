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
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import { basicGrey100 } from '../../../theme/theme.js';
import { BulkOperationAction, RingDataGridProps, RingDataGridToolbarSortField } from './RingDataGrid.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { Action } from '../../../types.js';
import { useDataViewContext } from '../../Templates/DataView/DataViewContext.js';

type headerSelectionCheckboxChangeCustomParams = { value: boolean };
declare module '@mui/x-data-grid' {
    interface GridEventLookup {
        headerSelectionCheckboxChangeCustom: { params: headerSelectionCheckboxChangeCustomParams };
    }
}

declare module '@mui/x-data-grid-pro' {
    /* eslint-disable */
    interface ToolbarPropsOverrides extends RingDataGridToolbarProps {}
}
export interface RingDataGridToolbarProps
    extends
        GridToolbarProps,
        Pick<
            RingDataGridProps,
            | 'labels'
            | 'sortableFields'
            | 'sortField'
            | 'refreshCallback'
            | 'refreshItems'
            | 'autoRefresh'
            | 'refreshRate'
            | 'disableAutoRefreshOnUserInteraction'
            | 'userInteractionDebounceDelay'
            | 'initialState'
            | 'additionalComponent'
            | 'enableBulkActions'
            | 'bulkActions'
            | 'totalRowCount'
            | 'onBulkActionsClose'
            | 'autoRefreshCallback'
        > {
    allSelected: boolean;
    deselectedRowIds: Set<GridRowId>;
    excludedRowIds: Set<GridRowId>;
    rowSelectionModel: GridRowSelectionModel;
    maxRowsCount: number;
}
/* eslint-enable */

export type ChangeSortEvent = SelectChangeEvent<string> | { target: { value: string } };

export const RingDataGridToolbar: React.FC<RingDataGridToolbarProps> = (props): React.ReactElement => {
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
        allSelected,
        deselectedRowIds,
        excludedRowIds,
    } = props;

    // Remove warnings in future release
    if ((props as { fetchItems?: () => void }).fetchItems !== undefined) {
        console.error('fetchItems is deprecated, use refreshItems instead');
    }

    if ((props as { onClickRefresh?: () => void }).onClickRefresh !== undefined) {
        console.error('onClickRefresh is deprecated, use refreshCallback instead');
    }

    const [sortField, setSortField] = useState<string | null>(sortableFields?.[0].key || null);
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
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

    const { dataViewState } = useDataViewContext();

    const resetAutoRefreshInterval = useCallback((): void => {
        if (autoRefreshActive) {
            clearInterval(refreshInterval.current as NodeJS.Timeout);
            refreshInterval.current = setInterval(() => {
                refreshItems?.();
            }, refreshRate);
        }
    }, [autoRefreshActive, refreshItems, refreshRate]);

    const handleRefreshItems = useCallback((): void => {
        apiRef.current.scroll({ top: 0 });
        refreshItems?.();
    }, [apiRef, refreshItems]);

    useEffect((): ReturnType<EffectCallback> => {
        const handleNetworkChange = (): void => {
            setNetworkOnline(navigator.onLine);
        };

        const handleVisibilityChange = (): void => {
            const documentVisibilityState = document.visibilityState === 'visible';

            // if document visibility state has changed and is now visible, fetch items and reset auto refresh interval
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
    }, [autoRefresh, networkOnline, documentVisible, recentUserInteraction, disableAutoRefreshOnUserInteraction]);

    useGridEvent(apiRef, 'rowsScrollEnd', (params: GridRowScrollEndParams) => {
        if (rootProps.onRowsScrollEnd) {
            // if all elements visible auto refresh should be enabled
            // reset auto refresh timeout when user scrolls to end and more data is fetched
            const allElementsVisible = totalRowCount < params.visibleRowsCount;

            if (!allElementsVisible) {
                resetAutoRefreshInterval();
            }
        }
    });

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

            return () => {
                clearInterval(refreshInterval.current as NodeJS.Timeout);
                refreshInterval.current = null;
            };
        }
    }, [autoRefreshActive, handleRefreshItems, refreshRate]);

    useGridEvent(apiRef, 'rowSelectionChange', (selectedRows) => {
        if (allSelected && enableBulkActions) {
            const selectedRowCount = totalRowCount > maxRowsCount ? maxRowsCount : totalRowCount;
            setSelectedRowsCount(selectedRowCount - deselectedRowIds.size);

            return;
        }

        setSelectedRowsCount(selectedRows.ids.size);
    });

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
        const selectedRows = Array.from(apiRef.current.getSelectedRows()).map(([key]) => key);
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
                                disabled={!apiRef.current.getSelectedRows().size || selectedRowsCount > maxRowsCount}
                                sx={{
                                    // aligns the button with the middle of the checkbox below
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
                        <RowSelectionSummary selectedRowsCount={selectedRowsCount} maxRowsCount={maxRowsCount} />
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
                                (field: RingDataGridToolbarSortField) =>
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
                        fontSize: theme.typography.caption.fontSize,
                    }}
                    variant={'standard'}
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    value={sortField!}
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
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} flexGrow={1}>
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                    {!dataViewState.isMobile && dataViewState.hasLeftSlot && dataViewState.showLeftSlotToggleButton && (
                        <IconButton
                            data-testid="toggle-left-slot-button"
                            onClick={(): void => dataViewState.setLeftSlotOpen?.(!dataViewState.isLeftSlotOpen)}
                        >
                            {dataViewState.isLeftSlotOpen ? <FilterListOff /> : <FilterList />}
                        </IconButton>
                    )}
                    <Typography variant={'caption'}>
                        {labels?.results}: {totalRowCount || apiRef.current.getRowsCount()}
                    </Typography>
                </Stack>
                {sortableFields?.length && renderSortableFields()}
                <Stack direction={'row'} gap={1}>
                    {autoRefresh && autoRefreshIcon}
                    {refreshItems && (
                        <IconButton title={labels?.refresh} onClick={handleClickRefresh}>
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
                padding: theme.spacing(0, 1, 0, 1),
                ...(enableBulkActions ? { backgroundColor: theme.palette.components.appBar.defaultFill } : {}),
            }}
        >
            {enableBulkActions ? renderBulkActions() : renderToolbar()}
        </div>
    );
};

interface RowSelectionSummaryProps {
    selectedRowsCount: number;
    maxRowsCount: number;
}

const RowSelectionSummary: React.FC<RowSelectionSummaryProps> = ({ selectedRowsCount, maxRowsCount }) => {
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
    const denominator = maxRowsCount || '-';

    return (
        <Typography variant={'caption'}>
            {counter}/{denominator}
        </Typography>
    );
};
