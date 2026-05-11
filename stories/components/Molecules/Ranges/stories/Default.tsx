import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Box } from '@mui/material';
import { Ranges } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';

type Story = StoryObj<typeof Ranges>;

const Example = (args: React.ComponentProps<typeof Ranges>): React.JSX.Element => {
    return (
        <Box width={'200px'}>
            <Ranges {...args} />
        </Box>
    );
};

export const Default: Story = {
    args: {
        ...defaultArgs,
        onChange: (ranges) => action('onChange')(ranges),
        dataTestIdSuffix: 'default',
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: DefaultExampleCode,
            example: <Example {...args} />,
        }),
};
