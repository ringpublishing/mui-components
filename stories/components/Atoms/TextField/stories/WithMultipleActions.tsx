import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { InfoOutlined, ManageSearch } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import WithMultipleActionsExampleCode from './code/WithMultipleActionsExample.tsx?raw';
import { TextField } from '../../../../../src/index.js';

type Story = StoryObj<typeof TextField>;

const ACTIONS = [
    {
        icon: <ManageSearch />,
        onClick: action('click'),
        label: 'Settings',
    },
    {
        icon: <InfoOutlined />,
        onClick: action('click'),
        label: 'Info',
    },
];

const Example = (args: React.ComponentProps<typeof TextField>): React.JSX.Element => {
    return <TextField {...args} actions={ACTIONS} />;
};

export const WithMultipleActions: Story = {
    args: {},
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithMultipleActionsExampleCode,
            example: <Example {...args} />,
        });
    },
};
