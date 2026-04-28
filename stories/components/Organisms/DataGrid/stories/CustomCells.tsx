import { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Delete, Edit, MoreVert } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import CustomCellsExampleCode from './code/CustomCellsExample.tsx?raw';
import { RingDataGrid as RingDataGridComponent, RingDataGridProps } from '../../../../../src/index.js';
import { RingDataGridWrapper } from '../common/RingDataGridWrapper.js';
import { customCellsColumns, customCellsRows, defaultFilterChips, sortableFields } from '../common/defaultArgs.js';

type Story = StoryObj<typeof RingDataGridComponent>;

export const CustomCells: Story = {
    args: {
        rows: customCellsRows,
        columns: customCellsColumns,
        showRingToolbar: true,
        labels: {
            results: 'Results',
            refresh: 'Refresh',
            enableAutoRefresh: 'Enable auto refresh',
            disableAutoRefresh: 'Disable auto refresh',
            selectAll: 'Select all',
            deselectAll: 'Deselect all',
        },
        sortableFields,
        autoRefresh: true,
        refreshCallback: action('refreshCallback'),
        refreshItems: action('refreshItems'),
        autoRefreshCallback: action('autoRefreshCallback'),
        additionalComponent: (
            <IconButton onClick={action('filter click')}>
                <MoreVert />
            </IconButton>
        ),
        enableBulkActions: true,
        bulkActions: [
            {
                tooltip: 'Delete',
                onClick: action('delete'),
                icon: <Delete />,
            },
            {
                tooltip: 'Edit',
                onClick: action('edit'),
                icon: <Edit />,
            },
        ],
        getRowHeight: (): 'auto' => 'auto',
        totalRowCount: 6400,
        maxSelectedRowsCount: 5000,
        onBulkActionsClose: action('onBulkActionsClose'),
        filterChips: defaultFilterChips,
    },
    render: (args, context) => {
        const [enableBulkActions, setEnableBulkActions] = useState(false);
        args.enableBulkActions = enableBulkActions;
        args.onBulkActionsClose = (): void => setEnableBulkActions(false);
        args.additionalComponent = (
            <IconButton onClick={(): void => setEnableBulkActions(!enableBulkActions)}>
                <MoreVert />
            </IconButton>
        );

        return createCodeStory({
            context,
            customProps: {},
            example: <RingDataGridWrapper {...(args as RingDataGridProps)} />,
            customCode: CustomCellsExampleCode,
        });
    },
};
