import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { AccessAlarm } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import NoImageUrlExampleCode from './code/NoImageUrlExample.tsx?raw';
import { Media } from '../../../../../src/index.js';

type Story = StoryObj<typeof Media>;

const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '50vw', marginLeft: '25vw' }}>
        <Media {...args} />
    </Box>
);

export const NoImageUrl: Story = {
    args: {
        title: 'No image title',
        ratio: '16/9',
        statusLabels: [{ label: 'Label 1', color: 'primary', icon: <AccessAlarm /> }],
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example {...args} />;
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: NoImageUrlExampleCode,
            example: <Example {...args} />,
        });
    },
};
