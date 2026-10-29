import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import EmptyStateCustomLabelsExampleCode from './code/EmptyStateCustomLabelsExample.tsx?raw';
import { MultimediaGrid } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof MultimediaGrid>;

const Example = (args: React.ComponentProps<typeof MultimediaGrid>): React.JSX.Element => <MultimediaGrid {...args} />;

export const EmptyStateCustomLabels: Story = {
    args: {
        ...defaultArgs,
        showRingToolbar: true,
        items: [],
        totalRowCount: 0,
        loading: false,
        placeholderLabels: {
            empty: {
                header: 'Your library is empty',
                description: 'Upload your first asset to see it appear here.',
            },
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: EmptyStateCustomLabelsExampleCode,
            example: <Example {...args} />,
        });
    },
    parameters: {
        withLanguageSupport: true,
    },
};
