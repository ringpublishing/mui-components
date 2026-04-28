import React from 'react';
import { Detail } from '@ringpublishing/mui-components';
import { Box } from '@mui/material';
import { EditOutlined, InfoOutlined, PrintOutlined, UploadOutlined } from '@mui/icons-material';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithBottomIconButtonsExample(): React.JSX.Element {
    const main = {
        mediaProps: {
            bottomIcons: [
                {
                    type: 'icon' as const,
                    icon: <InfoOutlined />,
                    onClick: (): void => undefined,
                    tooltip: 'Information',
                },
                {
                    type: 'icon' as const,
                    icon: <EditOutlined />,
                    onClick: (): void => undefined,
                    tooltip: 'Edit',
                },
                {
                    type: 'icon' as const,
                    icon: <PrintOutlined />,
                    onClick: (): void => undefined,
                    tooltip: 'Print',
                },
                {
                    type: 'icon' as const,
                    icon: <UploadOutlined />,
                    onClick: (): void => undefined,
                    tooltip: 'Upload',
                },
            ],
            imageFullScreenPreview: true,
            image: getImagePath(TestImage.APARTMENT, ImageSize.LARGE),
            objectFit: 'cover' as const,
            ratio: '4/3',
        },
        title: 'Detail with Icon Buttons',
        onCloseClick: (): void => undefined,
    };

    const descriptionItems = [
        {
            sectionTitle: 'INFORMATION',
            fields: [
                {
                    name: 'Description',
                    value: 'This example showcases icon buttons at the bottom of the media section.',
                },
            ],
        },
    ];
    return (
        <Box display={'flex'} justifyContent={'center'}>
            <Detail main={main} descriptionItems={descriptionItems} />
        </Box>
    );
}
