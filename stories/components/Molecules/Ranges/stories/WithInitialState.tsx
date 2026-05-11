import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Box } from '@mui/material';
import { Ranges } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import WithInitialStateExampleCode from './code/WithInitialStateExample.tsx?raw';

type Story = StoryObj<typeof Ranges>;

const Example = (args: React.ComponentProps<typeof Ranges>): React.JSX.Element => {
    return (
        <Box width={'200px'}>
            <Ranges {...args} />
        </Box>
    );
};

export const WithInitialState: Story = {
    args: {
        ...defaultArgs,
        onChange: (ranges) => action('onChange')(JSON.stringify(ranges)),
        dataTestIdSuffix: 'withInitialState',
        initialState: {
            imagesCount: {
                order: 0,
                from: 10,
                to: 50,
            },
            charactersCount: {
                order: 1,
                from: 1000,
            },
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: WithInitialStateExampleCode,
            example: <Example {...args} />,
        }),
};
