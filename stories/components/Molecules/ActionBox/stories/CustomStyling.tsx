import type { StoryObj } from '@storybook/react-vite';

import { createCodeStory } from '../../../../helpers.js';
import CustomStylingCode from './code/CustomStylingExample.tsx?raw';
import CustomStylingExample from './code/CustomStylingExample.js';
import { ActionBox } from '../../../../../src/index.js';

type Story = StoryObj<typeof ActionBox>;

export const CustomStyling: Story = {
    // The styles live in the example's code, which the Controls panel cannot reach.
    parameters: { controls: { disable: true } },
    render: (args, context) => {
        return createCodeStory({
            context,
            customCode: CustomStylingCode,
            example: <CustomStylingExample />,
        });
    },
};
