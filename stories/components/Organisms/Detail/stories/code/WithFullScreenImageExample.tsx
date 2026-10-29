import React from 'react';
import { Detail } from '@ringpublishing/mui-components';
import { Box } from '@mui/material';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithFullScreenImageExample(): React.JSX.Element {
    return (
        <Box display={'flex'} justifyContent={'center'}>
            <Detail
                main={{
                    title: 'Full-screen image',
                    onCloseClick: (): void => undefined,
                    mediaProps: {
                        // Renders the thumbnail and is what the built-in LightBox shows. Required.
                        image: {
                            src: getImagePath(TestImage.BEACH, ImageSize.MEDIUM),
                            title: 'A person walking a dog on a rocky beach below white cliffs',
                        },
                        ratio: '16/9',
                        objectFit: 'cover',
                        // Shows the download and zoom buttons. Needs `image`.
                        imageFullScreenPreview: true,
                        // Downloaded instead of `image`. Does not render a thumbnail on its own.
                        fullScreenImageUrl: getImagePath(TestImage.BEACH, ImageSize.LARGE),
                    },
                }}
            />
        </Box>
    );
}
