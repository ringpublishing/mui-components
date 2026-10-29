import { ListFilter, EllipsisVertical } from 'lucide-react';
import { IconButton } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import React from 'react';
import { DEFAULT_LUCIDE_ICON_SIZE, RingLucideIcon, SearchBar } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import ClassSelectorChildrenStackExampleCode from './code/ClassSelectorChildrenStackExample.tsx?raw';

type Story = StoryObj<typeof SearchBar>;

const Example = (args: React.ComponentProps<typeof SearchBar>): React.JSX.Element => {
    return (
        <SearchBar {...args}>
            <IconButton key={0}>
                <RingLucideIcon icon={ListFilter} sx={{ fontSize: DEFAULT_LUCIDE_ICON_SIZE, color: 'primary.main' }} />
            </IconButton>
            <IconButton key={1}>
                <EllipsisVertical />
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
            border: 1,
            borderColor: 'divider',
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
