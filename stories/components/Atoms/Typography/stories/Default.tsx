import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import { Typography } from '../../../../../src/index.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';

type Story = StoryObj<typeof Typography>;

const Example = (args: React.ComponentProps<typeof Typography>): React.JSX.Element => {
    return <Typography {...args} />;
};

export const Default: Story = {
    args: {
        children: 'This is a very long text that will be wrapped within the container without overflow.',
        sx: {
            width: '300px',
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: DefaultExampleCode,
            example: <Example {...args} />,
        });
    },
};
