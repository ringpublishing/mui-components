import React from 'react';
import {
    Detail,
    DetailDescriptionItemFieldLayout,
    DetailDescriptionItemFieldType,
    EditableFieldType,
    CopyIconButton,
    type DetailBottomAction,
    type DetailDescriptionItem,
} from '@ringpublishing/mui-components';
import { Download, Pencil, Info, Printer, Globe, Upload } from 'lucide-react';
import { Box, useTheme } from '@mui/material';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function DefaultExample(): React.JSX.Element {
    const theme = useTheme();

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
        {
            name: 'Action without icon',
            onClick: (): void => undefined,
        },
    ];

    const descriptionItems: DetailDescriptionItem[] = [
        {
            sectionTitle: 'Section one',
            fields: [
                {
                    name: 'Description',
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
                    icon: <Globe />,
                    name: 'With icon',
                    value: 'Published',
                },
                {
                    formatDate: true,
                    name: 'Date formatted',
                    value: '2023-07-27T09:32:09Z',
                },
                {
                    formatDate: false,
                    name: 'Date not formatted',
                    value: '2023-08-31T21:59:59Z',
                },
                {
                    name: 'Icons',
                    value: '',
                    icon: [<Globe key={'0'} />, <Globe key={'1'} />],
                },
                {
                    name: 'Editable',
                    value: 'Editable value',
                    type: DetailDescriptionItemFieldType.EDITABLE,
                    onSubmit: (): Promise<boolean> => Promise.resolve(true),
                },
                {
                    name: 'Editable select',
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
                    name: 'List of strings',
                    value: ['string 1', 'string 2'],
                },
                {
                    name: 'Single string',
                    value: 'string value',
                },
                {
                    name: 'No value',
                    value: '',
                },
                {
                    name: 'With link',
                    value: '#Learn_more',
                    url: 'https://design.ringpublishing.com/',
                },
                {
                    name: 'Number',
                    value: '10',
                },
                {
                    name: 'Single chip',
                    type: DetailDescriptionItemFieldType.CHIPS,
                    value: 'chip value',
                },
                {
                    name: 'List of chips',
                    type: DetailDescriptionItemFieldType.CHIPS,
                    value: ['chip 1', 'chip 2', 'chip 3'],
                    collapsable: true,
                },
                {
                    layout: DetailDescriptionItemFieldLayout.VERTICAL,
                    name: 'List of customised chips',
                    type: DetailDescriptionItemFieldType.CHIPS,
                    value: [
                        {
                            onClick: (): void => undefined,
                            value: 'chip with onClick',
                        },
                        {
                            badgeColor: theme.palette.primary.main,
                            value: 'chip with color',
                        },
                    ],
                },
            ],
            sectionTitle: 'Section two',
        },
        {
            fields: [
                {
                    name: 'With subvalue',
                    subValue: {
                        label: '',
                        value: 'John Doe',
                    },
                    value: '2023-07-27T09:32:08Z',
                },
                {
                    layout: DetailDescriptionItemFieldLayout.VERTICAL,
                    name: 'Identifier (UUID)',
                    value: '1234-5432-2334-1234-5432-2334',
                    icon: (
                        <CopyIconButton
                            size="small"
                            value="1234-5432-2334-1234-5432-2334"
                            onCopied={(): void => undefined}
                        />
                    ),
                },
            ],
            sectionTitle: 'Section three',
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
            image: {
                src: getImagePath(TestImage.CAR, ImageSize.LARGE),
                title: 'The rear of an orange vintage car parked under a wooden carport',
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
