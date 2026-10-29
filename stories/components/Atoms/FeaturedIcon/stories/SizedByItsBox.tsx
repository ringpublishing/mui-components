import type { StoryObj } from '@storybook/react-vite';
import { FeaturedIcon } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import SizedByItsBoxExampleCode from './code/SizedByItsBoxExample.tsx?raw';
import SizedByItsBoxExample from './code/SizedByItsBoxExample.js';

type Story = StoryObj<typeof FeaturedIcon>;

export const SizedByItsBox: Story = {
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: SizedByItsBoxExampleCode,
            example: <SizedByItsBoxExample />,
        });
    },
};
