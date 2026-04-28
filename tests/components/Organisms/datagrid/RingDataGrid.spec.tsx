import { describe, expect, it } from 'vitest';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Delete, Edit, FilterList } from '@mui/icons-material';
import { render } from '../../../test-utils/customRenderer.js';
import { RingDataGrid } from '../../../../src/index.js';

describe('RingDataGrid', () => {
    const rows: GridRowsProp = [
        {
            id: 0,
            title: 'Article 1',
            publicationDate: '10/16/2003, 7:11:27 PM',
            createdDate: '6/23/1979, 10:49:45 AM',
        },
        {
            id: 1,
            title: 'Article 2',
            publicationDate: '7/13/2022, 9:39:01 AM',
            createdDate: '2/14/2010, 1:58:50 PM',
        },
    ];

    const columns: GridColDef[] = [
        { field: 'title', headerName: 'Title', width: 200 },
        { field: 'publicationDate', headerName: 'Publication date', width: 200 },
    ];

    const sortableFields = [
        { name: 'Publication date', key: 'publicationDate', onSortingChange: (): null => null },
        { name: 'Created date', key: 'createdDate', onSortingChange: (): null => null },
    ];
    const labels = {
        results: 'Results',
        refresh: 'Refresh',
        enableAutoRefresh: 'Enable auto refresh',
        disableAutoRefresh: 'Disable auto refresh',
    };

    it('should render correctly data grid with custom toolbar', () => {
        expect(
            render(
                <RingDataGrid
                    rows={rows}
                    columns={columns}
                    labels={labels}
                    showRingToolbar={true}
                    sortableFields={sortableFields}
                    autoRefresh={false}
                    refreshCallback={(): null => null}
                    refreshItems={(): null => null}
                    totalRowCount={6400}
                    additionalComponent={<FilterList onClick={(): null => null} />}
                />,
            ).container,
        ).toMatchSnapshot();
    });

    it('should render correctly data grid with auto refresh', () => {
        expect(
            render(
                <RingDataGrid
                    rows={rows}
                    columns={columns}
                    labels={labels}
                    showRingToolbar={true}
                    sortableFields={sortableFields}
                    autoRefresh={true}
                    refreshRate={30000}
                    userInteractionDebounceDelay={1000}
                    disableAutoRefreshOnUserInteraction={false}
                    refreshCallback={(): null => null}
                    refreshItems={(): null => null}
                    totalRowCount={6400}
                    additionalComponent={<FilterList onClick={(): null => null} />}
                />,
            ).container,
        ).toMatchSnapshot();
    });

    it('should render correctly data grid with bulk actions', () => {
        expect(
            render(
                <RingDataGrid
                    rows={rows}
                    columns={columns}
                    labels={labels}
                    showRingToolbar={true}
                    sortableFields={sortableFields}
                    autoRefresh={false}
                    refreshCallback={(): null => null}
                    refreshItems={(): null => null}
                    enableBulkActions={true}
                    bulkActions={[
                        {
                            tooltip: 'Delete',
                            onClick: (): null => null,
                            icon: <Delete />,
                        },
                        {
                            tooltip: 'Edit',
                            onClick: (): null => null,
                            icon: <Edit />,
                        },
                    ]}
                    totalRowCount={6400}
                    maxSelectedRowsCount={5000}
                    onBulkActionsClose={(): null => null}
                    additionalComponent={<FilterList onClick={(): null => null} />}
                />,
            ).container,
        ).toMatchSnapshot();
    });
});
