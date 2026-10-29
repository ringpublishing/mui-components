import type { StoryObj } from '@storybook/react-vite';
import { FeaturedIcon } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import SizesExampleCode from './code/SizesExample.tsx?raw';
import SizesExample from './code/SizesExample.js';

type Story = StoryObj<typeof FeaturedIcon>;

export const Sizes: Story = {
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: SizesExampleCode,
            example: <SizesExample />,
        });
    },
};
