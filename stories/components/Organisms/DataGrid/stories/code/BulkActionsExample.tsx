import React, { useState } from 'react';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { RingDataGrid } from '@ringpublishing/mui-components';
import { dataGridRowsGenerator } from 'RingDataGridHelpers';

export default function BulkActionsExample(): React.JSX.Element {
    const [rows] = useState<GridRowsProp>(dataGridRowsGenerator(10));
    const [bulkActionsMode, setBulkActionsMode] = useState<boolean>(true);

    const columns: GridColDef[] = [
        { field: 'title', headerName: 'Title', flex: 1 },
        { field: 'publicationDate', headerName: 'Publication date', width: 200 },
        { field: 'createdDate', headerName: 'Created date', width: 200 },
    ];

    const sortableFields = [
        { name: 'Publication date', key: 'publicationDate', onSortingChange: (): void => undefined },
        { name: 'Created date', key: 'createdDate', onSortingChange: (): void => undefined },
    ];

    const labels = {
        results: 'Results',
        refresh: 'Refresh',
        enableAutoRefresh: 'Enable auto refresh',
        disableAutoRefresh: 'Disable auto refresh',
        selectAll: 'Select all',
        deselectAll: 'Deselect all',
    };

    return (
        <div style={{ padding: '20px', width: '100%', height: '400px' }}>
            <RingDataGrid
                rows={rows}
                columns={columns}
                labels={labels}
                sortableFields={sortableFields}
                autoRefresh={false}
                refreshCallback={(): void => undefined}
                showRingToolbar={true}
                enableBulkActions={bulkActionsMode}
                bulkActions={[
                    {
                        tooltip: 'Delete',
                        onClick: (params): void => {
                            void params;
                        },
                        icon: <Delete />,
                    },
                    {
                        tooltip: 'Edit',
                        onClick: (params): void => {
                            void params;
                        },
                        icon: <Edit />,
                    },
                ]}
                additionalComponent={
                    <Button variant="outlined" size="small" onClick={(): void => setBulkActionsMode(true)}>
                        Enable bulk actions
                    </Button>
                }
                totalRowCount={6400}
                maxSelectedRowsCount={5000}
                onBulkActionsClose={(): void => setBulkActionsMode(false)}
                columnHeaderHeight={40}
            />
        </div>
    );
}
