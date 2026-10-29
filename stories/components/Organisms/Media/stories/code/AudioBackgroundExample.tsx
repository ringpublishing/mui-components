import React from 'react';
import { Media } from '@ringpublishing/mui-components';

export default function AudioBackgroundExample(): React.JSX.Element {
    return (
        <Media
            sx={{ width: 400 }}
            type="Audio"
            title="Morning ambience"
            description="Author / Source"
            ratio="7/1"
            slotProps={{
                media: {
                    component: 'audio',
                    src: 'https://cdn.pixabay.com/audio/2024/03/07/audio_5f609b17c4.mp3',
                    controls: true,
                    sx: { backgroundColor: 'components.media.backgroundFill' },
                },
            }}
        />
    );
}
