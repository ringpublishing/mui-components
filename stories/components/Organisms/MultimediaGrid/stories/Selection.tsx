import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import CheckboxSelectionExampleCode from './code/CheckboxSelectionExample.tsx?raw';
import { MultimediaGrid } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { useMultimediaGridDemoData } from '../../../../../src/helpers/stories/ringDemoData.js';

import { GridRowSelectionModel } from '@mui/x-data-grid';
import { action } from 'storybook/actions';

type Story = StoryObj<typeof MultimediaGrid>;

const Example = (args: Omit<React.ComponentProps<typeof MultimediaGrid>, 'items'>): React.JSX.Element => {
    const { items, totalCount, loading, getItemIdsByIndices } = useMultimediaGridDemoData();

    const handleSelectionChange = (newSelection: GridRowSelectionModel): void => {
        action('onSelectionModelChange')(newSelection);
    };

    return (
        <MultimediaGrid
            {...args}
            items={items}
            totalRowCount={totalCount}
            loading={loading}
            selectionModel={{ type: 'include', ids: new Set(getItemIdsByIndices([0, 1])) }}
            onSelectionModelChange={handleSelectionChange}
        />
    );
};

export const Selection: Story = {
    args: {
        ...defaultArgs,
        disableSelectionOnClick: true,
        checkboxSelection: true,
        disableSelection: false,
        showRingToolbar: true,
        slotProps: {
            mediaCard: {
                slotProps: {
                    checkbox: {
                        showOnHover: true,
                    },
                },
            },
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: CheckboxSelectionExampleCode,
            example: <Example {...args} />,
        });
    },
};
