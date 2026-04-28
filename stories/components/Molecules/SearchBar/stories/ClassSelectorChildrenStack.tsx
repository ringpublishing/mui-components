import { FilterList, MoreVert } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import React from 'react';
import { SearchBar } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import ClassSelectorChildrenStackExampleCode from './code/ClassSelectorChildrenStackExample.tsx?raw';

type Story = StoryObj<typeof SearchBar>;

const Example = (args: React.ComponentProps<typeof SearchBar>): React.JSX.Element => {
    return (
        <SearchBar {...args}>
            <IconButton key={0}>
                <FilterList sx={{ color: 'primary.main' }} />
            </IconButton>
            <IconButton key={1}>
                <MoreVert />
            </IconButton>
        </SearchBar>
    );
};

export const ClassSelectorChildrenStack: Story = {
    args: {
        ...defaultArgs,
        searchFunc: () => null,
        sx: {
            width: '450px',
            border: '1px solid #d9d9d9',
            '.ring-search-bar-children-stack': {
                justifyContent: 'space-between',
                width: '50%',
            },
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: ClassSelectorChildrenStackExampleCode,
            example: <Example {...args} />,
        });
    },
};
