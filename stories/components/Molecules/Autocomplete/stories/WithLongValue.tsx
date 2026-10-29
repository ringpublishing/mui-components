import type { StoryObj } from '@storybook/react-vite';

import { Autocomplete } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import WithLongValueExampleCode from './code/WithLongValueExample.tsx?raw';
import WithLongValueExample from './code/WithLongValueExample.js';

type Story = StoryObj<typeof Autocomplete>;

// Renders the snippet it shows, so the canvas and the code cannot drift apart.
export const WithLongValue: Story = {
    parameters: {
        controls: {
            disable: true,
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: WithLongValueExampleCode,
            example: <WithLongValueExample />,
        }),
};
