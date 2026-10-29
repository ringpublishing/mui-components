import type { StoryObj } from '@storybook/react-vite';

import { SearchBox } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import SizesExampleCode from './code/SizesExample.tsx?raw';
import SizesExample from './code/SizesExample.js';

type Story = StoryObj<typeof SearchBox>;

// Renders the snippet it shows, so the canvas and the code cannot drift apart.
export const Sizes: Story = {
    parameters: {
        controls: {
            disable: true,
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: SizesExampleCode,
            example: <SizesExample />,
        }),
};
