import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithOverflowAndTooltipExampleCode from './code/WithOverflowAndTooltipExample.tsx?raw';
import { Typography } from '../../../../../src/index.js';

type Story = StoryObj<typeof Typography>;

const Example = (args: React.ComponentProps<typeof Typography>): React.JSX.Element => {
    return <Typography {...args} />;
};

export const WithOverflowAndTooltip: Story = {
    args: {
        enableOverflow: true,
        children:
            'This is a very long text that will overflow and show ellipsis. Hover over it to see the full text in a tooltip.',
        sx: {
            width: '300px',
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithOverflowAndTooltipExampleCode,
            example: <Example {...args} />,
        });
    },
};
