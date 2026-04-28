import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Delete, Edit, MoreVert } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import BulkActionsExampleCode from './code/BulkActionsExample.tsx?raw';
import { RingDataGrid as RingDataGridComponent, RingDataGridProps } from '../../../../../src/index.js';
import { RingDataGridWrapper } from '../common/RingDataGridWrapper.js';
import { defaultFilterChips, sortableFields, ringToolbarRows, ringToolbarColumns } from '../common/defaultArgs.js';

type Story = StoryObj<typeof RingDataGridComponent>;

const Example = (args: RingDataGridProps): React.JSX.Element => {
    return <RingDataGridWrapper {...args} />;
};

export const BulkActions: Story = {
    args: {
        rows: ringToolbarRows,
        columns: ringToolbarColumns,
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
        totalRowCount: 6400,
        maxSelectedRowsCount: 5000,
        onBulkActionsClose: action('onBulkActionsClose'),
        filterChips: defaultFilterChips,
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example {...(args as RingDataGridProps)} />;
        }

        return createCodeStory({
            context,
            customProps: {},
            example: <Example {...(args as RingDataGridProps)} />,
            customCode: BulkActionsExampleCode,
        });
    },
};
