import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import ErrorStateExampleCode from './code/ErrorStateExample.tsx?raw';
import { MultimediaGrid } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof MultimediaGrid>;

const Example = (args: React.ComponentProps<typeof MultimediaGrid>): React.JSX.Element => <MultimediaGrid {...args} />;

export const ErrorState: Story = {
    args: {
        ...defaultArgs,
        showRingToolbar: true,
        error: true,
        items: [],
        totalRowCount: 0,
        loading: false,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: ErrorStateExampleCode,
            example: <Example {...args} />,
        });
    },
    parameters: {
        withLanguageSupport: true,
    },
};
