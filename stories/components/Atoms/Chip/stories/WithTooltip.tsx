import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import WithTooltipExampleCode from './code/WithTooltipExample.tsx?raw';
import WithTooltipExample from './code/WithTooltipExample.js';

type Story = StoryObj<typeof Chip>;

export const WithTooltip: Story = {
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
            customCode: WithTooltipExampleCode,
            example: <WithTooltipExample />,
        });
    },
};
