import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { BROKEN_IMAGE_URL } from '../common/presets.js';
import { createCodeStory } from '../../../../helpers.js';
import ImageLoadErrorFallbackExampleCode from './code/ImageLoadErrorFallbackExample.tsx?raw';
import { Media } from '../../../../../src/index.js';
import { getImagePath, ImageSize, TestImage } from '../../../../helpers/imagesData.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Media>;

const FALLBACK_SRC = new URL(getImagePath(TestImage.BEACH, ImageSize.LARGE), window.location.href).href;

// Each failure and the swap to the fallback are logged in the Actions tab.
const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => (
    <Media
        {...args}
        slotProps={{
            ...args.slotProps,
            media: {
                ...args.slotProps?.media,
                onLoad: (event): void =>
                    action('slotProps.media.onLoad')((event.currentTarget as HTMLImageElement).currentSrc),
                onError: (event): void => {
                    const image = event.currentTarget as HTMLImageElement;

                    action('slotProps.media.onError')(image.currentSrc || image.src);

                    if (image.src !== FALLBACK_SRC) {
                        event.preventDefault();
                        image.src = FALLBACK_SRC;
                    }
                },
            },
        }}
    />
);

export const ImageLoadErrorFallback: Story = {
    args: {
        ...defaultArgs,
        image: BROKEN_IMAGE_URL,
        title: 'An image replaced by a fallback',
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: ImageLoadErrorFallbackExampleCode,
            example: <Example {...args} />,
        });
    },
};
