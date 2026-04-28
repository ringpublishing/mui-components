import React from 'react';
import { MediaCard } from '@ringpublishing/mui-components';
import { VideocamOutlined } from '@mui/icons-material';

export default function SlotsExample(): React.JSX.Element {
    return (
        <MediaCard
            sx={{ width: '300px' }}
            title="Title / name"
            slots={{
                mediaCard: (
                    <video controls={true}>
                        <source
                            src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4"
                            type="video/mp4"
                        />
                    </video>
                ),
            }}
            iconPlaceholder={<VideocamOutlined />}
            ratio="16/9"
            objectFit="cover"
        />
    );
}
