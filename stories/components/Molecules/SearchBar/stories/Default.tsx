import { List, MoreTime, RocketLaunch } from '@mui/icons-material';
import { MenuItem, IconButton, Select } from '@mui/material';
import { SplitButton, SearchBar } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import type { StoryObj } from '@storybook/react-vite';
import React from 'react';

function SelectExample(): React.JSX.Element {
    return (
        <Select
            key={0}
            defaultValue={1}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Age"
            variant="standard"
            disableUnderline={true}
        >
            <MenuItem value={1}>Newest</MenuItem>
            <MenuItem value={2}>Oldest</MenuItem>
            <MenuItem value={3}>Most popular</MenuItem>
        </Select>
    );
}

type Story = StoryObj<typeof SearchBar>;

const Example = (args: React.ComponentProps<typeof SearchBar>): React.JSX.Element => {
    return (
        <SearchBar {...args}>
            <SelectExample key={0} />
            <SplitButton key={1} actions={[{ label: 'Main Action', onClick: () => null }]} sx={{ height: '36px' }} />
            <SplitButton
                key={2}
                variant="outlined"
                actions={[
                    { label: 'Main Action', onClick: () => null },
                    {
                        label: 'Additional Action 1',
                        onClick: () => null,
                        icon: <RocketLaunch />,
                    },
                    {
                        label: 'Additional Action 2',
                        onClick: () => null,
                        icon: <MoreTime />,
                    },
                ]}
                sx={{ height: '36px' }}
            />
            <IconButton key={3}>
                <List />
            </IconButton>
        </SearchBar>
    );
};

export const Default: Story = {
    args: {
        ...defaultArgs,
        searchFunc: () => null,
        className: 'custom-class-name',
        sx: { border: '1px solid #d9d9d9' },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            example: <Example {...args} />,
            customProps: {},
            customCode: DefaultExampleCode,
        }),
};
