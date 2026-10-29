import React from 'react';
import {
    Detail,
    DetailDescriptionItemFieldType,
    DetailDescriptionItem,
    DetailBottomAction,
} from '@ringpublishing/mui-components';
import { Box } from '@mui/material';
import { Download, Pencil, Info, Printer, Globe, Upload } from 'lucide-react';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithCustomSlotsExample(): React.JSX.Element {
    const bottomActions: DetailBottomAction[] = [
        {
            name: 'Action with URL',
            url: 'https://video.onet.pl/',
            icon: <Globe />,
        },
        {
            name: 'Action with on click',
            onClick: (): void => undefined,
            icon: <Download />,
        },
    ];

    const descriptionItems: DetailDescriptionItem[] = [
        {
            sectionTitle: 'Section one',
            fields: [
                {
                    icon: <Globe />,
                    name: 'With icon',
                    value: 'Published',
                },
                {
                    formatDate: true,
                    name: 'Date formatted',
                    value: '2023-07-27T09:32:09Z',
                },
            ],
        },
        {
            fields: [
                {
                    name: 'List of chips',
                    type: DetailDescriptionItemFieldType.CHIPS,
                    value: ['chip 1', 'chip 2', 'chip 3'],
                },
                {
                    name: 'List of strings',
                    value: ['string 1', 'string 2'],
                },
            ],
            sectionTitle: 'Section two',
        },
    ];

    const main = {
        mediaProps: {
            bottomIcons: [
                {
                    type: 'icon' as const,
                    icon: <Info />,
                    onClick: (): void => undefined,
                    tooltip: 'Info',
                },
                {
                    type: 'icon' as const,
                    icon: <Pencil />,
                    onClick: (): void => undefined,
                    tooltip: 'Edit',
                },
                {
                    type: 'icon' as const,
                    icon: <Printer />,
                    onClick: (): void => undefined,
                    tooltip: 'Print',
                },
                {
                    type: 'icon' as const,
                    icon: <Upload />,
                    onClick: (): void => undefined,
                    tooltip: 'Upload',
                },
            ],
            imageFullScreenPreview: true,
            image: getImagePath(TestImage.BEACH, ImageSize.LARGE),
            objectFit: 'cover' as const,
        },
        title: {
            value: 'Test title lorem ipsum',
            editable: true,
            onSubmit: (): Promise<boolean> => Promise.resolve(true),
            label: 'Title',
        },
        onCloseClick: (): void => undefined,
    };

    return (
        <Box display={'flex'} justifyContent={'center'}>
            <Detail
                bottomActions={bottomActions}
                descriptionItems={descriptionItems}
                main={main}
                slots={{
                    afterMain: (
                        <Box sx={{ bgcolor: 'action.hover', py: 1, textAlign: 'center' }}>Custom slot after main</Box>
                    ),
                    afterDescriptionItems: (
                        <Box sx={{ bgcolor: 'action.hover', py: 1, textAlign: 'center' }}>
                            Custom slot after description items
                        </Box>
                    ),
                    afterBottomActions: (
                        <Box sx={{ bgcolor: 'action.hover', py: 1, textAlign: 'center' }}>
                            Custom slot after bottom actions
                        </Box>
                    ),
                }}
            />
        </Box>
    );
}
