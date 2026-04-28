import React from 'react';
import { Media } from '@ringpublishing/mui-components';

export default function VideoExample(): React.JSX.Element {
    return (
        <Media
            title="Big Buck Bunny"
            ratio="16/9"
            slotProps={{
                media: {
                    component: 'video',
                    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
                    controls: true,
                    autoPlay: true,
                    muted: true,
                },
            }}
        />
    );
}
