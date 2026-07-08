import { Box } from '@mui/material';
import { useBottomBarContext, BottomBarContextState } from './BottomBarContext.js';
import React, { useEffect, useState, RefObject, useCallback } from 'react';
import { GridColDef, GridRowId } from '@mui/x-data-grid';
import { GridApiPro, GridRowSelectionModel } from '@mui/x-data-grid-pro';
import { BottomBarSlotProps } from './BottomBarContainer.js';
import { ChipItem } from './ChipItem.js';
import { ImageBoxItem } from './ImageBoxItem.js';
import { MediaGridApi } from '../../Organisms/MultimediaGrid/gridApi.js';

interface RowData {
    id: GridRowId;
    [key: string]: unknown;
}

// Type for ComboCell data structure (from renderComboCell)
interface ComboCellValue {
    label: string;
    imageUrl?: string;
}

// Type guard to check if value is ComboCellValue
function isComboCellValue(value: unknown): value is ComboCellValue {
    return (
        typeof value === 'object' &&
        value !== null &&
        'label' in value &&
        typeof (value as ComboCellValue).label === 'string'
    );
}

// Type guard to check if apiRef is MediaGridApi
function isMediaGridApi(apiRef: BottomBarContextState['apiRef']): apiRef is MediaGridApi {
    return (apiRef as MediaGridApi)?.current?.mode === 'media';
}

// Type guard to check if apiRef is DataGrid (MUI)
function isDataGridApi(apiRef: BottomBarContextState['apiRef']): apiRef is RefObject<GridApiPro | null> {
    return !isMediaGridApi(apiRef) && apiRef !== undefined;
}

function BottomBar({ slotProps }: { slotProps?: BottomBarSlotProps }): React.JSX.Element | null {
    const { bottomBarState } = useBottomBarContext();
    const [selectedRowsData, setSelectedRowsData] = useState<RowData[]>([]);
    const [columns, setColumns] = useState<GridColDef[]>([]);
    const firstColumn = columns[0];
    const isRingDataGrid = isDataGridApi(bottomBarState?.apiRef);
    const isOnClickProvided = typeof slotProps?.onClick === 'function';

    const handleItemClick = useCallback(
        (item: RowData) => {
            if (isOnClickProvided) {
                slotProps?.onClick?.(item, bottomBarState.apiRef);
            }
        },
        [isOnClickProvided, slotProps?.onClick, bottomBarState.apiRef],
    );

    useEffect(() => {
        if (!isRingDataGrid) {
            return;
        }

        if (isDataGridApi(bottomBarState.apiRef) && bottomBarState.apiRef.current) {
            const columns: GridColDef[] = (bottomBarState.apiRef.current.getVisibleColumns?.() || []).filter(
                (column: GridColDef) => column.field !== 'id' && column.field !== '__check__',
            );

            setColumns(columns);
        }
    }, [isRingDataGrid, bottomBarState.apiRef]);

    useEffect(() => {
        const selectedIds: GridRowId[] = Array.from(bottomBarState.rowSelectionModel?.ids ?? []);
        const allRows = bottomBarState.items || [];

        const existingDataMap = new Map(selectedRowsData.map((row) => [row.id, row]));
        const allRowsMap = new Map(allRows.map((row) => [row.id, row]));

        const orderedData = selectedIds
            .map((id: GridRowId) => {
                const existingRow = existingDataMap.get(id);

                if (existingRow) {
                    return existingRow;
                }

                const newRow = allRowsMap.get(id);

                return newRow;
            })
            .filter((row: RowData | undefined) => row !== undefined) as RowData[];

        setSelectedRowsData(orderedData);
    }, [bottomBarState.rowSelectionModel, bottomBarState.items]);

    const fieldMap = isRingDataGrid
        ? {
              id: 'id',
              name: 'name',
              image: 'image',
              ...(slotProps?.fieldMap || {}),
          }
        : {
              id: 'id',
              name: 'title',
              image: 'image',
              ...(slotProps?.fieldMap || {}),
          };

    if (!bottomBarState.isSelectionModeEnabled || bottomBarState.allSelected) {
        return null;
    }

    if (!slotProps?.fieldMap && firstColumn && isRingDataGrid) {
        const firstRowData = selectedRowsData?.[0];
        const fieldValue = firstRowData?.[firstColumn.field];

        if (firstColumn?.renderCell && isComboCellValue(fieldValue)) {
            fieldMap.name = `${firstColumn.field}.label`;
            fieldMap.image = `${firstColumn.field}.imageUrl`;
        } else if (firstColumn?.field) {
            fieldMap.name = firstColumn.field;
        } else {
            console.error('BottomBar: Unable to determine fieldMap for name. Please pass fieldMap prop to BottomBar');

            return null;
        }
    }

    const removeElement = (id: GridRowId): void => {
        const gridRowIds = Array.from(bottomBarState.rowSelectionModel?.ids || []).filter(
            (item: GridRowId) => item !== id,
        );
        const newSelection: GridRowSelectionModel = { type: 'include', ids: new Set(gridRowIds) };

        if (isDataGridApi(bottomBarState.apiRef) && bottomBarState.apiRef.current) {
            bottomBarState.apiRef.current.setRowSelectionModel(newSelection);
        } else if (isMediaGridApi(bottomBarState.apiRef) && bottomBarState.apiRef.current) {
            bottomBarState.apiRef.current.setSelectionModel(newSelection);
        }

        setSelectedRowsData(
            gridRowIds
                .map((itemId: GridRowId) => selectedRowsData.find((row) => row.id === itemId))
                .filter((row): row is RowData => Boolean(row)),
        );
    };

    if (!isRingDataGrid) {
        return (
            <Box color="primary.contrastText" display="flex" overflow="scroll" p={2} gap={1}>
                {selectedRowsData.map((selectedRow: RowData) => (
                    <ImageBoxItem
                        key={selectedRow.id}
                        selectedRow={selectedRow}
                        fieldMap={fieldMap}
                        onRemove={removeElement}
                        getTooltip={slotProps?.getTooltip}
                        onClick={isOnClickProvided ? handleItemClick : undefined}
                    />
                ))}
            </Box>
        );
    }

    return (
        <Box color="primary.contrastText" display="flex" overflow="scroll" p={2}>
            {selectedRowsData?.map((selectedRow: RowData) => (
                <ChipItem
                    key={selectedRow.id}
                    selectedRow={selectedRow}
                    fieldMap={fieldMap}
                    onRemove={removeElement}
                    slotProps={slotProps}
                    getTooltip={slotProps?.getTooltip}
                    onClick={isOnClickProvided ? handleItemClick : undefined}
                />
            ))}
        </Box>
    );
}

export default BottomBar;
