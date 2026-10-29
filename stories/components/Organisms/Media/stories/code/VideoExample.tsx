import React from 'react';
import { Media } from '@ringpublishing/mui-components';

export default function VideoExample(): React.JSX.Element {
    return (
        <Media
            sx={{ width: 400 }}
            type="Video"
            title="Big Buck Bunny"
            description="Author / Source"
            ratio="16/9"
            slotProps={{
                media: {
                    component: 'video',
                    src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
                    controls: true,
                    autoPlay: true,
                    muted: true,
                },
            }}
        />
    );
}
