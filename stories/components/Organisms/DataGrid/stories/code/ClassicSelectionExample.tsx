import React, { useState } from 'react';
import { GridRowSelectionModel } from '@mui/x-data-grid-pro';
import { RingDataGrid } from '@ringpublishing/mui-components';
import { dataGridRowsGenerator, columnsForDataGridRowsGenerator } from 'RingDataGridHelpers';

export default function ClassicSelectionExample(): React.JSX.Element {
    const rows = dataGridRowsGenerator(10, 0, false);
    const columns = columnsForDataGridRowsGenerator;

    const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set([1, 2]),
    });

    return (
        <div style={{ minWidth: '100%', width: '100%', padding: '20px', height: '600px' }}>
            <RingDataGrid
                columnHeaderHeight={40}
                columns={columns}
                rows={rows}
                getRowHeight={(): 'auto' => 'auto'}
                labels={{
                    results: 'Results',
                    refresh: 'Refresh',
                    enableAutoRefresh: 'Enable auto refresh',
                    disableAutoRefresh: 'Disable auto refresh',
                }}
                totalRowCount={10}
                disableSelectAllCheckbox={true}
                checkboxSelection={true}
                rowSelectionModel={selectedRows}
                onRowSelectionModelChange={(newSelection): void => {
                    setSelectedRows(newSelection);
                }}
                clearSelectionOnRefresh={false}
            />
        </div>
    );
}
