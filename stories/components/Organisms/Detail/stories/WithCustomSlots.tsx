import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Box } from '@mui/material';
import { Download, EditOutlined, InfoOutlined, PrintOutlined, Public, UploadOutlined, Web } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import WithCustomSlotsExampleCode from './code/WithCustomSlotsExample.tsx?raw';
import { Detail, DetailDescriptionItemFieldType } from '../../../../../src/index.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof Detail>;

const Example = (args: React.ComponentProps<typeof Detail>): React.JSX.Element => {
    return <Detail {...args} />;
};

export const WithCustomSlots: Story = {
    args: {
        bottomActions: [
            {
                name: 'ACTION WITH URL',
                url: 'https://video.onet.pl/',
                icon: <Web />,
            },
            {
                name: 'ACTION WITH ON CLICK',
                onClick: action('onClick'),
                icon: <Download />,
            },
        ],
        descriptionItems: [
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
        ],
        main: {
            mediaProps: {
                bottomIcons: [
                    {
                        type: 'icon',
                        icon: <InfoOutlined />,
                        onClick: action('onClick'),
                        tooltip: 'Info',
                    },
                    {
                        type: 'icon',
                        icon: <EditOutlined />,
                        onClick: action('onClick'),
                        tooltip: 'Edit',
                    },
                    {
                        type: 'icon',
                        icon: <PrintOutlined />,
                        onClick: action('onClick'),
                        tooltip: 'Print',
                    },
                    {
                        type: 'icon',
                        icon: <UploadOutlined />,
                        onClick: action('onClick'),
                        tooltip: 'Upload',
                    },
                ],
                imageFullScreenPreview: true,
                image: getImagePath(TestImage.BEACH, ImageSize.LARGE),
                objectFit: 'cover',
                ratio: '4/3',
            },
            title: {
                value: 'Test title lorem ipsum',
                editable: true,
                onSubmit: function cb(): Promise<boolean> {
                    return new Promise((resolve) => {
                        resolve(true);
                    });
                },
                label: 'Title',
            },
            onCloseClick: action('onCloseClick'),
        },
        slots: {
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
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithCustomSlotsExampleCode,
            example: <Example {...args} />,
        });
    },
};
