import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import StatesExampleCode from './code/StatesExample.tsx?raw';
import StatesExample from './code/StatesExample.js';

type Story = StoryObj<typeof Chip>;

export const States: Story = {
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
            customCode: StatesExampleCode,
            example: <StatesExample />,
        });
    },
};
