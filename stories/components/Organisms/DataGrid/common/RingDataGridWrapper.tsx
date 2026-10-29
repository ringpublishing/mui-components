import React from 'react';
import { Box, Button } from '@mui/material';
import { RingDataGrid as RingDataGridComponent, RingDataGridProps } from '../../../../../src/index.js';
import { GRID_CONTAINER_SX } from './gridContainer.js';

export function RingDataGridWrapper(props: RingDataGridProps, bulkActions = false): React.ReactElement {
    const [bulkActionsMode, setBulkActionsMode] = React.useState<boolean>(false);

    return (
        <Box sx={GRID_CONTAINER_SX}>
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
        </Box>
    );
}
