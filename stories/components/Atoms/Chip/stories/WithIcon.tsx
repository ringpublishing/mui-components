import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import WithIconExampleCode from './code/WithIconExample.tsx?raw';
import WithIconExample from './code/WithIconExample.js';

type Story = StoryObj<typeof Chip>;

export const WithIcon: Story = {
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
            customCode: WithIconExampleCode,
            example: <WithIconExample />,
        });
    },
};
