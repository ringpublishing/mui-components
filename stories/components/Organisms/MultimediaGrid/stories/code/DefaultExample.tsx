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

export default function DefaultExample(): React.JSX.Element {
    const { items, totalCount, loading } = useMultimediaGridDemoData({});

    return (
        <MultimediaGrid
            showRingToolbar={true}
            labels={labels}
            sortableFields={sortableFields}
            items={items}
            totalRowCount={totalCount}
            loading={loading}
            sx={{ width: '100%', height: '80vh' }}
        />
    );
}
