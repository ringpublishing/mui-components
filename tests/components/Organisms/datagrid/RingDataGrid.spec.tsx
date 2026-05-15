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

    describe('placeholderLabels', () => {
        it('renders default localized empty-state labels when placeholderLabels is omitted', async () => {
            const { findByText } = render(
                <RingDataGrid rows={[]} columns={columns} labels={labels} totalRowCount={0} />,
            );

            expect(await findByText('No results')).toBeTruthy();
            expect(
                await findByText('Check your spelling, type the phrase differently, or change the filters.'),
            ).toBeTruthy();
        });

        it('renders custom empty-state labels when placeholderLabels.empty is provided', async () => {
            const { findByText, queryByText } = render(
                <RingDataGrid
                    rows={[]}
                    columns={columns}
                    labels={labels}
                    totalRowCount={0}
                    placeholderLabels={{
                        empty: {
                            header: 'No articles found',
                            description: 'Try different filters or check back later.',
                        },
                    }}
                />,
            );

            expect(await findByText('No articles found')).toBeTruthy();
            expect(await findByText('Try different filters or check back later.')).toBeTruthy();
            expect(queryByText('No results')).toBeNull();
        });

        it('renders default localized error labels and "Try again" button when placeholderLabels is omitted', async () => {
            const refreshCallback = (): null => null;
            const { findByText, findByRole } = render(
                <RingDataGrid
                    rows={[]}
                    columns={columns}
                    labels={labels}
                    totalRowCount={0}
                    error={true}
                    refreshCallback={refreshCallback}
                />,
            );

            expect(await findByText('Failed to load the list')).toBeTruthy();
            expect(await findByRole('button', { name: 'Try again' })).toBeTruthy();
        });

        it('renders custom error labels and retry button text when provided', async () => {
            const refreshCallback = (): null => null;
            const { findByText, findByRole, queryByText, queryByRole } = render(
                <RingDataGrid
                    rows={[]}
                    columns={columns}
                    labels={labels}
                    totalRowCount={0}
                    error={true}
                    refreshCallback={refreshCallback}
                    placeholderLabels={{
                        error: {
                            header: 'We could not load the list',
                            description: 'Something went wrong on our side.',
                        },
                        tryAgainButton: 'Retry',
                    }}
                />,
            );

            expect(await findByText('We could not load the list')).toBeTruthy();
            expect(await findByText('Something went wrong on our side.')).toBeTruthy();
            expect(await findByRole('button', { name: 'Retry' })).toBeTruthy();
            expect(queryByText('Failed to load the list')).toBeNull();
            expect(queryByRole('button', { name: 'Try again' })).toBeNull();
        });

        it('renders custom empty labels in the noResultsOverlay when a filter excludes every row', async () => {
            const { findByText } = render(
                <RingDataGrid
                    rows={rows}
                    columns={columns}
                    labels={labels}
                    totalRowCount={rows.length}
                    filterModel={{
                        items: [{ field: 'title', operator: 'equals', value: '__no-match__' }],
                    }}
                    placeholderLabels={{
                        empty: {
                            header: 'Nothing matches that filter',
                            description: 'Try a broader query.',
                        },
                    }}
                />,
            );

            expect(await findByText('Nothing matches that filter')).toBeTruthy();
            expect(await findByText('Try a broader query.')).toBeTruthy();
        });
    });
});
