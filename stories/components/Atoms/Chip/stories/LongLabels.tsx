import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import LongLabelsExampleCode from './code/LongLabelsExample.tsx?raw';
import LongLabelsExample from './code/LongLabelsExample.js';

type Story = StoryObj<typeof Chip>;

export const LongLabels: Story = {
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
            customCode: LongLabelsExampleCode,
            example: <LongLabelsExample />,
        });
    },
};
