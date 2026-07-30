import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import EmptyStateCustomLabelsExampleCode from './code/EmptyStateCustomLabelsExample.tsx?raw';
import { Detail } from '../../../../../src/index.js';

type Story = StoryObj<typeof Detail>;

function Example(args: React.ComponentProps<typeof Detail>): React.JSX.Element {
    return <Detail {...args} />;
}

export const EmptyStateCustomLabels: Story = {
    args: {
        empty: true,
        placeholderLabels: {
            empty: {
                header: 'No item selected',
                description: 'Choose one of the entries from the list to inspect its details.',
                footer: 'Need help? Contact your administrator.',
            },
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {
                Box,
            },
            customCode: EmptyStateCustomLabelsExampleCode,
            example: <Example {...args} />,
        });
    },
};
