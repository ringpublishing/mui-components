import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { MoreVertOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import CustomToolbarExampleCode from './code/CustomToolbarExample.tsx?raw';
import { RingDataGrid as RingDataGridComponent, RingDataGridProps } from '../../../../../src/index.js';
import { RingDataGridWrapper } from '../common/RingDataGridWrapper.js';
import { defaultFilterChips, sortableFields, ringToolbarRows, ringToolbarColumns } from '../common/defaultArgs.js';

type Story = StoryObj<typeof RingDataGridComponent>;

const Example = (args: RingDataGridProps): React.JSX.Element => {
    return <RingDataGridWrapper {...args} />;
};

export const CustomToolbar: Story = {
    args: {
        rows: ringToolbarRows,
        columns: ringToolbarColumns,
        showRingToolbar: true,
        labels: {
            results: 'Results',
            refresh: 'Refresh',
            enableAutoRefresh: 'Enable auto refresh',
            disableAutoRefresh: 'Disable auto refresh',
        },
        sortableFields,
        totalRowCount: 6400,
        autoRefresh: true,
        refreshCallback: action('refreshCallback'),
        refreshItems: action('refreshItems'),
        autoRefreshCallback: action('autoRefreshCallback'),
        additionalComponent: (
            <IconButton onClick={action('filter click')}>
                <MoreVertOutlined />
            </IconButton>
        ),
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
            customCode: CustomToolbarExampleCode,
        });
    },
};
