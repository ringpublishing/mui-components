import { MoreVert } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { SearchBar } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import ControlledExampleCode from './code/ControlledExample.tsx?raw';
import type { StoryObj } from '@storybook/react-vite';
import React from 'react';

type Story = StoryObj<typeof SearchBar>;

const Example = (args: React.ComponentProps<typeof SearchBar>): React.JSX.Element => {
    const [value, setValue] = React.useState('');

    return (
        <SearchBar {...args} value={value} onChange={setValue}>
            <IconButton key={1}>
                <MoreVert />
            </IconButton>
        </SearchBar>
    );
};

export const Controlled: Story = {
    args: {
        ...defaultArgs,
        withClearButton: true,
        className: 'custom-class-name',
        sx: { border: '1px solid #d9d9d9' },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            example: <Example {...args} />,
            customProps: {},
            customCode: ControlledExampleCode,
        }),
};
