import React from 'react';
import {
    Detail,
    DetailDescriptionItemFieldType,
    DetailDescriptionItem,
    DetailBottomAction,
} from '@ringpublishing/mui-components';
import { Box } from '@mui/material';
import { Download, EditOutlined, InfoOutlined, PrintOutlined, Public, UploadOutlined, Web } from '@mui/icons-material';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithCustomSlotsExample(): React.JSX.Element {
    const bottomActions: DetailBottomAction[] = [
        {
            name: 'ACTION WITH URL',
            url: 'https://video.onet.pl/',
            icon: <Web />,
        },
        {
            name: 'ACTION WITH ON CLICK',
            onClick: (): void => undefined,
            icon: <Download />,
        },
    ];

    const descriptionItems: DetailDescriptionItem[] = [
        {
            sectionTitle: 'SECTION ONE',
            fields: [
                {
                    icon: <Public />,
                    name: 'WITH ICON',
                    value: 'Published',
                },
                {
                    formatDate: true,
                    name: 'DATE FORMATTED',
                    value: '2023-07-27T09:32:09Z',
                },
            ],
        },
        {
            fields: [
                {
                    name: 'LIST OF CHIPS',
                    type: DetailDescriptionItemFieldType.CHIPS,
                    value: ['chip 1', 'chip 2', 'chip 3'],
                },
                {
                    name: 'LIST OF STRINGS',
                    value: ['string 1', 'string 2'],
                },
            ],
            sectionTitle: 'SECTION TWO',
        },
    ];

    const main = {
        mediaProps: {
            bottomIcons: [
                {
                    type: 'icon' as const,
                    icon: <InfoOutlined />,
                    onClick: (): void => undefined,
                    tooltip: 'Info',
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
                        <Box sx={{ backgroundColor: (theme) => theme.palette.common.grey, py: 1, textAlign: 'center' }}>
                            Custom slot after main
                        </Box>
                    ),
                    afterDescriptionItems: (
                        <Box sx={{ backgroundColor: (theme) => theme.palette.common.grey, py: 1, textAlign: 'center' }}>
                            Custom slot after description items
                        </Box>
                    ),
                    afterBottomActions: (
                        <Box sx={{ backgroundColor: (theme) => theme.palette.common.grey, py: 1, textAlign: 'center' }}>
                            Custom slot after bottom actions
                        </Box>
                    ),
                }}
            />
        </Box>
    );
}
