import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { RingDataGrid } from '@ringpublishing/mui-components';

export default function NoResultsExample(): React.JSX.Element {
    const columns: GridColDef[] = [
        { field: 'title', headerName: 'Title', flex: 1 },
        { field: 'publicationDate', headerName: 'Publication date', width: 200 },
        { field: 'createdDate', headerName: 'Created date', width: 200 },
    ];

    const labels = {
        results: 'Results',
    };

    return (
        <div style={{ padding: '20px', height: '500px' }}>
            <RingDataGrid
                rows={[]}
                columns={columns}
                labels={labels}
                rowHeight={35}
                columnHeaderHeight={40}
                totalRowCount={0}
            />
        </div>
    );
}
