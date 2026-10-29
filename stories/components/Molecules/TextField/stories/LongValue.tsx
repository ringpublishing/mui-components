import type { StoryObj } from '@storybook/react-vite';

import { TextField } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import LongValueExampleCode from './code/LongValueExample.tsx?raw';
import LongValueExample from './code/LongValueExample.js';

type Story = StoryObj<typeof TextField>;

// Renders the snippet it shows, so the canvas and the code cannot drift apart.
export const LongValue: Story = {
    parameters: {
        controls: {
            disable: true,
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: LongValueExampleCode,
            example: <LongValueExample />,
        }),
};
