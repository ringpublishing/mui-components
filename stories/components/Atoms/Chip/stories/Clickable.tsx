import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import ClickableExampleCode from './code/ClickableExample.tsx?raw';
import ClickableExample from './code/ClickableExample.js';

type Story = StoryObj<typeof Chip>;

export const Clickable: Story = {
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
            customCode: ClickableExampleCode,
            example: <ClickableExample />,
        });
    },
};
