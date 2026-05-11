import React, { useEffect, useRef, useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { OndemandVideoOutlined } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import CardEventsExampleCode from './code/CardEventsExample.tsx?raw';
import { MediaCard } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof MediaCard>;

const VIDEO_SRC = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';

const Example = (args: React.ComponentProps<typeof MediaCard>): React.JSX.Element => {
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
        <MediaCard
            {...args}
            slots={{
                mediaCard: (
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
        hoverable: true,
        iconPlaceholder: <OndemandVideoOutlined />,
        sx: { width: '320px' },
    },
    parameters: {
        docs: {
            description: {
                story:
                    'Demonstrates how to attach **native MUI `<Card>` event handlers** to a `MediaCard` via `slotProps.card`. ' +
                    'Any prop accepted by the underlying `Card` component — `onMouseEnter`, `onMouseLeave`, `onFocus`, `onBlur`, ' +
                    '`onKeyDown`, `onContextMenu`, `aria-*`, `data-*`, etc. — can be passed through `slotProps.card` and is ' +
                    'forwarded to the root `<Card>` element.\n\n' +
                    'Top-level `MediaCardProps` (`variant`, `square`, `tabIndex`, `onClick`, `className`, `sx`) take precedence ' +
                    'and are merged on top, so they always win over conflicting values in `slotProps.card`.\n\n' +
                    'In this story `onMouseEnter` / `onMouseLeave` toggle an `isHovered` state that drives `play()` / `pause()` ' +
                    'on a native `<video>` placed in `slots.mediaCard`. The combination shows the canonical pattern: custom media ' +
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
