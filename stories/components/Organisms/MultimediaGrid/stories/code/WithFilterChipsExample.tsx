import React from 'react';
import { MultimediaGrid } from '@ringpublishing/mui-components';
import { sortableFields, useMultimediaGridDemoData } from 'RingDemoData';

const labels = {
    results: 'Results',
    refresh: 'Refresh',
    enableAutoRefresh: 'Enable auto refresh',
    disableAutoRefresh: 'Disable auto refresh',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
};

export default function WithFilterChipsExample(): React.JSX.Element {
    const { items, totalCount, loading } = useMultimediaGridDemoData({});

    return (
        <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
            <MultimediaGrid
                showRingToolbar={true}
                labels={labels}
                sortableFields={sortableFields}
                items={items}
                totalRowCount={totalCount}
                loading={loading}
                filterChips={{
                    chips: [
                        { filter: 'Date from', value: '10/10/2025', onDelete: (): void => undefined },
                        { filter: 'Date to', value: '10/11/2025', onDelete: (): void => undefined },
                        // Boolean filter — only the key is meaningful, so the chip renders without a `:` separator.
                        { filter: 'Published', onDelete: (): void => undefined },
                    ],
                    onDeleteAll: (): void => undefined,
                }}
                sx={{ width: '100%', height: '80vh' }}
            />
        </div>
    );
}
