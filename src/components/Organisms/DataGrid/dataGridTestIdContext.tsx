import { createContext, useContext } from 'react';
import { GridRowId, GridRowModel } from '@mui/x-data-grid-pro';
import { buildRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { resolveItemDataTestId } from '../../../helpers/dataTestId.js';

interface DataGridTestIdContextValue {
    suffix?: string;
    getRowDataTestId?: (row: GridRowModel, index: number) => string | undefined;
}

/**
 * Carries the grid's `dataTestIdSuffix` and `getRowDataTestId` down to rows and cell renderers. MUI calls
 * `renderCell` outside the React tree position of `RingDataGrid`'s own props, and the row slot cannot close
 * over them because a new row component type on every render remounts every row and cell.
 */
const DataGridTestIdContext = createContext<DataGridTestIdContextValue>({});

export const DataGridTestIdProvider = DataGridTestIdContext.Provider;

/**
 * Resolves a row's `data-testid` from `getRowDataTestId`, the row's own `dataTestId` /
 * `itemDataTestIdSuffix`, or `ring-datagrid[-<suffix>]-item-<rowId>`.
 */
export function useRowDataTestId(row: GridRowModel, rowId: GridRowId, index: number): string {
    const { suffix, getRowDataTestId } = useContext(DataGridTestIdContext);

    return resolveItemDataTestId({
        componentName: 'DataGrid',
        listSuffix: suffix,
        itemId: rowId,
        index,
        item: row,
        override: getRowDataTestId?.(row, index),
    });
}

/**
 * Builds `ring-datagrid[-<suffix>]-item-<rowId>-<field>[-<part>]` for a cell's contents,
 * so a control in a cell is addressable by the row it belongs to.
 */
export function useCellDataTestId(rowId: string | number, field: string, part?: string): string {
    const { suffix } = useContext(DataGridTestIdContext);

    return buildRingDataTestId('DataGrid', suffix, 'item', rowId, field, part);
}
