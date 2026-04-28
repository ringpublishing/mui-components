import React from 'react';
import { Button } from '@mui/material';
import { RingDataGrid as RingDataGridComponent, RingDataGridProps } from '../../../../../src/index.js';

export function RingDataGridWrapper(props: RingDataGridProps, bulkActions = false): React.ReactElement {
    const [bulkActionsMode, setBulkActionsMode] = React.useState<boolean>(false);

    return (
        <div
            style={{
                minWidth: '100%',
                width: '100%',
                padding: '20px',
                height: '600px',
            }}
        >
            <RingDataGridComponent
                rowHeight={35}
                columnHeaderHeight={40}
                {...props}
                {...(bulkActions
                    ? {
                          enableBulkActions: bulkActionsMode,
                          additionalComponent: (
                              <Button variant="outlined" size="small" onClick={(): void => setBulkActionsMode(true)}>
                                  Enable bulk actions
                              </Button>
                          ),
                          onBulkActionsClose: (): void => {
                              setBulkActionsMode(false);
                          },
                      }
                    : {})}
            />
        </div>
    );
}
