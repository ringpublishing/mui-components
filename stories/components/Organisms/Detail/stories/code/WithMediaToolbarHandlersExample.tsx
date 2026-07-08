import React, { useState } from 'react';
import { Detail, type Image } from '@ringpublishing/mui-components';
import { Box, Button, Stack } from '@mui/material';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithMediaToolbarHandlersExample(): React.JSX.Element {
    const [showDownload, setShowDownload] = useState(true);

    const handleImageDownload = (image: Image | string): void => {
        // Replace with your own logic (tracking, custom endpoint, etc.)
        // eslint-disable-next-line no-console
        console.log('Custom download handler', image);
    };

    const handleFullScreenPreview = (image: Image | string): void => {
        // Open your own viewer instead of the built-in LightBox.
        // eslint-disable-next-line no-console
        console.log('Custom full-screen preview handler', image);
    };

    return (
        <Stack spacing={2} alignItems="center">
            <Button variant="outlined" onClick={(): void => setShowDownload((value) => !value)}>
                {showDownload ? 'Hide download icon' : 'Show download icon'}
            </Button>
            <Box display={'flex'} justifyContent={'center'}>
                <Detail
                    main={{
                        title: 'Custom media toolbar handlers',
                        onCloseClick: (): void => undefined,
                        mediaProps: {
                            ratio: '4/3',
                            objectFit: 'cover',
                            imageFullScreenPreview: true,
                            image: {
                                src: getImagePath(TestImage.CAR, ImageSize.LARGE),
                                title: TestImage.CAR,
                            },
                            enableDownloadIcon: showDownload,
                            handleImageDownload,
                            handleFullScreenPreview,
                        },
                    }}
                />
            </Box>
        </Stack>
    );
}
