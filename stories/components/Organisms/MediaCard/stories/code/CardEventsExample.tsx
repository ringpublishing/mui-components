import React, { useEffect, useRef, useState } from 'react';
import { MediaCard } from '@ringpublishing/mui-components';
import { OndemandVideoOutlined } from '@mui/icons-material';

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
        <MediaCard
            sx={{ width: '320px' }}
            title="Hover the card to play"
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
            }}
            iconPlaceholder={<OndemandVideoOutlined />}
            ratio="16/9"
            hoverable={true}
            slotProps={{
                card: {
                    onMouseEnter: (): void => setIsHovered(true),
                    onMouseLeave: (): void => setIsHovered(false),
                },
            }}
        />
    );
}
