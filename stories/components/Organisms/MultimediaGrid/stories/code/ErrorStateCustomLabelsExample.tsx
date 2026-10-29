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

export default function ErrorStateCustomLabelsExample(): React.JSX.Element {
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
            placeholderLabels={{
                error: {
                    header: 'We could not load your media',
                    description: 'Something went wrong on our side. Retry, or contact support if it keeps happening.',
                },
                tryAgainButton: 'Retry',
            }}
            sx={{ width: '100%', height: '80vh' }}
        />
    );
}
