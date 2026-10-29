import type { StoryObj } from '@storybook/react-vite';

import { createCodeStory } from '../../../../helpers.js';
import FocusAfterActionCode from './code/FocusAfterActionExample.tsx?raw';
import FocusAfterActionExample from './code/FocusAfterActionExample.js';
import { ActionBox } from '../../../../../src/index.js';

type Story = StoryObj<typeof ActionBox>;

export const FocusAfterAction: Story = {
    parameters: { controls: { disable: true } },
    render: (args, context) => {
        return createCodeStory({
            context,
            customCode: FocusAfterActionCode,
            example: <FocusAfterActionExample />,
        });
    },
};
