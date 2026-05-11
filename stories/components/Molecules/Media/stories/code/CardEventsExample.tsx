import React, { useEffect, useRef, useState } from 'react';
import { Media } from '@ringpublishing/mui-components';

const VIDEO_SRC = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';

export default function CardEventsExample(): React.JSX.Element {
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
            sx={{ width: '320px' }}
            title="Hover the card to play"
            ratio="16/9"
            objectFit="cover"
            disableFullScreenPreview={true}
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
            }}
            slotProps={{
                card: {
                    onMouseEnter: (): void => setIsHovered(true),
                    onMouseLeave: (): void => setIsHovered(false),
                },
            }}
        />
    );
}
