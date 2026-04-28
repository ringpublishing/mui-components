import React from 'react';
import { DataView, RingDataGrid } from '@ringpublishing/mui-components';

export default function WithoutDetailAndFilterExample(): React.JSX.Element {
    const sampleRows = [
        { id: 1, name: 'Sample Item 1', status: 'Active' },
        { id: 2, name: 'Sample Item 2', status: 'Inactive' },
        { id: 3, name: 'Sample Item 3', status: 'Active' },
    ];

    const sampleColumns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'status', headerName: 'Status', width: 120 },
    ];

    return (
        <DataView
            sx={{ width: '100%' }}
            slots={{
                main: <RingDataGrid rows={sampleRows} columns={sampleColumns} totalRowCount={sampleRows.length} />,
            }}
            slotProps={{
                top: {
                    defaultValue: '',
                    searchFunc: (): void => {
                        /* noop */
                    },
                },
            }}
        />
    );
}
