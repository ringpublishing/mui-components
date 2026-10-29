import React, { useEffect, useState } from 'react';
import { GridRowSelectionModel } from '@mui/x-data-grid-pro';
import { Box } from '@mui/material';

import { RingDataGrid as RingDataGridComponent, RingDataGridProps } from '../../../../../src/index.js';
import { useRingDataGridDemoData } from '../../../../helpers/ringDemoData.js';
import { storiesColumns, getInitialColumnVisibilityModel } from '../DataGrid.stories.columnsandrows.js';
import { GRID_CONTAINER_SX } from './gridContainer.js';

// Module scope, not the render body: a type declared per render remounts the whole grid every time.
const DataGridContainer = ({
    withContainer,
    children,
}: {
    withContainer: boolean;
    children: React.ReactNode;
}): React.JSX.Element => (withContainer ? <Box sx={GRID_CONTAINER_SX}>{children}</Box> : <>{children}</>);

export function StoryRingDataGridWrapper(props: RingDataGridProps & { withContainer?: boolean }): React.JSX.Element {
    const { additionalComponent, withContainer = true } = props;
    const { items, loading, hasMore, nextData, totalCount, refresh } = useRingDataGridDemoData({
        initialCount: 40,
    });
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set(),
    });

    useEffect(() => {
        if (props.rowSelectionModel) {
            setRowSelectionModel(props.rowSelectionModel);
        }
    }, [props.rowSelectionModel]);

    let onRowSelectionModelChange = {};

    if (props?.onRowSelectionModelChange) {
        onRowSelectionModelChange = {
            onRowSelectionModelChange: (newSelection: GridRowSelectionModel) => setRowSelectionModel(newSelection),
        };
    }

    return (
        <DataGridContainer withContainer={withContainer}>
            <RingDataGridComponent
                {...props}
                columnHeaderHeight={40}
                columns={props?.columns ? props.columns : storiesColumns}
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
                    ...props.initialState,
                    columns: {
                        columnVisibilityModel: getInitialColumnVisibilityModel(),
                    },
                }}
                {...(props.rowSelectionModel ? { rowSelectionModel } : {})}
                {...onRowSelectionModelChange}
                additionalComponent={additionalComponent}
            />
        </DataGridContainer>
    );
}
