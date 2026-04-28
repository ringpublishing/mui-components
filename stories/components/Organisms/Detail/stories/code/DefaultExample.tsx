import React from 'react';
import {
    Detail,
    DetailDescriptionItemFieldLayout,
    DetailDescriptionItemFieldType,
    EditableFieldType,
} from '@ringpublishing/mui-components';
import type { DetailDescriptionItem, DetailBottomAction } from '@ringpublishing/mui-components';
import {
    ContentCopy,
    Download,
    EditOutlined,
    InfoOutlined,
    PrintOutlined,
    Public,
    UploadOutlined,
    Web,
} from '@mui/icons-material';
import { Box } from '@mui/material';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function DefaultExample(): React.JSX.Element {
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
        {
            name: 'ACTION WITHOUT ICON',
            onClick: (): void => undefined,
        },
    ];

    const descriptionItems: DetailDescriptionItem[] = [
        {
            sectionTitle: 'SECTION ONE',
            fields: [
                {
                    name: 'DESCRIPTION',
                    type: DetailDescriptionItemFieldType.DESCRIPTION,
                    maxLength: 100,
                    layout: DetailDescriptionItemFieldLayout.VERTICAL,
                    showMoreLabel: 'Show more',
                    showLessLabel: 'Show less',
                    value:
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ' +
                        'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                },
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
                {
                    formatDate: false,
                    name: 'DATE NOT FORMATTED',
                    value: '2023-08-31T21:59:59Z',
                },
                {
                    name: 'ICONS',
                    value: '',
                    icon: [<Web key={'0'} />, <Public key={'1'} />],
                },
                {
                    name: 'EDITABLE',
                    value: 'Editable value',
                    type: DetailDescriptionItemFieldType.EDITABLE,
                    onSubmit: (): Promise<boolean> => Promise.resolve(true),
                },
                {
                    name: 'EDITABLE SELECT',
                    value: 'option2',
                    type: DetailDescriptionItemFieldType.EDITABLE,
                    fieldType: EditableFieldType.SELECT,
                    options: [
                        { value: 'option1', label: 'First Option' },
                        { value: 'option2', label: 'Second Option' },
                        { value: 'option3', label: 'Third Option' },
                    ],
                    onSubmit: (): Promise<boolean> => Promise.resolve(true),
                },
            ],
        },
        {
            fields: [
                {
                    name: 'LIST OF STRINGS',
                    value: ['string 1', 'string 2'],
                },
                {
                    name: 'SINGLE STRING',
                    value: 'string value',
                },
                {
                    name: 'NO VALUE',
                    value: '',
                },
                {
                    name: 'WITH LINK',
                    value: '#Learn_more',
                    url: 'https://design.ringpublishing.com/',
                },
                {
                    name: 'NUMBER',
                    value: '10',
                },
                {
                    name: 'SINGLE CHIP',
                    type: DetailDescriptionItemFieldType.CHIPS,
                    value: 'chip value',
                },
                {
                    name: 'LIST OF CHIPS',
                    type: DetailDescriptionItemFieldType.CHIPS,
                    value: ['chip 1', 'chip 2', 'chip 3'],
                    collapsable: true,
                },
                {
                    layout: DetailDescriptionItemFieldLayout.VERTICAL,
                    name: 'LIST OF CUSTOMISED CHIPS',
                    type: DetailDescriptionItemFieldType.CHIPS,
                    value: [
                        {
                            onClick: (): void => undefined,
                            value: 'chip with onClick',
                        },
                        {
                            badgeColor: '#00a7ee',
                            value: 'chip with color',
                        },
                    ],
                },
            ],
            sectionTitle: 'SECTION TWO',
        },
        {
            fields: [
                {
                    name: 'WITH SUBVALUE',
                    subValue: {
                        label: '',
                        value: 'John Doe',
                    },
                    value: '2023-07-27T09:32:08Z',
                },
                {
                    layout: DetailDescriptionItemFieldLayout.VERTICAL,
                    name: 'IDENTIFIER (UUID)',
                    value: '1234-5432-2334-1234-5432-2334',
                    icon: (
                        <ContentCopy
                            onClick={(): void => undefined}
                            sx={{
                                color: '#00A7EE',
                                fontSize: '1.7rem',
                                cursor: 'pointer',
                            }}
                        />
                    ),
                },
            ],
            sectionTitle: 'SECTION THREE',
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
            image: {
                src: getImagePath(TestImage.CAR, ImageSize.LARGE),
                title: TestImage.CAR,
            },
            objectFit: 'cover' as const,
            ratio: '4/3',
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
            <Detail bottomActions={bottomActions} descriptionItems={descriptionItems} main={main} />
        </Box>
    );
}
