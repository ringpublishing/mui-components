import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import SizesExampleCode from './code/SizesExample.tsx?raw';
import SizesExample from './code/SizesExample.js';

type Story = StoryObj<typeof Chip>;

export const Sizes: Story = {
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
            customCode: SizesExampleCode,
            example: <SizesExample />,
        });
    },
};
