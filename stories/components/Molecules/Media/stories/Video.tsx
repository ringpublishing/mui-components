import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import VideoExampleCode from './code/VideoExample.tsx?raw';
import { Media } from '../../../../../src/index.js';

type Story = StoryObj<typeof Media>;

const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '50vw', marginLeft: '25vw' }}>
        <Media {...args} />
    </Box>
);

export const Video: Story = {
    args: {
        title: 'Big Buck Bunny',
        ratio: '16/9',
        slotProps: {
            media: {
                component: 'video',
                src: 'https://www.w3schools.com/html/mov_bbb.mp4',
                controls: true,
                autoPlay: true,
                muted: true,
            },
        },
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example {...args} />;
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: VideoExampleCode,
            example: <Example {...args} />,
        });
    },
};
