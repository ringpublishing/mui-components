import React from 'react';
import { Media } from '@ringpublishing/mui-components';

const FALLBACK_SRC = 'https://example.com/images/fallback.jpg';

export default function ImageLoadErrorFallbackExample(): React.JSX.Element {
    return (
        <Media
            sx={{ width: 400 }}
            image="https://example.invalid/missing-photo.jpg"
            type="Photo"
            title="An image replaced by a fallback"
            description="Author / Source"
            ratio="3/2"
            slotProps={{
                media: {
                    onError: (event): void => {
                        const image = event.currentTarget as HTMLImageElement;

                        // Try the fallback once; if it fails too, let the placeholder take over.
                        if (image.src !== FALLBACK_SRC) {
                            event.preventDefault();
                            image.src = FALLBACK_SRC;
                        }
                    },
                },
            }}
        />
    );
}
