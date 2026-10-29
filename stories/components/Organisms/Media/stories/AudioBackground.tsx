import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { AUDIO_SRC, loggedMedia } from '../common/presets.js';
import { createCodeStory } from '../../../../helpers.js';
import AudioBackgroundExampleCode from './code/AudioBackgroundExample.tsx?raw';
import { Media } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Media>;

// The media element's events are logged in the Actions tab.
const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => (
    <Media {...args} slotProps={{ ...args.slotProps, media: loggedMedia(args.slotProps?.media) }} />
);

export const AudioBackground: Story = {
    args: {
        ...defaultArgs,
        image: undefined,
        type: 'Audio',
        title: 'Morning ambience',
        ratio: '7/1',
        slotProps: {
            media: {
                component: 'audio',
                src: AUDIO_SRC,
                controls: true,
                sx: { backgroundColor: 'components.media.backgroundFill' },
            },
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: AudioBackgroundExampleCode,
            example: <Example {...args} />,
        });
    },
};
