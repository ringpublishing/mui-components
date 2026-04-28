import React from 'react';
import { DataView, RingDataGrid } from '@ringpublishing/mui-components';

export default function WithDynamicWidthFilterExample(): React.JSX.Element {
    const sampleRows = [
        { id: 1, name: 'Sample Item 1', status: 'Active' },
        { id: 2, name: 'Sample Item 2', status: 'Inactive' },
        { id: 3, name: 'Sample Item 3', status: 'Active' },
    ];

    const sampleColumns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'status', headerName: 'Status', width: 120 },
    ];

    const Filters = (): React.JSX.Element => (
        <div style={{ padding: '16px' }}>
            <h3>Filters</h3>
            <div style={{ marginBottom: '12px' }}>
                <label>
                    <input type="checkbox" /> Active Items
                </label>
            </div>
            <div style={{ marginBottom: '12px' }}>
                <label>
                    <input type="checkbox" /> Inactive Items
                </label>
            </div>
            <div>
                <input type="text" placeholder="Search..." style={{ width: '100%', padding: '8px' }} />
            </div>
        </div>
    );

    return (
        <DataView
            sx={{ width: '100%' }}
            slots={{
                left: <Filters />,
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
            leftSlotOpen={true}
            leftSlotWidth={300}
            leftSlotDynamicWidth={{
                enabled: true,
                minWidth: 200,
                maxWidth: 500,
                onChange: (width) => {
                    console.log('Filter width changed to:', width);
                },
            }}
        />
    );
}
