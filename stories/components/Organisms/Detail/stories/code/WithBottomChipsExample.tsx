import React from 'react';
import { Detail } from '@ringpublishing/mui-components';
import { Box } from '@mui/material';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithBottomChipsExample(): React.JSX.Element {
    const main = {
        mediaProps: {
            bottomIcons: [
                {
                    type: 'chip' as const,
                    chip: {
                        label: 'Category',
                        variant: 'filled' as const,
                        size: 'small' as const,
                    },
                },
                {
                    type: 'chip' as const,
                    chip: {
                        label: 'Status: Active',
                        variant: 'filled' as const,
                        size: 'small' as const,
                    },
                    color: '#4CAF50',
                },
                {
                    type: 'chip' as const,
                    chip: {
                        label: 'Priority',
                        variant: 'filled' as const,
                        size: 'small' as const,
                    },
                    color: '#2196F3',
                },
                {
                    type: 'chip' as const,
                    chip: {
                        label: 'Default',
                        variant: 'filled' as const,
                        size: 'small' as const,
                    },
                },
                {
                    type: 'chip' as const,
                    chip: {
                        label: 'Warning',
                        variant: 'filled' as const,
                        size: 'small' as const,
                    },
                    color: '#FFC107',
                },
            ],
            imageFullScreenPreview: true,
            image: getImagePath(TestImage.STAIRS, ImageSize.LARGE),
            objectFit: 'cover' as const,
            ratio: '4/3',
        },
        title: 'Detail with Chips',
        onCloseClick: (): void => undefined,
    };

    const descriptionItems = [
        {
            sectionTitle: 'INFORMATION',
            fields: [
                {
                    name: 'Description',
                    value: 'This example showcases chips at the bottom of the media section with custom colors.',
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
