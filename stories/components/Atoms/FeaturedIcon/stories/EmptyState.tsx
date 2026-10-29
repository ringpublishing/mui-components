import type { StoryObj } from '@storybook/react-vite';
import { FeaturedIcon } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import EmptyStateExampleCode from './code/EmptyStateExample.tsx?raw';
import EmptyStateExample from './code/EmptyStateExample.js';

type Story = StoryObj<typeof FeaturedIcon>;

export const EmptyState: Story = {
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: EmptyStateExampleCode,
            example: <EmptyStateExample />,
        });
    },
};
