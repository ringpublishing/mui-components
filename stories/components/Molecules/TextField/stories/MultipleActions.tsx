import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Info, Search } from 'lucide-react';
import { createCodeStory } from '../../../../helpers.js';
import MultipleActionsExampleCode from './code/MultipleActionsExample.tsx?raw';
import { TextField } from '../../../../../src/index.js';

type Story = StoryObj<typeof TextField>;

const ACTIONS = [
    {
        icon: <Search />,
        onClick: action('click'),
        label: 'Settings',
    },
    {
        icon: <Info />,
        onClick: action('click'),
        label: 'Info',
    },
];

const Example = (args: React.ComponentProps<typeof TextField>): React.JSX.Element => {
    return <TextField {...args} actions={ACTIONS} />;
};

export const MultipleActions: Story = {
    args: {},
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: MultipleActionsExampleCode,
            example: <Example {...args} />,
        });
    },
};
