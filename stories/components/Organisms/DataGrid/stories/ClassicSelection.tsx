import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import ClassicSelectionExampleCode from './code/ClassicSelectionExample.tsx?raw';
import { RingDataGrid as RingDataGridComponent, RingDataGridProps } from '../../../../../src/index.js';
import { defaultFilterChips } from '../common/defaultArgs.js';
import { columnsForDataGridRowsGenerator, dataGridRowsGenerator } from '../common/helpers.js';

type Story = StoryObj<typeof RingDataGridComponent>;

const Example = (args: RingDataGridProps): React.JSX.Element => {
    return <RingDataGridComponent {...args} />;
};

export const ClassicSelection: Story = {
    args: {
        disableSelectAllCheckbox: true,
        onRowSelectionModelChange: action('onRowSelectionModelChange'),
        rowSelectionModel: { type: 'include', ids: new Set([1, 2]) },
        totalRowCount: 10,
        columnHeaderHeight: 40,
        checkboxSelection: true,
        columns: columnsForDataGridRowsGenerator,
        clearSelectionOnRefresh: false,
        rows: dataGridRowsGenerator(10, 0, false),
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
            customCode: ClassicSelectionExampleCode,
        });
    },
};
