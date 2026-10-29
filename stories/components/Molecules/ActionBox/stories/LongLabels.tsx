import type { StoryObj } from '@storybook/react-vite';

import { createCodeStory } from '../../../../helpers.js';
import LongLabelsCode from './code/LongLabelsExample.tsx?raw';
import LongLabelsExample from './code/LongLabelsExample.js';
import { ActionBox } from '../../../../../src/index.js';

type Story = StoryObj<typeof ActionBox>;

export const LongLabels: Story = {
    parameters: { controls: { disable: true } },
    render: (args, context) => {
        return createCodeStory({
            context,
            customCode: LongLabelsCode,
            example: <LongLabelsExample />,
        });
    },
};
