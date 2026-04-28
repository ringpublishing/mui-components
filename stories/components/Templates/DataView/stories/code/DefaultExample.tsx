import React, { useState } from 'react';
import { DataView, RingDataGrid } from '@ringpublishing/mui-components';

export default function DefaultExample(): React.JSX.Element {
    const sampleRows = [
        { id: 1, name: 'Sample Item 1', status: 'Active' },
        { id: 2, name: 'Sample Item 2', status: 'Inactive' },
        { id: 3, name: 'Sample Item 3', status: 'Active' },
    ];

    const sampleColumns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'status', headerName: 'Status', width: 120 },
    ];

    const [detailOpen, setDetailOpen] = useState(true);

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

    const DetailPanel = (): React.JSX.Element => (
        <div style={{ padding: '16px' }}>
            <h3>Item Details</h3>
            <p>
                <strong>Name:</strong> Sample Item Details
            </p>
            <p>
                <strong>Status:</strong> Active
            </p>
            <p>
                <strong>Description:</strong> This is a detailed view of the selected item.
            </p>
            <p>
                <strong>Created:</strong> 2024-01-01
            </p>
            <p>
                <strong>Modified:</strong> 2024-01-15
            </p>
        </div>
    );

    return (
        <DataView
            sx={{ width: '100%', height: '300px' }}
            slots={{
                main: <RingDataGrid rows={sampleRows} columns={sampleColumns} totalRowCount={sampleRows.length} />,
                left: <Filters />,
                right: <DetailPanel />,
            }}
            slotProps={{
                top: {
                    defaultValue: '',
                    searchFunc: (): void => {
                        /* noop */
                    },
                },
            }}
            rightSlotOpen={detailOpen}
            setRightSlotOpen={setDetailOpen}
        />
    );
}
