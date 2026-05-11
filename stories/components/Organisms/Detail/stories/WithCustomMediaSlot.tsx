import React, { useEffect, useRef, useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import WithCustomMediaSlotExampleCode from './code/WithCustomMediaSlotExample.tsx?raw';
import { Detail, DetailDescriptionItemFieldType } from '../../../../../src/index.js';

type Story = StoryObj<typeof Detail>;

const VIDEO_SRC = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';

interface HoverVideoPreviewProps {
    src: string;
    isPlaying: boolean;
    objectFit?: React.CSSProperties['objectFit'];
}

function HoverVideoPreview({
    src,
    isPlaying,
    objectFit = 'cover',
    ...rest
}: HoverVideoPreviewProps): React.JSX.Element {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            void video.play().catch(() => {
                // autoplay can be blocked; ignored for POC
            });
        } else {
            video.pause();
            video.currentTime = 0;
            setProgress(0);
        }
    }, [isPlaying]);

    const handleTimeUpdate = (): void => {
        const video = videoRef.current;
        if (!video?.duration) return;
        setProgress(video.currentTime / video.duration);
    };

    return (
        <Box {...rest} sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <video
                ref={videoRef}
                muted={true}
                playsInline={true}
                onTimeUpdate={handleTimeUpdate}
                style={{ width: '100%', height: '100%', objectFit, display: 'block' }}
            >
                <source src={src} type="video/mp4" />
            </video>
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    pointerEvents: 'none',
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        width: `${progress * 100}%`,
                        backgroundColor: 'primary.main',
                        transition: 'width 0.1s linear',
                    }}
                />
            </Box>
        </Box>
    );
}

const Example = (): React.JSX.Element => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Box display={'flex'} justifyContent={'center'}>
            <Detail
                main={{
                    title: 'Big Buck Bunny — sample clip',
                    onCloseClick: (): void => undefined,
                    mediaProps: {
                        ratio: '16/9',
                        objectFit: 'cover',
                        slots: {
                            media: <HoverVideoPreview src={VIDEO_SRC} isPlaying={isHovered} />,
                        },
                        slotProps: {
                            card: {
                                onMouseEnter: (): void => setIsHovered(true),
                                onMouseLeave: (): void => setIsHovered(false),
                            },
                        },
                    },
                }}
                descriptionItems={[
                    {
                        sectionTitle: 'METADATA',
                        fields: [
                            { name: 'DURATION', value: '00:10' },
                            { name: 'FORMAT', value: '1080p · H.264' },
                            {
                                name: 'TAGS',
                                type: DetailDescriptionItemFieldType.CHIPS,
                                value: ['preview', 'sample', 'animated'],
                            },
                        ],
                    },
                ]}
            />
        </Box>
    );
};

export const WithCustomMediaSlot: Story = {
    name: 'With Custom Media Slot',
    parameters: {
        docs: {
            description: {
                story:
                    'Detail use-case: custom `<HoverVideoPreview>` is passed via `main.mediaProps.slots.media`. ' +
                    'Hover events on the surrounding `<Card>` are captured via `main.mediaProps.slotProps.card.onMouseEnter/Leave` ' +
                    'and toggle `isPlaying`. The preview component plays/resets the video and renders an overlaid progress bar at the bottom.\n\n' +
                    '**Limitation — full-screen preview:** when `slots.media` is provided, the built-in LightBox / fullscreen preview ' +
                    'is suppressed (the slot replaces the default `<CardMedia>`, and `LightBox` only handles still images, not arbitrary ' +
                    'React nodes). Passing `image` and `imageFullScreenPreview` alongside `slots.media` no longer mounts the LightBox ' +
                    'or renders the zoom/download bottom-icons row. To support a custom full-screen viewer for video, render your own ' +
                    'modal triggered through `slotProps.card` (e.g. `onContextMenu` or a separate button) — `slots.fullScreenContent` ' +
                    'as a first-class slot may be added in a follow-up.',
            },
        },
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention -- render args unused (story is self-contained); underscore-prefixed param marks intent
    render: (_args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: WithCustomMediaSlotExampleCode,
            example: <Example />,
        }),
};
