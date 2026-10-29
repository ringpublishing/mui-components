import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import SelectedExampleCode from './code/SelectedExample.tsx?raw';
import SelectedExample from './code/SelectedExample.js';

type Story = StoryObj<typeof Chip>;

export const Selected: Story = {
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
            customCode: SelectedExampleCode,
            example: <SelectedExample />,
        });
    },
};
