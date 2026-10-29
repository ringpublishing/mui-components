import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import StatusLabelsExampleCode from './code/StatusLabelsExample.tsx?raw';
import StatusLabelsExample from './code/StatusLabelsExample.js';

type Story = StoryObj<typeof Chip>;

export const StatusLabels: Story = {
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
            customCode: StatusLabelsExampleCode,
            example: <StatusLabelsExample />,
        });
    },
};
