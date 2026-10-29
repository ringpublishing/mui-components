import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import WithAvatarExampleCode from './code/WithAvatarExample.tsx?raw';
import WithAvatarExample from './code/WithAvatarExample.js';

type Story = StoryObj<typeof Chip>;

export const WithAvatar: Story = {
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
            customCode: WithAvatarExampleCode,
            example: <WithAvatarExample />,
        });
    },
};
