import React from 'react';
import { MultimediaGrid } from '@ringpublishing/mui-components';
import { useMultimediaGridDemoData } from 'RingDemoData';

const labels = {
    results: 'Results',
    refresh: 'Refresh',
    enableAutoRefresh: 'Enable auto refresh',
    disableAutoRefresh: 'Disable auto refresh',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
};

export default function InfiniteScrollExample(): React.JSX.Element {
    const { items, totalCount, loading, hasMore, nextData } = useMultimediaGridDemoData({
        initialCount: 30,
    });

    const handleLoadMore = async (): Promise<void> => {
        await nextData(30); // Load 30 more items each time
    };

    return (
        <MultimediaGrid
            items={items}
            totalRowCount={totalCount}
            loading={loading}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            showRingToolbar={true}
            labels={labels}
            sx={{ width: '100%', height: '80vh' }}
        />
    );
}
