import React, { useEffect, useState } from 'react';
import { GridRowSelectionModel } from '@mui/x-data-grid-pro';

import { RingDataGrid as RingDataGridComponent, RingDataGridProps } from '../../../../../src/index.js';
import { useRingDataGridDemoData } from '../../../../../src/helpers/stories/ringDemoData.js';
import { storiesColumns, getInitialColumnVisibilityModel } from '../DataGrid.stories.columnsandrows.js';

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

    const DataGridContainer = ({ children }: { children: React.ReactNode }): React.JSX.Element =>
        withContainer ? (
            <div
                style={{
                    minWidth: '100%',
                    width: '100%',
                    padding: '20px',
                    height: '600px',
                }}
            >
                {children}
            </div>
        ) : (
            <> {children}</>
        );

    return (
        <DataGridContainer>
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
