import React from 'react';
import { Media } from '@ringpublishing/mui-components';

export default function AudioWithBackgroundExample(): React.JSX.Element {
    return (
        <Media
            title="Audio example"
            ratio="18/1"
            slotProps={{
                media: {
                    component: 'audio',
                    src: 'https://cdn.pixabay.com/audio/2024/03/07/audio_5f609b17c4.mp3',
                    controls: true,
                    sx: {
                        backgroundColor: '#e5e5e5',
                    },
                },
            }}
        />
    );
}
