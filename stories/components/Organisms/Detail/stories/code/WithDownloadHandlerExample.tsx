import React, { useState } from 'react';
import { Detail, type Image } from '@ringpublishing/mui-components';
import { Box, Button, Stack } from '@mui/material';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithDownloadHandlerExample(): React.JSX.Element {
    const [showDownload, setShowDownload] = useState(true);

    const handleImageDownload = (image: Image | string): void => {
        // Replace with your own logic (tracking, custom endpoint, etc.)
        // eslint-disable-next-line no-console
        console.log('Custom download handler', image);
    };

    return (
        <Stack spacing={2} alignItems="center">
            <Button variant="outlined" onClick={(): void => setShowDownload((value) => !value)}>
                {showDownload ? 'Hide download icon' : 'Show download icon'}
            </Button>
            <Box display={'flex'} justifyContent={'center'}>
                <Detail
                    main={{
                        title: 'Custom download handling',
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
                        },
                    }}
                />
            </Box>
        </Stack>
    );
}
