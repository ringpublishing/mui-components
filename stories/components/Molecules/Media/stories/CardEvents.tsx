import React, { useEffect, useRef, useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import CardEventsExampleCode from './code/CardEventsExample.tsx?raw';
import { Media } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Media>;

const VIDEO_SRC = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';

const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isHovered) {
            void video.play().catch(() => {
                // autoplay can be blocked; ignored for the example
            });
        } else {
            video.pause();
            video.currentTime = 0;
        }
    }, [isHovered]);

    return (
        <Media
            {...args}
            slots={{
                media: (
                    <video
                        ref={videoRef}
                        muted={true}
                        playsInline={true}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    >
                        <source src={VIDEO_SRC} type="video/mp4" />
                    </video>
                ),
                ...args.slots,
            }}
            slotProps={{
                ...args.slotProps,
                card: {
                    ...args.slotProps?.card,
                    onMouseEnter: (): void => setIsHovered(true),
                    onMouseLeave: (): void => setIsHovered(false),
                },
            }}
        />
    );
};

export const CardEvents: Story = {
    args: {
        ...defaultArgs,
        title: 'Hover the card to play',
        ratio: '16/9',
        objectFit: 'cover',
        disableFullScreenPreview: true,
        sx: { width: '320px' },
        type: undefined,
    },
    parameters: {
        docs: {
            description: {
                story:
                    'Demonstrates how to attach **native MUI `<Card>` event handlers** to `Media` via `slotProps.card`. ' +
                    'Any prop accepted by the underlying `Card` component — `onMouseEnter`, `onMouseLeave`, `onFocus`, ' +
                    '`onKeyDown`, `onContextMenu`, `aria-*`, `data-*`, etc. — can be passed through `slotProps.card` and is ' +
                    'forwarded to the root `<Card>` element.\n\n' +
                    'Top-level `MediaProps` (`sx`) take precedence and are merged on top of `slotProps.card.sx`.\n\n' +
                    'In this story `onMouseEnter` / `onMouseLeave` toggle an `isHovered` state that drives `play()` / `pause()` ' +
                    'on a native `<video>` placed in `slots.media`. The combination shows the canonical pattern: custom media ' +
                    'via `slots`, hover-driven behaviour via `slotProps.card`.',
            },
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: CardEventsExampleCode,
            example: <Example {...args} />,
        }),
};
