import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { VIDEO_SRC, loggedMedia } from '../common/presets.js';
import { createCodeStory } from '../../../../helpers.js';
import VideoExampleCode from './code/VideoExample.tsx?raw';
import { Media } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Media>;

// The media element's events are logged in the Actions tab.
const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => (
    <Media {...args} slotProps={{ ...args.slotProps, media: loggedMedia(args.slotProps?.media) }} />
);

export const Video: Story = {
    args: {
        ...defaultArgs,
        image: undefined,
        type: 'Video',
        title: 'Big Buck Bunny',
        ratio: '16/9',
        slotProps: {
            media: { component: 'video', src: VIDEO_SRC, controls: true, autoPlay: true, muted: true },
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: VideoExampleCode,
            example: <Example {...args} />,
        });
    },
};
