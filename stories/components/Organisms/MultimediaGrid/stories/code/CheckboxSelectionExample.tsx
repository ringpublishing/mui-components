import React from 'react';
import { MultimediaGrid } from '@ringpublishing/mui-components';
import { useMultimediaGridDemoData } from 'RingDemoData';
import { GridRowSelectionModel } from '@mui/x-data-grid-pro';

const labels = {
    results: 'Results',
    refresh: 'Refresh',
    enableAutoRefresh: 'Enable auto refresh',
    disableAutoRefresh: 'Disable auto refresh',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
};

export default function CheckboxSelectionExample(): React.JSX.Element {
    const { items, totalCount, loading, getItemIdsByIndices } = useMultimediaGridDemoData();

    const handleSelectionChange = (newSelection: GridRowSelectionModel): void => {
        console.log('Selection changed:', newSelection);
    };

    return (
        <MultimediaGrid
            checkboxSelection={true}
            disableSelection={false}
            showRingToolbar={true}
            labels={labels}
            items={items}
            totalRowCount={totalCount}
            loading={loading}
            selectionModel={{ type: 'include', ids: new Set(getItemIdsByIndices([0, 1])) }}
            onSelectionModelChange={handleSelectionChange}
            slotProps={{
                mediaCard: {
                    slotProps: {
                        checkbox: {
                            showOnHover: true, // Checkbox shows on hover when unselected
                        },
                    },
                },
            }}
            sx={{ width: '100%', height: '80vh' }}
        />
    );
}
