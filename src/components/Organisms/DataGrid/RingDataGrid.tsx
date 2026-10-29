import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LinearProgress, useTheme } from '@mui/material';
import { RingDataGridToolbar } from './RingDataGridToolbar.js';
import { CustomGridRow, useSpacer } from '../../internal/spacer.js';
import { BulkOperationAction } from '../MultimediaGrid/DataToolbar.js';
import { canSelectRow, CustomNoRowsOverlay, getSpacerAndNonSpacerRowIds } from './helpers.js';
import { Placeholder, PlaceholderStateLabels, PlaceholderVariant } from '../../Molecules/Placeholder/Placeholder.js';
import { CommonLanguages } from '../../../helpers/commonTypes.js';
import {
    GridRowId,
    DataGridPro as DataGrid,
    DataGridProProps,
    GridApiPro,
    GridCallbackDetails,
    GridInitialState,
    GridRowModel,
    GridRowParams,
    GridRowProps,
    GridRowSelectionModel,
    MuiEvent,
    useGridApiRef,
    GRID_CHECKBOX_SELECTION_COL_DEF,
    GridOverlay,
} from '@mui/x-data-grid-pro';
import { useBottomBarContext } from '../../internal/BottomBar/BottomBarContext.js';
import { FilterChip, FilterChipGroup } from '../../internal/FilterChipGroup.js';
import { DataGridTestIdProvider, useRowDataTestId } from './dataGridTestIdContext.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface RingGridInitialState extends GridInitialState {
    autoRefreshEnabled?: boolean;
}

export interface RingDataGridToolbarLabels {
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

export interface RingDataGridToolbarSortField {
    /**
     * Name of the field
     */
    name: string;

    /**
     * Key of the field
     */
    key: string;

    /**
     * Callback function when the field is selected
     */
    onSortingChange: (key: string) => void;
}

export interface BulkOperationCallbackParams {
    /**
     * Selected rows
     */
    selectedRows: GridRowId[];

    /**
     * If all rows are selected
     */
    allSelected: boolean;
    /**
     * deselected items from standard maxSelected range
     */
    excluded: GridRowId[];
}

export interface RingDataGridProps extends DataGridProProps {
    /**
     * Custom toolbar for the data grid with actions and filters
     */
    showRingToolbar?: boolean;

    /**
     * The labels used within the component
     */
    labels?: RingDataGridToolbarLabels;

    /**
     * The fields that can be sorted
     */
    sortableFields?: RingDataGridToolbarSortField[];

    /**
     * Key of the field the toolbar sorts by; the toolbar defaults to the first of `sortableFields`
     * and follows this prop when set.
     */
    sortField?: string;

    /**
     * Function that is called on refresh icon click and auto refresh
     */
    refreshItems?: () => void;

    /**
     * Enables autoRefresh, (default: false)
     */
    autoRefresh?: boolean;

    /**
     * Refresh rate in milliseconds, (default: 60000)
     */
    refreshRate?: number;

    /**
     * Callback function when refresh icon is clicked (e.g. for analytics)
     */
    refreshCallback?: () => void;

    /**
     * Callback function when auto refresh icon was clicked
     */
    autoRefreshCallback?: (autoRefreshMode: boolean) => void;

    /**
     * Disable auto refresh on user interaction (mouseover, touchmove, scroll) (default: true)
     */
    disableAutoRefreshOnUserInteraction?: boolean;

    /**
     * Debounce delay time in milliseconds on user events which disable auto refresh - mouseover, touchmove and scroll (default: 250)
     */
    userInteractionDebounceDelay?: number;

    /**
     * Initial state for the grid, extends MUI GridInitialState with autoRefreshEnabled for auto refresh button initial state
     */
    initialState?: RingGridInitialState;

    /**
     * Additional component to be rendered in the toolbar (right side, after the refresh icon)
     */
    additionalComponent?: React.ReactNode;

    /**
     * Enable bulk actions
     */
    enableBulkActions?: boolean;

    /**
     * Bulk operation actions
     */
    bulkActions?: Array<BulkOperationAction>;

    /**
     * Callback function when bulk actions are closed
     */
    onBulkActionsClose?: React.MouseEventHandler;

    /**
     * Total row count for the ring toolbar
     */
    totalRowCount: number;

    /**
     * Selected rows max count for the ring toolbar
     */
    maxSelectedRowsCount?: number;
    /**
     * To show error placeholder when rows are empty set to true, otherwise it will show no results placeholder
     * @default false
     */
    error?: boolean;
    /**
     * Api reference for the grid, if you need to manipulate grid api you should pass it
     * otherwise it will be generated and not accessible outside the component
     */
    apiRef?: React.RefObject<GridApiPro | null>;
    /**
     * Removes select all checkbox from the toolbar
     * @default false
     */
    disableSelectAllCheckbox?: boolean;
    /**
     * Clear selection when list refreshes
     * @default true
     */
    clearSelectionOnRefresh?: boolean;

    /**
     * Filter chips to be displayed in the FilterChipGroup
     */

    filterChips?: {
        chips: FilterChip[];
        onDeleteAll?: () => void | Promise<void>;
    };

    /**
     * Labels for the placeholders rendered when the grid is in an error or empty state.
     * When omitted, the Placeholder component falls back to its default localized labels.
     */
    placeholderLabels?: PlaceholderStateLabels;

    /**
     * Optional suffix added to the grid's `data-testid` attributes. The grid root becomes
     * `ring-datagrid[-<suffix>]` and each row `ring-datagrid[-<suffix>]-item-<rowId>`.
     */
    dataTestIdSuffix?: string;

    /**
     * Overrides the generated `data-testid` per row; return `undefined` to keep the default
     * `ring-datagrid[-<suffix>]-item-<rowId>`. Rows may instead carry `dataTestId` or
     * `itemDataTestIdSuffix`.
     */
    getRowDataTestId?: (row: GridRowModel, index: number) => string | undefined;
}

export function RingDataGrid(props: RingDataGridProps): React.JSX.Element {
    const {
        showRingToolbar,
        enableBulkActions,
        totalRowCount,
        slots,
        getEstimatedRowHeight,
        getRowHeight,
        error = false,
        maxSelectedRowsCount = 5000,
        initialState,
        clearSelectionOnRefresh = true,
        disableSelectAllCheckbox = false,
        filterChips,
        placeholderLabels,
        dataTestIdSuffix,
        getRowDataTestId,
        ...restProps
    } = props;

    const dataTestId = useRingDataTestId('DataGrid', dataTestIdSuffix);

    /*
     * Per-row test ids come from a `slots.row` wrapper, since `slotProps.row` is static and cannot
     * read each row's id. It delegates to the consumer's own row slot or to `CustomGridRow`, never
     * to MUI's `GridRow`, which would render spacer rows as ordinary rows.
     */
    const RowWithDataTestId = useMemo(() => {
        const BaseRow = (slots?.row ?? CustomGridRow) as React.ComponentType<GridRowProps>;

        // The ids come from context: closing over an inline callback would make a new row type and remount every row.
        function RingDataGridRow(rowProps: GridRowProps): React.JSX.Element {
            const rowDataTestId = useRowDataTestId(rowProps.row, rowProps.rowId, rowProps.index);

            return <BaseRow {...rowProps} data-testid={rowDataTestId} />;
        }

        return RingDataGridRow;
    }, [slots?.row]);

    const testIdContext = useMemo(
        () => ({ suffix: dataTestIdSuffix, getRowDataTestId }),
        [dataTestIdSuffix, getRowDataTestId],
    );

    const { setBottomBarState } = useBottomBarContext();
    const gridProps = { ...restProps, ...useSpacer({ slots, getEstimatedRowHeight, getRowHeight }) };
    const apiRef = (gridProps?.apiRef ? gridProps.apiRef : useGridApiRef()) as React.RefObject<GridApiPro | null>;
    const theme = useTheme();
    const language = theme?.locale || CommonLanguages.enUS;

    const [deselectedRowIds, setDeselectedRowIds] = useState<Set<GridRowId>>(new Set());
    const [excludedRowIds, setExcludedRowIds] = useState<Set<GridRowId>>(new Set());
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set(),
    });
    const [allSelected, setAllSelected] = useState(false);

    const handleRowSelectionStateChange = (newSelection: GridRowSelectionModel) => {
        setRowSelectionModel(newSelection);
    };

    useEffect(() => {
        setBottomBarState({
            isSelectionModeEnabled: gridProps.checkboxSelection || enableBulkActions,
        });
    }, [gridProps.checkboxSelection, enableBulkActions]);

    useEffect(() => {
        if (apiRef) {
            setBottomBarState({ apiRef });
        }
    }, [apiRef]);

    useEffect(() => {
        setBottomBarState({ allSelected });
    }, [allSelected]);

    useEffect(() => {
        const items = Array.from(apiRef?.current?.getRowModels().values() || []);

        if (gridProps.rowSelectionModel !== undefined) {
            setBottomBarState({ rowSelectionModel: gridProps.rowSelectionModel, items });
        } else {
            setBottomBarState({ rowSelectionModel, items });
        }
    }, [rowSelectionModel, gridProps.rowSelectionModel]);

    if (enableBulkActions && gridProps.paginationMode === 'server' && !gridProps.rowCount) {
        console.warn(
            'RingDataGrid: You set paginationMode to server, bulk actions requires to pass rowCount prop to work correctly.',
        );
    }

    const onRowClick = useCallback(
        (params: GridRowParams, event: MuiEvent<React.MouseEvent<HTMLElement>>, details: GridCallbackDetails): void => {
            if (!enableBulkActions && gridProps.onRowClick) {
                gridProps.onRowClick(params, event, details);
            }
        },
        [enableBulkActions, gridProps.onRowClick],
    );

    const clearSelection = useCallback((): void => {
        apiRef.current?.selectRows([], false, true);
        setAllSelected(false);
        handleRowSelectionStateChange({ type: 'include', ids: new Set() });
        setDeselectedRowIds(new Set());
        setExcludedRowIds(new Set());
    }, [apiRef]);

    const handleCountChange = useCallback(
        (rowCount: number): void => {
            if (gridProps?.onRowCountChange) {
                gridProps.onRowCountChange(rowCount);
            }

            if (!apiRef.current) {
                return;
            }

            const allRows = apiRef.current.getRowModels();
            const { nonSpacerRowIds: nonSpacerRows } = getSpacerAndNonSpacerRowIds(allRows);
            const currentSelection = apiRef.current.getSelectedRows();
            const isMaxSelectionLimitReached = currentSelection.size + deselectedRowIds.size === maxSelectedRowsCount;

            if (isMaxSelectionLimitReached || !(allSelected && enableBulkActions)) {
                return;
            }

            const newSelection = new Set<GridRowId>();
            nonSpacerRows.forEach((row, id) => {
                if (currentSelection.size + deselectedRowIds.size + newSelection.size === maxSelectedRowsCount) {
                    return;
                }

                if (!currentSelection.has(id) && !deselectedRowIds.has(id)) {
                    newSelection.add(id);
                }
            });

            apiRef.current.selectRows(Array.from(newSelection));
        },
        [gridProps.onRowCountChange, apiRef, deselectedRowIds, maxSelectedRowsCount, allSelected, enableBulkActions],
    );

    const handleRowSelectionModelChange = useCallback(
        (newSelection: GridRowSelectionModel, details: GridCallbackDetails): void => {
            if (!apiRef.current) {
                return;
            }

            const allRows = apiRef.current.getRowModels();
            const { spacerRowIds, nonSpacerRowIds } = getSpacerAndNonSpacerRowIds(allRows);
            const selectedIds = new Set<GridRowId>(newSelection.ids);
            const filteredSelectedIds = new Set<GridRowId>(
                Array.from(selectedIds).filter((id) => !spacerRowIds.has(String(id))),
            );

            if (allSelected && enableBulkActions) {
                const newDeselectedRowIds = new Set<GridRowId>();
                const newExcludedRowIds = new Set<GridRowId>();

                Array.from(nonSpacerRowIds).forEach((id, index) => {
                    if (!filteredSelectedIds.has(id)) {
                        if (index + 1 <= maxSelectedRowsCount) {
                            newExcludedRowIds.add(id);
                        }

                        if (filteredSelectedIds.size + newDeselectedRowIds.size < maxSelectedRowsCount) {
                            newDeselectedRowIds.add(id);
                        }
                    }
                });

                deselectedRowIds.forEach((id) => {
                    if (!nonSpacerRowIds.has(id)) {
                        newDeselectedRowIds.add(id);
                    }
                });

                setDeselectedRowIds(newDeselectedRowIds);
                setExcludedRowIds(newExcludedRowIds);
            }

            handleRowSelectionStateChange({ type: 'include', ids: filteredSelectedIds });
        },
        [apiRef, allSelected, enableBulkActions, maxSelectedRowsCount, deselectedRowIds],
    );

    useEffect(() => {
        if (!apiRef.current) {
            return;
        }

        const currentApiRef = apiRef.current;

        const handleHeaderCheckboxChange = ({ value }: { value: boolean }): void => {
            if (enableBulkActions) {
                const allRows = currentApiRef.getRowModels();
                const { nonSpacerRowIds } = getSpacerAndNonSpacerRowIds(allRows);

                if (value) {
                    setAllSelected(true);
                    setDeselectedRowIds(new Set());
                    const selectedRows = new Set<GridRowId>(Array.from(nonSpacerRowIds).slice(0, totalRowCount));
                    handleRowSelectionStateChange({ type: 'include', ids: selectedRows });
                }

                if (!value && clearSelectionOnRefresh) {
                    clearSelection();
                }
            }
        };

        const unsubscribe = currentApiRef.subscribeEvent('headerSelectionCheckboxChange', handleHeaderCheckboxChange);

        return () => {
            unsubscribe();
        };
    }, [apiRef, clearSelection, totalRowCount, enableBulkActions]);

    if (enableBulkActions) {
        gridProps.checkboxSelection = true;
    }

    const getGridPropsAffectingBulkActions = () => {
        const gridPropsAffectingBulkActions = {
            onRowSelectionModelChange: handleRowSelectionModelChange,
            rowSelectionModel: gridProps?.rowSelectionModel || rowSelectionModel,
        };

        if (gridProps?.onRowSelectionModelChange) {
            if (enableBulkActions) {
                console.warn(
                    'Custom onRowSelectionModelChange affects Bulk Actions - the default behavior will' +
                        ' be overridden and bulk actions can not work corectly.',
                );
            }

            gridPropsAffectingBulkActions.onRowSelectionModelChange = gridProps.onRowSelectionModelChange;
        }

        if (gridProps?.rowSelectionModel) {
            if (enableBulkActions) {
                console.warn(
                    'Custom rowSelectionModel affects Bulk Actions - the default behavior will be ' +
                        'overridden and bulk actions can not work corectly.',
                );
            }

            gridPropsAffectingBulkActions.rowSelectionModel = gridProps.rowSelectionModel || rowSelectionModel;
        }

        return gridPropsAffectingBulkActions;
    };

    const columns = useMemo(() => {
        if (disableSelectAllCheckbox) {
            return [
                {
                    ...GRID_CHECKBOX_SELECTION_COL_DEF,
                    renderHeader: () => <></>,
                },
                ...gridProps.columns,
            ];
        }

        return gridProps.columns;
    }, [disableSelectAllCheckbox, gridProps.columns]);

    return (
        <DataGridTestIdProvider value={testIdContext}>
            <FilterChipGroup chips={filterChips?.chips} onDeleteAll={filterChips?.onDeleteAll} />
            <DataGrid
                {...gridProps}
                columns={columns}
                apiRef={apiRef}
                isRowSelectable={canSelectRow({
                    allSelected,
                    enableBulkActions,
                    rowSelectionModel: gridProps.rowSelectionModel || rowSelectionModel,
                    maxRowsCount: maxSelectedRowsCount,
                    deselectedRowIds,
                    apiRef,
                })}
                {...getGridPropsAffectingBulkActions()}
                onRowCountChange={handleCountChange}
                sx={{
                    '.MuiDataGrid-overlayWrapperInner': {
                        height: '8px !important',
                    },
                    ...(gridProps?.sx ? gridProps.sx : {}),
                }}
                onRowClick={onRowClick}
                initialState={initialState}
                keepNonExistentRowsSelected={true}
                showToolbar={showRingToolbar}
                slots={{
                    noResultsOverlay: () => (
                        <Placeholder variant={PlaceholderVariant.NOT_FOUND} labels={placeholderLabels?.empty} />
                    ),
                    noRowsOverlay: () =>
                        CustomNoRowsOverlay(error, language, props?.refreshCallback, placeholderLabels),
                    loadingOverlay: () => (
                        <GridOverlay sx={{ justifyContent: 'flex-start' }}>
                            <div role="row" style={{ width: '100%' }}>
                                <div role="gridcell" style={{ width: '100%' }}>
                                    <LinearProgress aria-label="Loading" sx={{ width: '100%' }} />
                                </div>
                            </div>
                        </GridOverlay>
                    ),
                    ...(gridProps.slots || {}),
                    row: RowWithDataTestId,
                    toolbar: showRingToolbar ? RingDataGridToolbar : undefined,
                }}
                slotProps={{
                    ...(gridProps.slotProps || {}),
                    /*
                     * DataGridPro does not forward unknown props to its root element, so the
                     * grid's own test id has to go through the `root` slot.
                     */
                    root: {
                        'data-testid': dataTestId,
                        ...(gridProps.slotProps?.root || {}),
                    },
                    toolbar: showRingToolbar
                        ? {
                              dataTestIdSuffix,
                              refreshItems: props?.refreshItems,
                              labels: props?.labels,
                              sortableFields: props?.sortableFields,
                              sortField: props?.sortField,
                              additionalComponent: props?.additionalComponent,
                              refreshCallback: props?.refreshCallback,
                              autoRefresh: props?.autoRefresh,
                              refreshRate: props?.refreshRate,
                              disableAutoRefreshOnUserInteraction: props?.disableAutoRefreshOnUserInteraction,
                              userInteractionDebounceDelay: props?.userInteractionDebounceDelay,
                              initialState: props?.initialState,
                              autoRefreshCallback: props?.autoRefreshCallback,
                              enableBulkActions: props?.enableBulkActions,
                              bulkActions: props?.bulkActions,
                              totalRowCount,
                              maxRowsCount: maxSelectedRowsCount,
                              onBulkActionsClose: (e): void => {
                                  clearSelection();
                                  props?.onBulkActionsClose?.(e);
                              },
                              allSelected,
                              deselectedRowIds,
                              excludedRowIds,
                          }
                        : undefined,
                }}
            />
        </DataGridTestIdProvider>
    );
}

export type { FilterChip } from '../../internal/FilterChipGroup.js';
