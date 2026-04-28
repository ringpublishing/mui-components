import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import { Accordion } from '../../../../../src/index.js';
import WithLabelExampleCode from './code/WithLabelExample.tsx?raw';

type Story = StoryObj<typeof Accordion>;

const Example = (args: React.ComponentProps<typeof Accordion>): React.JSX.Element => {
    return <Accordion {...args} />;
};

export const WithLabel: Story = {
    args: {
        label: 'Label',
        children: <div>Opened accordion</div>,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithLabelExampleCode,
            example: <Example {...args} />,
        });
    },
};
