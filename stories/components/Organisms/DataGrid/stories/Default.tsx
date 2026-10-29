import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { RingDataGrid as RingDataGridComponent, RingDataGridProps } from '../../../../../src/index.js';
import { columnsForDataGridRowsGenerator, dataGridRowsGenerator } from '../common/helpers.js';
import { GRID_CONTAINER_SX } from '../common/gridContainer.js';

type Story = StoryObj<typeof RingDataGridComponent>;

const Example = (args: RingDataGridProps): React.JSX.Element => {
    return (
        <Box sx={GRID_CONTAINER_SX}>
            <RingDataGridComponent {...args} />
        </Box>
    );
};

export const Default: Story = {
    args: {
        columns: columnsForDataGridRowsGenerator,
        rows: dataGridRowsGenerator(10, 0, false),
        totalRowCount: 10,
        filterChips: undefined,
        sortableFields: undefined,
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example {...(args as RingDataGridProps)} />;
        }

        return createCodeStory({
            context,
            customProps: {},
            example: <Example {...(args as RingDataGridProps)} />,
            customCode: DefaultExampleCode,
        });
    },
};
