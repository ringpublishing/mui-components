import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { ManageSearch } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { TextField } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof TextField>;

const ACTIONS = [
    {
        icon: <ManageSearch />,
        onClick: action('click'),
        label: 'Settings',
    },
];

const Example = (args: React.ComponentProps<typeof TextField>): React.JSX.Element => {
    return <TextField {...args} actions={ACTIONS} />;
};

export const Default: Story = {
    args: {
        ...defaultArgs,
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
