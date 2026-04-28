import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import { Accordion } from '../../../../../src/index.js';
import WithButtonExampleCode from './code/WithButtonExample.tsx?raw';

type Story = StoryObj<typeof Accordion>;

const Example = (args: React.ComponentProps<typeof Accordion>): React.JSX.Element => {
    return <Accordion {...args} />;
};

export const WithButton: Story = {
    args: {
        label: 'Accordion',
        buttonLabel: 'Button',
        buttonOnClick: action('buttonOnClick'),
        children: <div>Opened accordion</div>,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithButtonExampleCode,
            example: <Example {...args} />,
        });
    },
};
