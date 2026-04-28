import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import AudioExampleCode from './code/AudioExample.tsx?raw';
import { Media } from '../../../../../src/index.js';

type Story = StoryObj<typeof Media>;

const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '50vw',
            marginLeft: '25vw',
        }}
    >
        <Media {...args} />
    </Box>
);

export const Audio: Story = {
    args: {
        title: 'Audio example',
        ratio: '18/1',
        slotProps: {
            media: {
                component: 'audio',
                src: 'https://cdn.pixabay.com/audio/2024/03/07/audio_5f609b17c4.mp3',
                controls: true,
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
            customCode: AudioExampleCode,
            example: <Example {...args} />,
        });
    },
};
