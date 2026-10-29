import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import DeletableExampleCode from './code/DeletableExample.tsx?raw';
import DeletableExample from './code/DeletableExample.js';

type Story = StoryObj<typeof Chip>;

export const Deletable: Story = {
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
            customCode: DeletableExampleCode,
            example: <DeletableExample />,
        });
    },
};
