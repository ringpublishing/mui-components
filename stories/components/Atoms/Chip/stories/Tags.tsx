import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import TagsExampleCode from './code/TagsExample.tsx?raw';
import TagsExample from './code/TagsExample.js';

type Story = StoryObj<typeof Chip>;

export const Tags: Story = {
    parameters: {
        controls: {
            disable: true,
        },
    },
    tags: ['!dev'],
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: TagsExampleCode,
            example: <TagsExample />,
        });
    },
};
