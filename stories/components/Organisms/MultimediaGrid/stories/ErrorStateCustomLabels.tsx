import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import ErrorStateCustomLabelsExampleCode from './code/ErrorStateCustomLabelsExample.tsx?raw';
import { MultimediaGrid } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof MultimediaGrid>;

const Example = (args: React.ComponentProps<typeof MultimediaGrid>): React.JSX.Element => <MultimediaGrid {...args} />;

export const ErrorStateCustomLabels: Story = {
    args: {
        ...defaultArgs,
        showRingToolbar: true,
        error: true,
        items: [],
        totalRowCount: 0,
        loading: false,
        refreshItems: () => undefined,
        placeholderLabels: {
            error: {
                header: 'We could not load your media',
                description: 'Something went wrong on our side. Retry, or contact support if it keeps happening.',
            },
            tryAgainButton: 'Retry',
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: ErrorStateCustomLabelsExampleCode,
            example: <Example {...args} />,
        });
    },
    parameters: {
        withLanguageSupport: true,
    },
};
