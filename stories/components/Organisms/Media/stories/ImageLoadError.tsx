import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { BROKEN_IMAGE_URL, loggedMedia } from '../common/presets.js';
import { createCodeStory } from '../../../../helpers.js';
import ImageLoadErrorExampleCode from './code/ImageLoadErrorExample.tsx?raw';
import { Media } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Media>;

// The media element's events are logged in the Actions tab.
const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => (
    <Media {...args} slotProps={{ ...args.slotProps, media: loggedMedia(args.slotProps?.media) }} />
);

export const ImageLoadError: Story = {
    args: {
        ...defaultArgs,
        image: BROKEN_IMAGE_URL,
        title: 'An image that failed to load',
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: ImageLoadErrorExampleCode,
            example: <Example {...args} />,
        });
    },
};
