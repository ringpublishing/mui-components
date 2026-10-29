import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import SemanticColorsExampleCode from './code/SemanticColorsExample.tsx?raw';
import SemanticColorsExample from './code/SemanticColorsExample.js';

type Story = StoryObj<typeof Chip>;

export const SemanticColors: Story = {
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
            customCode: SemanticColorsExampleCode,
            example: <SemanticColorsExample />,
        });
    },
};
