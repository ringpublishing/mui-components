import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import EmptyStateExampleCode from './code/EmptyStateExample.tsx?raw';
import { Detail } from '../../../../../src/index.js';

type Story = StoryObj<typeof Detail>;

const Example = (args: React.ComponentProps<typeof Detail>): React.JSX.Element => {
    return <Detail {...args} />;
};

export const EmptyState: Story = {
    args: {
        empty: true,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: EmptyStateExampleCode,
            example: <Example {...args} />,
        });
    },
};
