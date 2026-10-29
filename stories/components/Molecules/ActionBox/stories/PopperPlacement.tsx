import type { StoryObj } from '@storybook/react-vite';

import { createCodeStory } from '../../../../helpers.js';
import PopperPlacementCode from './code/PopperPlacementExample.tsx?raw';
import PopperPlacementExample from './code/PopperPlacementExample.js';
import { ActionBox } from '../../../../../src/index.js';

type Story = StoryObj<typeof ActionBox>;

export const PopperPlacement: Story = {
    // Every placement is on the canvas at once, so there is nothing for the Controls panel to steer.
    parameters: { controls: { disable: true } },
    render: (args, context) => {
        return createCodeStory({
            context,
            customCode: PopperPlacementCode,
            example: <PopperPlacementExample />,
        });
    },
};
