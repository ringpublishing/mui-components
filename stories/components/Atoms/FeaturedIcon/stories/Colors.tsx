import type { StoryObj } from '@storybook/react-vite';
import { FeaturedIcon } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import ColorsExampleCode from './code/ColorsExample.tsx?raw';
import ColorsExample from './code/ColorsExample.js';

type Story = StoryObj<typeof FeaturedIcon>;

export const Colors: Story = {
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: ColorsExampleCode,
            example: <ColorsExample />,
        });
    },
};
