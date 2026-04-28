import React from 'react';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { MoreVertOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { RingDataGrid } from '@ringpublishing/mui-components';

export default function CustomToolbarExample(): React.JSX.Element {
    const rows: GridRowsProp = [
        { id: 0, title: 'Article 1', publicationDate: '10/16/2003, 7:11:27 PM', createdDate: '6/23/1979, 10:49:45 AM' },
        { id: 1, title: 'Article 2', publicationDate: '7/13/2022, 9:39:01 AM', createdDate: '2/14/2010, 1:58:50 PM' },
        { id: 2, title: 'Article 3', publicationDate: '3/12/2011, 1:51:17 AM', createdDate: '12/16/1995, 12:41:50 PM' },
        { id: 3, title: 'Article 4', publicationDate: '10/14/2017, 3:34:42 PM', createdDate: '8/3/1991, 8:54:26 AM' },
        { id: 4, title: 'Article 5', publicationDate: '2/22/1974, 2:57:38 PM', createdDate: '6/9/2021, 4:51:03 PM' },
        { id: 5, title: 'Article 6', publicationDate: '3/11/1989, 5:08:24 AM', createdDate: '11/13/2011, 3:42:29 AM' },
        { id: 6, title: 'Article 7', publicationDate: '1/26/2016, 6:59:18 AM', createdDate: '5/18/2004, 3:07:56 AM' },
        { id: 7, title: 'Article 8', publicationDate: '6/1/2006, 2:33:56 PM', createdDate: '7/1/1991, 11:53:42 AM' },
        {
            id: 8,
            title: 'Article 9',
            publicationDate: '11/10/1996, 11:55:32 AM',
            createdDate: '10/31/1998, 9:59:05 AM',
        },
        { id: 9, title: 'Article 10', publicationDate: '1/7/2021, 8:09:34 PM', createdDate: '10/21/1974, 8:53:11 PM' },
    ];

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
    };

    return (
        <div style={{ padding: '20px', height: '300px' }}>
            <RingDataGrid
                rows={rows}
                columns={columns}
                labels={labels}
                showRingToolbar={true}
                sortableFields={sortableFields}
                autoRefresh={true}
                refreshCallback={(): void => undefined}
                refreshItems={(): void => undefined}
                additionalComponent={
                    <IconButton onClick={(): void => undefined}>
                        <MoreVertOutlined />
                    </IconButton>
                }
                rowHeight={35}
                columnHeaderHeight={40}
                totalRowCount={rows.length}
            />
        </div>
    );
}
