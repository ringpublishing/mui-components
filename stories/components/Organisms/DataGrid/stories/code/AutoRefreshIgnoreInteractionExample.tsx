import React from 'react';
import { RingDataGrid } from '@ringpublishing/mui-components';
import { storiesColumns, getInitialColumnVisibilityModel } from 'RingDataGridColumnsAndRows';
import { useRingDataGridDemoData } from 'RingDemoData';

export default function AutoRefreshIgnoreInteractionExample(): React.JSX.Element {
    const { items, loading, hasMore, nextData, totalCount, refresh } = useRingDataGridDemoData({
        initialCount: 40,
    });

    return (
        <div style={{ minWidth: '100%', width: '100%', padding: '20px', height: '600px' }}>
            <RingDataGrid
                autoRefresh={true}
                refreshRate={5000}
                disableAutoRefreshOnUserInteraction={false}
                columnHeaderHeight={40}
                columns={storiesColumns}
                showRingToolbar={true}
                getRowHeight={(): 'auto' => 'auto'}
                labels={{
                    results: 'Results',
                    refresh: 'Refresh',
                    enableAutoRefresh: 'Enable auto refresh',
                    disableAutoRefresh: 'Disable auto refresh',
                }}
                disableColumnFilter={true}
                rows={items}
                totalRowCount={totalCount}
                onRowsScrollEnd={(): void => {
                    if (hasMore) {
                        nextData(30);
                    }
                }}
                loading={loading}
                refreshItems={(): void => refresh()}
                initialState={{
                    columns: {
                        columnVisibilityModel: getInitialColumnVisibilityModel(true),
                    },
                }}
            />
        </div>
    );
}
