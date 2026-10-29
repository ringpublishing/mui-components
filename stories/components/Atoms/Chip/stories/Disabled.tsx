import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import DisabledExampleCode from './code/DisabledExample.tsx?raw';
import DisabledExample from './code/DisabledExample.js';

type Story = StoryObj<typeof Chip>;

export const Disabled: Story = {
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
            customCode: DisabledExampleCode,
            example: <DisabledExample />,
        });
    },
};
