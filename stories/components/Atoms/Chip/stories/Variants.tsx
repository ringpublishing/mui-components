import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import VariantsExampleCode from './code/VariantsExample.tsx?raw';
import VariantsExample from './code/VariantsExample.js';

type Story = StoryObj<typeof Chip>;

export const Variants: Story = {
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
            customCode: VariantsExampleCode,
            example: <VariantsExample />,
        });
    },
};
