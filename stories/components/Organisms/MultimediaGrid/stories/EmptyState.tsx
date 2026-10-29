import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import EmptyStateExampleCode from './code/EmptyStateExample.tsx?raw';
import { MultimediaGrid } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof MultimediaGrid>;

const Example = (args: React.ComponentProps<typeof MultimediaGrid>): React.JSX.Element => <MultimediaGrid {...args} />;

export const EmptyState: Story = {
    args: {
        ...defaultArgs,
        showRingToolbar: true,
        items: [],
        totalRowCount: 0,
        loading: false,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: EmptyStateExampleCode,
            example: <Example {...args} />,
        });
    },
    parameters: {
        withLanguageSupport: true,
    },
};
