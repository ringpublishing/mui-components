import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { VideocamOutlined } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import SlotsExampleCode from './code/SlotsExample.tsx?raw';
import { MediaCard } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof MediaCard>;

const Example = (args: React.ComponentProps<typeof MediaCard>): React.JSX.Element => {
    return <MediaCard {...args} />;
};

export const Slots: Story = {
    args: {
        ...defaultArgs,
        slots: {
            mediaCard: (
                <video controls={true}>
                    <source
                        src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4"
                        type="video/mp4"
                    />
                </video>
            ),
        },
        iconPlaceholder: <VideocamOutlined />,
        objectFit: 'cover',
        ratio: '3/2',
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: SlotsExampleCode,
            example: <Example {...args} />,
        }),
};
