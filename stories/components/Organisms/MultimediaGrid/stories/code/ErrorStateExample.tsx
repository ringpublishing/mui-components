import React from 'react';
import { MultimediaGrid } from '@ringpublishing/mui-components';
import { sortableFields } from 'RingDemoData';

const labels = {
    results: 'Results',
    refresh: 'Refresh',
    enableAutoRefresh: 'Enable auto refresh',
    disableAutoRefresh: 'Disable auto refresh',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
};

export default function ErrorStateExample(): React.JSX.Element {
    return (
        <MultimediaGrid
            showRingToolbar={true}
            labels={labels}
            sortableFields={sortableFields}
            error={true}
            items={[]}
            totalRowCount={0}
            loading={false}
            refreshItems={(): void => undefined}
            sx={{ width: '100%', height: '80vh' }}
        />
    );
}
